#!/bin/bash
set -e

echo "Waiting for database to be ready..."
sleep 5

echo "Running database migrations..."
docker run --rm --network bykstack \
  -v $(pwd)/DSL/Liquibase/changelog:/liquibase/changelog \
  -v $(pwd)/DSL/Liquibase/master.yml:/liquibase/master.yml \
  -v $(pwd)/DSL/Liquibase/data:/liquibase/data \
  liquibase/liquibase \
  --changelog-file=master.yml \
  --url=jdbc:postgresql://users_db:5432/byk \
  --username=byk \
  --password=01234 \
  update

echo "Seeding default user data..."
docker run --rm --network=bykstack \
  -e PGPASSWORD=01234 \
  -v $(pwd)/seed-data.sql:/seed-data.sql \
  postgres:14.1 \
  psql -h users_db -p 5432 -U byk -d byk -f /seed-data.sql

echo "Database initialization complete!"
