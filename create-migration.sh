#!/bin/bash

if [[ $# -eq 0 ]] ; then
    echo 'specify descriptive name for migration file'
    exit 0
fi

echo "-- liquibase formatted sql" > "DSL/Liquibase/changelog/`date '+%s'`-$1.sql"
echo "-- changeset $(git config user.name):`date '+%s'`" >> "DSL/Liquibase/changelog/`date '+%s'`-$1.sql"
