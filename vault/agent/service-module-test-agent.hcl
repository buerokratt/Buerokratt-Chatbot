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
      role_id_file_path                   = "/agent/credentials/service-module-test-service_role_id"
      secret_id_file_path                 = "/agent/credentials/service-module-test-service_secret_id"
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
  address     = "0.0.0.0:8206"
  tls_disable = true
}

api_proxy {
  use_auto_auth_token = true
}
