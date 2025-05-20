#!/bin/bash

if [[ $# -eq 0 ]] ; then
    echo 'specify descriptive name for migration file'
    exit 0
fi

timestamp=$(date '+%Y%m%d%H%M%S')
base_path="DSL/Liquibase/"


sql_migration_file="changelog/${timestamp}-$1.sql"
sql_migration_file_path="${base_path}${sql_migration_file}"
echo "-- liquibase formatted sql" > "$sql_migration_file_path"
echo "-- changeset $(git config user.name):$timestamp ignore:true" >> "$sql_migration_file_path"

echo "SQL Migration file created: $sql_migration_file_path"


rollback_sql_migration_file="changelog/${timestamp}-rollback.sql"
rollback_sql_migration_file_path="${base_path}${rollback_sql_migration_file}"
echo "-- liquibase formatted sql" > "$rollback_sql_migration_file_path"
echo "-- changeset $(git config user.name):$timestamp ignore:true" >> "$rollback_sql_migration_file_path"

echo "Rollback Migration file created: $rollback_sql_migration_file_path"


liquibase_migration_file_path="DSL/Liquibase/changelog/${timestamp}-$1.xml"
echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" > "$liquibase_migration_file_path"
echo "<databaseChangeLog xmlns=\"http://www.liquibase.org/xml/ns/dbchangelog\"" >> "$liquibase_migration_file_path"
echo "                   xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"" >> "$liquibase_migration_file_path"
echo "                   xsi:schemaLocation=\"http://www.liquibase.org/xml/ns/dbchangelog" >> "$liquibase_migration_file_path"
echo "http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.1.xsd\">" >> "$liquibase_migration_file_path"
echo "    <changeSet id=\"$timestamp\" author=\"$(git config user.name)\">" >> "$liquibase_migration_file_path"
echo "        <sqlFile path=\"${sql_migration_file}\" />" >> "$liquibase_migration_file_path"
echo "        <rollback>" >> "$liquibase_migration_file_path"
echo "            <sqlFile path=\"${rollback_sql_migration_file}\" />" >> "$liquibase_migration_file_path"
echo "        </rollback>" >> "$liquibase_migration_file_path"
echo "    </changeSet>" >> "$liquibase_migration_file_path"
echo "</databaseChangeLog>" >> "$liquibase_migration_file_path"

echo "Liquibase migration file created: $liquibase_migration_file_path"