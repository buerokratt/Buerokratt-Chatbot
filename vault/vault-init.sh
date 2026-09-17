#!/bin/sh
set -e

VAULT_ADDR="${VAULT_ADDR:-http://vault:8200}"
DATA_DIR="/vault/data"
INIT_FILE="$DATA_DIR/init.json"
INIT_FLAG="$DATA_DIR/.initialized"
CREDENTIALS_DIR="/agent/credentials"

echo "=== Vault Initialization (backoffice, CKB, LLM Module) ==="

# ---------------------------------------------------------------------------
# Helpers (used on every run, not just first-time init)
# ---------------------------------------------------------------------------

# Create or update an AppRole issuing a PERIODIC token (no max_ttl): the agent
# renews it forever and never has to re-run approle/login in steady state.
# secret_id_ttl=0 + secret_id_num_uses=0 keep the secret_id valid across
# restarts. Idempotent - safe to call on every run.
upsert_approle() {
    role="$1"; policy="$2"; period="$3"
    wget -q -O- --post-data='{"token_policies":["'"$policy"'"],"token_period":"'"$period"'","token_num_uses":0,"secret_id_ttl":"0","secret_id_num_uses":0,"bind_secret_id":true}' \
        --header="X-Vault-Token: $ROOT_TOKEN" \
        --header='Content-Type: application/json' \
        "$VAULT_ADDR/v1/auth/approle/role/$role" >/dev/null
}

# Ensure a role_id file exists on disk; fetch from Vault if missing.
ensure_role_id() {
    role="$1"; rid_file="$2"
    if [ -f "$rid_file" ] && [ -s "$rid_file" ]; then
        return 0
    fi
    echo "Fetching role_id for $role..."
    wget -q -O- --header="X-Vault-Token: $ROOT_TOKEN" \
        "$VAULT_ADDR/v1/auth/approle/role/$role/role-id" | jq -r '.data.role_id' > "$rid_file"
    chmod 640 "$rid_file"
}

# Return 0 if the on-disk role_id + secret_id still authenticate, 1 otherwise.
validate_secret_id() {
    rid_file="$1"; sid_file="$2"
    [ -f "$rid_file" ] && [ -f "$sid_file" ] || return 1
    rid=$(cat "$rid_file"); sid=$(cat "$sid_file")
    [ -n "$rid" ] && [ -n "$sid" ] || return 1
    resp=$(wget -q -O- \
        --post-data="{\"role_id\":\"$rid\",\"secret_id\":\"$sid\"}" \
        --header='Content-Type: application/json' \
        "$VAULT_ADDR/v1/auth/approle/login" 2>/dev/null) || return 1
    echo "$resp" | grep -q '"client_token"' || return 1
    return 0
}

# Mint a fresh secret_id for a role and write it to disk.
mint_secret_id() {
    role="$1"; sid_file="$2"
    wget -q -O- --post-data='' \
        --header="X-Vault-Token: $ROOT_TOKEN" \
        "$VAULT_ADDR/v1/auth/approle/role/$role/secret-id" | jq -r '.data.secret_id' > "$sid_file"
    chmod 640 "$sid_file"
}

# Reuse the existing secret_id if it still authenticates; otherwise mint a
# new one. Keeps one stable secret_id across restarts instead of rotating it
# every boot.
reconcile_secret_id() {
    role="$1"; rid_file="$2"; sid_file="$3"
    ensure_role_id "$role" "$rid_file"
    if validate_secret_id "$rid_file" "$sid_file"; then
        echo "$role: existing secret_id still valid - reusing"
    else
        echo "$role: secret_id invalid or missing - minting a new one"
        mint_secret_id "$role" "$sid_file"
    fi
}

# ---------------------------------------------------------------------------
# CKB / LLM Module support
# authenticate and authorize Common-Knowledge's and LLM-Module's services
# instead of each module running its own Vault stack.
# ---------------------------------------------------------------------------

# Create or update an ACL policy from its HCL body. Idempotent - safe on every run.
put_policy() {
    name="$1"; policy="$2"
    policy_json=$(echo "$policy" | jq -Rs '{"policy":.}')
    wget -q -O- --post-data="$policy_json" \
        --header="X-Vault-Token: $ROOT_TOKEN" \
        --header='Content-Type: application/json' \
        "$VAULT_ADDR/v1/sys/policies/acl/$name" >/dev/null
}

# Policies for CKB's and LLM-Module's services, scoped to their own secret/
# path prefix (secret/ckb/* and secret/llm-module/*) so the two modules can't
# read or write each other's connections/encryption keys. Bodies mirror what
# each module's own (now superseded) vault-init script already granted.
create_module_policies() {
    for module in ckb llm-module; do
        put_policy "$module-gui-policy" \
"path \"secret/data/$module/encryption/public_key\" { capabilities = [\"read\"] }
path \"secret/metadata/$module/encryption/public_key\" { capabilities = [\"read\"] }
path \"secret/data/$module/encryption/private_key\" { capabilities = [\"deny\"] }
path \"secret/data/$module/llm/*\" { capabilities = [\"deny\"] }
path \"secret/data/$module/embeddings/*\" { capabilities = [\"deny\"] }"

        put_policy "$module-cron-manager-policy" \
"path \"secret/data/$module/encryption/public_key\" { capabilities = [\"read\"] }
path \"secret/metadata/$module/encryption/public_key\" { capabilities = [\"read\"] }
path \"secret/data/$module/encryption/private_key\" { capabilities = [\"read\"] }
path \"secret/metadata/$module/encryption/private_key\" { capabilities = [\"read\"] }
path \"secret/data/$module/llm/connections/*\" { capabilities = [\"create\", \"read\", \"update\", \"delete\"] }
path \"secret/metadata/$module/llm/connections/*\" { capabilities = [\"read\", \"list\", \"delete\"] }
path \"secret/data/$module/embeddings/connections/*\" { capabilities = [\"create\", \"read\", \"update\", \"delete\"] }
path \"secret/metadata/$module/embeddings/connections/*\" { capabilities = [\"read\", \"list\", \"delete\"] }
path \"auth/token/lookup-self\" { capabilities = [\"read\"] }"

        put_policy "$module-llm-orchestration-policy" \
"path \"secret/data/$module/llm/connections/*\" { capabilities = [\"read\", \"list\"] }
path \"secret/metadata/$module/llm/connections/*\" { capabilities = [\"read\", \"list\"] }
path \"secret/data/$module/embeddings/connections/*\" { capabilities = [\"read\", \"list\"] }
path \"secret/metadata/$module/embeddings/connections/*\" { capabilities = [\"read\", \"list\"] }
path \"secret/data/$module/encryption/*\" { capabilities = [\"deny\"] }
path \"auth/token/lookup-self\" { capabilities = [\"read\"] }"
    done

    # CKB-only: the cleaning-server has no encryption-key access, just
    # read-only access to the LLM connections it needs for cleanup jobs.
    put_policy "ckb-cleaner-policy" \
'path "secret/data/ckb/llm/connections/*" { capabilities = ["read", "list"] }
path "secret/metadata/ckb/llm/connections/*" { capabilities = ["read", "list"] }
path "secret/data/ckb/encryption/*" { capabilities = ["deny"] }
path "auth/token/lookup-self" { capabilities = ["read"] }'
}

# Apply the CKB and LLM-Module AppRole definitions. Periodic tokens, same as
# backoffice-service - called on every run so config changes (e.g. token
# period) land without re-initializing Vault.
configure_module_approles() {
    upsert_approle "ckb-gui-service"                      "ckb-gui-policy"                      "20m"
    upsert_approle "ckb-cron-manager-service"             "ckb-cron-manager-policy"             "30m"
    upsert_approle "ckb-llm-orchestration-service"        "ckb-llm-orchestration-policy"        "1h"
    upsert_approle "ckb-cleaner-service"                  "ckb-cleaner-policy"                  "1h"
    upsert_approle "llm-module-gui-service"               "llm-module-gui-policy"               "20m"
    upsert_approle "llm-module-cron-manager-service"      "llm-module-cron-manager-policy"      "30m"
    upsert_approle "llm-module-llm-orchestration-service" "llm-module-llm-orchestration-policy" "1h"
}

# Reconcile (reuse-or-mint) every CKB/LLM-Module secret_id. reconcile_secret_id
# already handles the true-first-time case too (ensure_role_id creates the
# role_id, then a missing secret_id fails validation and gets minted), so this
# is safe to call unconditionally on every run - first deploy or redeploy.
reconcile_module_secret_ids() {
    for role in ckb-gui-service ckb-cron-manager-service ckb-llm-orchestration-service ckb-cleaner-service \
                llm-module-gui-service llm-module-cron-manager-service llm-module-llm-orchestration-service; do
        reconcile_secret_id "$role" "$CREDENTIALS_DIR/${role}_role_id" "$CREDENTIALS_DIR/${role}_secret_id"
    done
}

# Return 0 if secret/data/<path> already exists in Vault, 1 otherwise.
secret_exists() {
    path="$1"
    wget -q -O- --header="X-Vault-Token: $ROOT_TOKEN" "$VAULT_ADDR/v1/secret/data/$path" 2>/dev/null \
        | jq -e '.data.data' >/dev/null 2>&1
}

# Generate a module's RSA-2048 keypair only if it doesn't already have one.
# Never regenerates an existing keypair on redeploy - that would silently
# break decryption of anything already encrypted with the old public key.
ensure_rsa_keypair() {
    module="$1"
    if secret_exists "$module/encryption/public_key"; then
        echo "$module: RSA keypair already exists - skipping"
    else
        echo "$module: generating RSA keypair"
        generate_and_store_rsa_keypair "$module"
    fi
}

# Generate an RSA-2048 keypair and store it at secret/<module>/encryption/{public_key,private_key}.
# Each module's GUI encrypts credentials client-side with the public key;
# only that module's cron-manager can read the private key to decrypt them.
# Called only via ensure_rsa_keypair above - never call directly on redeploy.
generate_and_store_rsa_keypair() {
    module="$1"
    key_dir="/tmp/rsa-$module-$$"
    mkdir -p "$key_dir"

    if ! openssl genrsa -out "$key_dir/private.pem" 2048 2>/dev/null; then
        echo "ERROR: Failed to generate private key for $module"; rm -rf "$key_dir"; return 1
    fi
    if ! openssl rsa -in "$key_dir/private.pem" -pubout -out "$key_dir/public.pem" 2>/dev/null; then
        echo "ERROR: Failed to extract public key for $module"; rm -rf "$key_dir"; return 1
    fi

    public_key=$(sed ':a;N;$!ba;s/\n/\\n/g' "$key_dir/public.pem")
    private_key=$(sed ':a;N;$!ba;s/\n/\\n/g' "$key_dir/private.pem")
    created_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    key_id="rsa-keypair-$(date +%s)"

    wget -q -O- --post-data='{"data":{"key":"'"$public_key"'","algorithm":"RSA-OAEP","key_size":2048,"key_id":"'"$key_id"'","created_at":"'"$created_at"'"}}' \
        --header="X-Vault-Token: $ROOT_TOKEN" \
        --header='Content-Type: application/json' \
        "$VAULT_ADDR/v1/secret/data/$module/encryption/public_key" >/dev/null

    wget -q -O- --post-data='{"data":{"key":"'"$private_key"'","algorithm":"RSA-OAEP","key_size":2048,"key_id":"'"$key_id"'","created_at":"'"$created_at"'"}}' \
        --header="X-Vault-Token: $ROOT_TOKEN" \
        --header='Content-Type: application/json' \
        "$VAULT_ADDR/v1/secret/data/$module/encryption/private_key" >/dev/null

    rm -rf "$key_dir"
}

# ---------------------------------------------------------------------------
# Wait for Vault to be reachable
# ---------------------------------------------------------------------------

echo "Waiting for Vault..."
for i in $(seq 1 30); do
    if wget -q -O- "$VAULT_ADDR/v1/sys/health" >/dev/null 2>&1; then
        echo "Vault is reachable"
        break
    fi
    echo "Waiting... ($i/30)"
    sleep 2
done

mkdir -p "$CREDENTIALS_DIR"

if [ ! -f "$INIT_FLAG" ]; then
    echo "=== FIRST TIME DEPLOYMENT ==="

    echo "Initializing Vault (1 key share / 1 threshold - single-node local dev)..."
    wget -q -O- --post-data='{"secret_shares":1,"secret_threshold":1}' \
        --header='Content-Type: application/json' \
        "$VAULT_ADDR/v1/sys/init" > "$INIT_FILE"

    ROOT_TOKEN=$(jq -r '.root_token' "$INIT_FILE")
    UNSEAL_KEY=$(jq -r '.keys_base64[0]' "$INIT_FILE")
    export VAULT_TOKEN="$ROOT_TOKEN"
    chmod 600 "$INIT_FILE"

    echo "Unsealing Vault..."
    wget -q -O- --post-data="{\"key\":\"$UNSEAL_KEY\"}" \
        --header='Content-Type: application/json' \
        "$VAULT_ADDR/v1/sys/unseal" >/dev/null
    sleep 2

    echo "Enabling KV v2 secrets engine at secret/..."
    wget -q -O- --post-data='{"type":"kv","options":{"version":"2"}}' \
        --header="X-Vault-Token: $ROOT_TOKEN" \
        --header='Content-Type: application/json' \
        "$VAULT_ADDR/v1/sys/mounts/secret" >/dev/null 2>&1 || echo "KV already enabled"

    echo "Enabling AppRole auth..."
    wget -q -O- --post-data='{"type":"approle"}' \
        --header="X-Vault-Token: $ROOT_TOKEN" \
        --header='Content-Type: application/json' \
        "$VAULT_ADDR/v1/sys/auth/approle" >/dev/null 2>&1 || echo "AppRole already enabled"

    # Single admin policy: full CRUD on secret/backoffice/* satisfies
    # "Admins have read/write access to secret/backoffice/*" (issue #2077).
    # The same policy is bound to the backoffice-service AppRole below,
    # since the backoffice app writes secrets to Vault on the admin's
    # behalf.
    echo "Creating backoffice-admin-policy..."
    BACKOFFICE_POLICY='path "secret/data/backoffice/*" { capabilities = ["create", "read", "update", "delete", "list"] }
path "secret/metadata/backoffice/*" { capabilities = ["read", "list", "delete"] }'
    BACKOFFICE_POLICY_JSON=$(echo "$BACKOFFICE_POLICY" | jq -Rs '{"policy":.}')
    wget -q -O- --post-data="$BACKOFFICE_POLICY_JSON" \
        --header="X-Vault-Token: $ROOT_TOKEN" \
        --header='Content-Type: application/json' \
        "$VAULT_ADDR/v1/sys/policies/acl/backoffice-admin-policy" >/dev/null

    echo "Creating backoffice-service AppRole..."
    upsert_approle "backoffice-service" "backoffice-admin-policy" "1h"

    echo "Fetching backoffice-service credentials..."
    ensure_role_id "backoffice-service" "$CREDENTIALS_DIR/role_id"
    mint_secret_id "backoffice-service" "$CREDENTIALS_DIR/secret_id"

    echo "Seeding secret/backoffice/global/tim-postgresql (representative migrated secret)..."
    wget -q -O- --post-data='{"data":{"POSTGRES_USER":"tim","POSTGRES_PASSWORD":"123","POSTGRES_DB":"tim","POSTGRES_HOST_AUTH_METHOD":"trust"}}' \
        --header="X-Vault-Token: $ROOT_TOKEN" \
        --header='Content-Type: application/json' \
        "$VAULT_ADDR/v1/secret/data/backoffice/global/tim-postgresql" >/dev/null

    echo "Creating CKB and LLM-Module policies..."
    create_module_policies

    echo "Creating CKB and LLM-Module AppRoles..."
    configure_module_approles

    echo "Fetching CKB and LLM-Module credentials..."
    reconcile_module_secret_ids

    echo "Generating RSA keypairs for CKB and LLM-Module encryption..."
    ensure_rsa_keypair "ckb"
    ensure_rsa_keypair "llm-module"

    touch "$INIT_FLAG"
    echo "=== First time setup complete ==="
else
    echo "=== SUBSEQUENT DEPLOYMENT ==="

    SEALED=$(wget -q -O- "$VAULT_ADDR/v1/sys/seal-status" | jq -r '.sealed')
    if [ "$SEALED" = "true" ]; then
        echo "Vault is sealed. Unsealing..."
        UNSEAL_KEY=$(jq -r '.keys_base64[0]' "$INIT_FILE")
        wget -q -O- --post-data="{\"key\":\"$UNSEAL_KEY\"}" \
            --header='Content-Type: application/json' \
            "$VAULT_ADDR/v1/sys/unseal" >/dev/null
        sleep 2
    else
        echo "Vault is already unsealed"
    fi

    ROOT_TOKEN=$(jq -r '.root_token' "$INIT_FILE")
    export VAULT_TOKEN="$ROOT_TOKEN"

    # Re-apply the AppRole definition so config changes (e.g. token period)
    # take effect on redeploy without re-initializing Vault. Idempotent and
    # does not invalidate the existing secret_id.
    upsert_approle "backoffice-service" "backoffice-admin-policy" "1h"

    # Re-apply CKB/LLM-Module policies + AppRoles too, and generate their RSA
    # keypairs if this vault is being upgraded from an .initialized state
    # that never ran the first-time block above for them.
    create_module_policies
    configure_module_approles
    ensure_rsa_keypair "ckb"
    ensure_rsa_keypair "llm-module"

    reconcile_secret_id "backoffice-service" "$CREDENTIALS_DIR/role_id" "$CREDENTIALS_DIR/secret_id"
    reconcile_module_secret_ids
fi

echo "=== Vault init complete ==="
