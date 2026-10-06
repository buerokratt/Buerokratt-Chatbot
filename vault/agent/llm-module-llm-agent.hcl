# Vault Agent for LLM-Module's llm-orchestration-service.
#
# - Authenticates once via AppRole (credentials minted by vault-init.sh) and
#   renews its own token forever - the llm-orchestration-service container
#   never sees a raw Vault token.
# - Exposes an API-proxy listener on :8201 - the same host:port LLM-Module's
#   own compose file already points its llm-orchestration-service container
#   at - so no changes are needed on that side once it's attached to this
#   Vault instead of its own.

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
      role_id_file_path                   = "/agent/credentials/llm-module-llm-orchestration-service_role_id"
      secret_id_file_path                 = "/agent/credentials/llm-module-llm-orchestration-service_secret_id"
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
  address     = "0.0.0.0:8201"
  tls_disable = true
}

api_proxy {
  use_auto_auth_token = true
}
