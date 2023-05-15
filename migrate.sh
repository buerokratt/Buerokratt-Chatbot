#!/bin/bash
docker run --rm --network bykstack -v `pwd`/DSL.Liquibase/changelog:/liquibase/changelog -v `pwd`/DSL.Liquibase/master.yml:/liquibase/master.yml -v `pwd`/DSL.Liquibase/data:/liquibase/data liquibase/liquibase --defaultsFile=/liquibase/changelog/liquibase.properties --changelog-file=master.yml --url=jdbc:postgresql://users_db:5432/byk?user=byk --password=01234 update
