#!/bin/sh
set -e

VAULT_ADDR="${VAULT_ADDR:-http://vault:8200}"
DATA_DIR="/vault/data"
INIT_FILE="$DATA_DIR/init.json"
INIT_FLAG="$DATA_DIR/.initialized"
CREDENTIALS_DIR="/agent/credentials"

echo "=== Backoffice Vault Initialization ==="

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

    reconcile_secret_id "backoffice-service" "$CREDENTIALS_DIR/role_id" "$CREDENTIALS_DIR/secret_id"
fi

echo "=== Vault init complete ==="
