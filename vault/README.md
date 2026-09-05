# Vault support for backoffice, CKB, and LLM Module

HashiCorp Vault stores sensitive configuration (DB credentials, API tokens,
LLM/embedding connection secrets, etc.) instead of keeping it in plaintext in
`docker-compose.yml`. This Vault is the single instance intended for
Buerokratt-Chatbot, Common-Knowledge (CKB), and LLM-Module - rather than each
module running its own. Other modules attach to it via the shared `bykstack`
network, using the same container names/ports their own compose files
already reference, so no changes are required on their side to point at it.

## Components

- **`vault`** - the Vault server. KV v2 secrets engine mounted at `secret/`.
  Only reachable on the internal `vault-network` - never published to the
  host, never reachable from `bykstack`-only containers. That network
  boundary is the access control, so the listener itself stays plain HTTP.
- **`vault-init`** - one-shot container that initializes/unseals Vault on
  first run, sets up the KV engine, AppRole auth, every policy/AppRole below
  (backoffice, CKB, LLM Module), seeds the `tim-postgresql` secret, and
  generates CKB's and LLM-Module's RSA encryption keypairs. Safe to re-run -
  it's idempotent.
- **`vault-agent-backoffice`** - a Vault Agent for backoffice's own services.
  It renders secrets to `./vault/agent-out/*.env` files for containers that
  need them as env vars at startup (e.g. `tim-postgresql`), and proxies the
  Vault API on `:8203` at `http://vault-agent-backoffice:8203`.
- **`vault-agent-gui` / `vault-agent-cron` / `vault-agent-llm`** - Vault
  Agents for LLM-Module's `gui`, `cron-manager`, and
  `llm-orchestration-service` containers respectively, proxying on `:8202`,
  `:8203`, `:8201` - the exact host:port LLM-Module's own compose file
  already points those containers at.
- **`vault-agent-cleaner`** - a Vault Agent for CKB's `cleaning-server`,
  proxying on `:8204` - the exact host:port CKB's own compose file already
  points it at.

All Vault Agents follow the same shape: log in once via AppRole (credentials
minted by `vault-init`), renew the token forever, and inject it transparently
for token-less requests - consumers never handle a raw Vault token.

## Path convention

- `secret/backoffice/global/<service>` / `secret/backoffice/<domainId>/<integration>`
  - backoffice's own secrets. `backoffice-admin-policy` grants full
    `create/read/update/delete/list` on all of `secret/backoffice/*`.
- `secret/ckb/llm/connections/*`, `secret/ckb/embeddings/connections/*`,
  `secret/ckb/encryption/{public_key,private_key}` - CKB's secrets.
- `secret/llm-module/llm/connections/*`, `secret/llm-module/embeddings/connections/*`,
  `secret/llm-module/encryption/{public_key,private_key}` - LLM-Module's secrets.

Each module's policies are scoped to its own prefix only, so CKB and
LLM-Module can't read or write each other's connections or encryption keys.

## CKB / LLM-Module policies and AppRoles

| AppRole | Policy | Access |
|---|---|---|
| `ckb-gui-service` | `ckb-gui-policy` | read-only on `ckb/encryption/public_key`; everything else under `ckb/*` denied |
| `ckb-cron-manager-service` | `ckb-cron-manager-policy` | reads both `ckb/encryption/*` keys; full CRUD on `ckb/llm/connections/*` and `ckb/embeddings/connections/*` |
| `ckb-llm-orchestration-service` | `ckb-llm-orchestration-policy` | read/list on `ckb/llm/connections/*` and `ckb/embeddings/connections/*`; `ckb/encryption/*` denied |
| `ckb-cleaner-service` | `ckb-cleaner-policy` | read/list on `ckb/llm/connections/*` only; `ckb/encryption/*` denied |
| `llm-module-gui-service` | `llm-module-gui-policy` | same shape as `ckb-gui-policy`, under `llm-module/*` |
| `llm-module-cron-manager-service` | `llm-module-cron-manager-policy` | same shape as `ckb-cron-manager-policy`, under `llm-module/*` |
| `llm-module-llm-orchestration-service` | `llm-module-llm-orchestration-policy` | same shape as `ckb-llm-orchestration-policy`, under `llm-module/*` |

`ckb-gui-service`, `ckb-cron-manager-service`, and `ckb-llm-orchestration-service`
are fully configured (policy + AppRole + credentials) but have no running
`vault-agent-*` container yet, since CKB's own compose file doesn't currently
wire a dedicated agent for those three (only `cleaning-server` does). Add one
following the `vault-agent-cleaner` pattern once CKB needs it.

## First-time setup

```sh
docker compose up -d vault vault-init vault-agent-backoffice \
  vault-agent-gui vault-agent-cron vault-agent-llm vault-agent-cleaner
```

Any other service that depends on a Vault-sourced secret (currently just
`tim-postgresql`) will wait for `vault-agent-backoffice` to be healthy
before starting. CKB's and LLM-Module's own containers (started from their
own compose files, attached to the shared `bykstack` network) resolve
`vault-agent-gui` / `vault-agent-cron` / `vault-agent-llm` / `vault-agent-cleaner`
by name once this compose stack is up.

## Adding a new secret

1. Pick a path: `secret/backoffice/global/<name>` or
   `secret/backoffice/<domainId>/<name>`.
2. Write it once:
   ```sh
   docker exec vault sh -c 'VAULT_TOKEN=$(jq -r .root_token /vault/data/init.json) \
     vault kv put secret/backoffice/global/<name> key=value'
   ```
3. **Needed at container startup?** Add a `template` block to
   `vault/agent/backoffice-agent.hcl` rendering it to
   `vault/agent-out/<name>.env`, then reference that file via `env_file:`
   in `docker-compose.yml` (see the `tim-postgresql` service for an
   example).
4. **Needed at runtime instead** (e.g. from a DSL step)? Call the agent's
   proxy directly - no token required:
   ```sh
   curl http://vault-agent-backoffice:8203/v1/secret/data/backoffice/<name>
   ```

## Accessing the web UI

`vault` isn't published to the host on purpose (see above), so
`http://localhost:8200` won't work directly. To open the UI in a browser:

1. Get the root token:
   ```sh
   docker exec vault sh -c 'grep -o "\"root_token\":\"[^\"]*\"" /vault/data/init.json | cut -d\" -f4'
   ```
2. Start a temporary bridge container (a plain `-p 8200:8200` on the `vault`
   service itself won't work - Docker refuses to publish a port for a
   container that's only on an `internal: true` network, so the bridge
   needs a leg on `bykstack` too):
   ```sh
   docker run -d --rm --name vault-ui-bridge --network bykstack -p 8200:8200 \
     alpine/socat tcp-listen:8200,fork,reuseaddr tcp-connect:vault:8200
   docker network connect vault-network vault-ui-bridge
   ```
3. Open [http://localhost:8200/ui](http://localhost:8200/ui) and log in with
   the root token from step 1.
4. When done, remove the bridge:
   ```sh
   docker rm -f vault-ui-bridge
   ```

## Verifying

```sh
docker exec vault vault status                                # Initialized: true, Sealed: false
docker exec vault vault policy read backoffice-admin-policy    # CRUD on secret/{data,metadata}/backoffice/*
docker exec tim-postgresql env | grep POSTGRES                 # values now come from Vault
curl http://localhost:8200                                     # fails - vault isn't published to the host
```
