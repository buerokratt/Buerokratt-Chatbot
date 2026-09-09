# Vault Agent for CKB's cleaning-server.
#
# - Authenticates once via AppRole (credentials minted by vault-init.sh) and
#   renews its own token forever - CKB's cleaning-server container never
#   sees a raw Vault token.
# - Exposes an API-proxy listener on :8204 - the same host:port CKB's own
#   compose file already points its cleaning-server container at - so no
#   changes are needed on that side once it's attached to this Vault instead
#   of its own.

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
      role_id_file_path                   = "/agent/credentials/ckb-cleaner-service_role_id"
      secret_id_file_path                 = "/agent/credentials/ckb-cleaner-service_secret_id"
      remove_secret_id_file_after_reading = false
    }
  }

  sink "file" {
    config = {
      path = "/vault/secrets/.agent-token"
      mode = 0640
    }
  }
}

cache {
  default_lease_duration = "1h"
}

listener "tcp" {
  address     = "0.0.0.0:8204"
  tls_disable = true
}

api_proxy {
  use_auto_auth_token = true
}
