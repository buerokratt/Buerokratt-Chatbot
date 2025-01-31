#!/bin/bash

if [[ $# -eq 0 ]] ; then
    echo 'specify descriptive name for migration file'
    exit 0
fi

timestamp=$(date '+%Y%m%d%H%M%S')
migration_file="DSL/Liquibase/changelog/${timestamp}-$1.sql"

echo "-- liquibase formatted sql" > "$migration_file"
echo "-- changeset $(git config user.name):$timestamp" >> "$migration_file"

echo "Migration file created: $migration_file"
