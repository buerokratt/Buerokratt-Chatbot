# Vault Agent for backoffice services.
#
# - Authenticates once via AppRole (credentials minted by vault-init.sh) and
#   renews its own token forever - callers never see a raw Vault token.
# - Renders boot-time secrets (e.g. tim-postgresql's DB password) to env
#   files consumed via `env_file:` in docker-compose.yml.
# - Exposes an API-proxy listener on :8203 so runtime callers (Ruuter/
#   CronManager DSL steps) can read/write secret/backoffice/* over plain
#   HTTP without a token - the agent injects auth on their behalf.

vault {
  address = "http://vault:8200"
  retry {
    num_retries = 5
  }
}

auto_auth {
  method "approle" {
    mount_path = "auth/approle"
    config = {
      role_id_file_path                   = "/agent/credentials/role_id"
      secret_id_file_path                 = "/agent/credentials/secret_id"
      remove_secret_id_file_after_reading = false
    }
  }

  sink "file" {
    config = {
      # /vault/secrets is already a mounted, existing directory (see
      # docker-compose.yml) - Vault Agent does not create parent dirs for
      # sink files, so this avoids a separate volume just for the token.
      path = "/vault/secrets/.agent-token"
      mode = 0640
    }
  }
}

cache {
  default_lease_duration = "30m"
}

listener "tcp" {
  address     = "0.0.0.0:8203"
  tls_disable = true
}

api_proxy {
  use_auto_auth_token = true
}

template {
  source      = "/vault/templates/tim-postgresql.ctmpl"
  destination = "/vault/secrets/tim-postgresql.env"
}
