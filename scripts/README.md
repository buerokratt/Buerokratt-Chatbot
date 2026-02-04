# Setup Scripts

This folder contains all automation scripts for setting up the Bürokratt Chatbot with a local database.

## Files

### `setup.sh`
Main automated setup script. Run this to initialize everything:
```bash
./scripts/setup.sh
```

**What it does:**
1. Starts PostgreSQL database
2. Waits for database to be healthy
3. Runs all database migrations (77 changesets)
4. Seeds default admin user
5. Provides login instructions

### `seed-data.sql`
SQL script that creates the default administrator user.

**User details:**
- Login: EE30303039914
- Name: Oleks Koleks
- Role: ROLE_ADMINISTRATOR
- Email: mail@mail.ee

**Idempotent:** Uses `WHERE NOT EXISTS` checks, safe to run multiple times.

### `init-databases.sh`
PostgreSQL initialization script that creates additional databases on first startup.

**Creates:**
- train_db (for training data)
- services_db (for services)

**Used by:** PostgreSQL container's `/docker-entrypoint-initdb.d/` mechanism.

### `init-db.sh` (deprecated)
Old initialization script. Kept for reference but no longer used.
The functionality is now handled by Docker Compose services.

## Quick Start

```bash
# Run automated setup
./scripts/setup.sh

# Start all services
docker-compose up -d

# Access application
# URL: http://localhost:3004/et/dev-auth
# Login: EE30303039914 (no password)
```

## Reset Database

```bash
docker-compose down
rm -rf data/
./scripts/setup.sh
```

## Architecture

The setup uses Docker Compose service orchestration:

```
users_db (PostgreSQL)
  ↓ (healthcheck)
db_migrations (Liquibase)
  ↓ (depends on: service_completed_successfully)
db_seed (psql)
  ↓
Complete!
```

## Troubleshooting

**Setup fails:**
```bash
# Check logs
docker-compose logs db_migrations
docker-compose logs db_seed

# Retry with clean state
docker-compose down
rm -rf data/
./scripts/setup.sh
```

**Database issues:**
```bash
# Check database status
docker-compose ps users_db

# Check database logs
docker-compose logs users_db

# Connect directly
PGPASSWORD=01234 psql -h localhost -p 5433 -U byk -d byk
```

## For Developers

### Adding New Migrations

1. Add changeset to `DSL/Liquibase/changelog/`
2. Run `docker-compose up db_migrations`
3. Liquibase tracks execution, won't duplicate

### Modifying Seed Data

1. Edit `scripts/seed-data.sql`
2. Keep `WHERE NOT EXISTS` for idempotency
3. Run `docker-compose up db_seed`

### Testing Setup

```bash
# Full clean test
docker-compose down
rm -rf data/
./scripts/setup.sh

# Verify
PGPASSWORD=01234 psql -h localhost -p 5433 -U byk -d byk -c "SELECT * FROM \"user\";"
```
