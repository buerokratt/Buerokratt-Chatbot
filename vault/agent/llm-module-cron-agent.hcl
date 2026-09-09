# Vault Agent for LLM-Module's cron-manager service.
#
# - Authenticates once via AppRole (credentials minted by vault-init.sh) and
#   renews its own token forever - LLM-Module's cron-manager container never
#   sees a raw Vault token.
# - Exposes an API-proxy listener on :8203 - the same host:port LLM-Module's
#   own compose file already points its cron-manager container at - so no
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
      role_id_file_path                   = "/agent/credentials/llm-module-cron-manager-service_role_id"
      secret_id_file_path                 = "/agent/credentials/llm-module-cron-manager-service_secret_id"
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
  default_lease_duration = "30m"
}

listener "tcp" {
  address     = "0.0.0.0:8203"
  tls_disable = true
}

api_proxy {
  use_auto_auth_token = true
}
