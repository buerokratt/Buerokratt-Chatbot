#!/bin/bash

docker run --rm --network bykstack -v `pwd`/DSL/Liquibase/test_data_changelog:/liquibase/test_data_changelog -v `pwd`/DSL/Liquibase/test.yml:/liquibase/test.yml -v `pwd`/DSL/Liquibase/data:/liquibase/data liquibase/liquibase --defaultsFile=/liquibase/changelog/liquibase.properties --changelog-file=test.yml --url=jdbc:postgresql://users_db:5432/byk?user=byk --password=01234 --contexts=test update
