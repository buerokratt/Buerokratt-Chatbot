ui            = true
api_addr      = "http://0.0.0.0:8200"
disable_mlock = true

listener "tcp" {
  address     = "0.0.0.0:8200"
  # TLS is intentionally left to network isolation: this listener only ever
  # binds inside the internal, non-published "vault-network" (see
  # docker-compose.yml). Terminate TLS in front of Vault (nginx/load balancer)
  # for any deployment where that network boundary doesn't hold.
  tls_disable = 1
}

storage "file" {
  path = "/vault/data"
}
