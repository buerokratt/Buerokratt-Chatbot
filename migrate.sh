#!/bin/bash
docker run --rm --network bykstack -v `pwd`/DSL/Liquibase/liquibase.properties:/liquibase/liquibase.properties -v `pwd`/DSL/Liquibase/changelog:/liquibase/changelog -v `pwd`/DSL/Liquibase/changelog.yaml:/liquibase/changelog.yaml -v `pwd`/DSL/Liquibase/data:/liquibase/data liquibase/liquibase --defaultsFile=/liquibase/liquibase.properties update
