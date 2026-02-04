#!/bin/bash
set -e

# Create additional databases as specified in POSTGRES_MULTIPLE_DATABASES
# Format: database1,database2,database3

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
  echo "Creating additional databases: $POSTGRES_MULTIPLE_DATABASES"
  for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
    echo "  Creating database: $db"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
      CREATE DATABASE $db;
      GRANT ALL PRIVILEGES ON DATABASE $db TO $POSTGRES_USER;
EOSQL
  done
  echo "Additional databases created successfully"
fi
