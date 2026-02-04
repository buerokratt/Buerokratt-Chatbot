#!/bin/bash
set -e

echo "======================================"
echo "  Bürokratt Chatbot Setup Script"
echo "======================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "Starting database..."
docker-compose up -d users_db

echo "Waiting for database to be healthy..."
until docker-compose ps users_db | grep -q "healthy"; do
    echo "  Waiting for database..."
    sleep 2
done

echo "Running database migrations..."
docker-compose up db_migrations

echo "Seeding database with default user..."
docker-compose up db_seed

echo ""
echo "======================================"
echo "  Setup Complete!"
echo "======================================"
echo ""
echo "You can now start all services with:"
echo "  docker-compose up -d"
echo ""
echo "To login to the application:"
echo "  URL: http://localhost:3004/et/dev-auth"
echo "  Login: EE30303039914"
echo "  Password: (leave empty)"
echo ""
