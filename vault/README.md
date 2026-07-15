# Vault support for backoffice

HashiCorp Vault stores backoffice's sensitive configuration (DB credentials,
API tokens, etc.) instead of keeping it in plaintext in `docker-compose.yml`.

## Components

- **`vault`** - the Vault server. KV v2 secrets engine mounted at `secret/`.
  Only reachable on the internal `vault-network` - never published to the
  host, never reachable from `bykstack`-only containers. That network
  boundary is the access control, so the listener itself stays plain HTTP.
- **`vault-init`** - one-shot container that initializes/unseals Vault on
  first run, sets up the KV engine, AppRole auth, the
  `backoffice-admin-policy`, and seeds the `tim-postgresql` secret. Safe to
  re-run - it's idempotent.
- **`vault-agent-backoffice`** - a Vault Agent that logs in once via AppRole
  and stays authenticated. It:
  - renders secrets to `./vault/agent-out/*.env` files for containers that
    need them as env vars at startup (e.g. `tim-postgresql`);
  - proxies the Vault API on `:8203` so other backoffice services can
    read/write secrets over plain HTTP without ever handling a token -
    reachable at `http://vault-agent-backoffice:8203`.

## Path convention

- `secret/backoffice/global/<service>` - shared secrets, e.g.
  `secret/backoffice/global/tim-postgresql`.
- `secret/backoffice/<domainId>/<integration>` - secrets scoped to one
  backoffice domain/client.

The `backoffice-admin-policy` grants full `create/read/update/delete/list`
access on everything under `secret/backoffice/*`.

## First-time setup

```sh
docker compose up -d vault vault-init vault-agent-backoffice
```

Any other service that depends on a Vault-sourced secret (currently just
`tim-postgresql`) will wait for `vault-agent-backoffice` to be healthy
before starting.

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
