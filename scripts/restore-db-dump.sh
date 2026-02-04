#!/bin/bash
set -e

echo "Restoring database from remote dump..."
PGPASSWORD=01234 psql -h localhost -p 5433 -U byk -d byk -f /Users/igor/Projects/devtailor/burokratt/Buerokratt-Chatbot/scripts/remote_db_dump.sql

echo ""
echo "Database restored successfully!"
echo ""
echo "Checking tables..."
PGPASSWORD=01234 psql -h localhost -p 5433 -U byk -d byk -c "SELECT COUNT(*) FROM \"user\";"
PGPASSWORD=01234 psql -h localhost -p 5433 -U byk -d byk -c "SELECT COUNT(*) FROM configuration;"
