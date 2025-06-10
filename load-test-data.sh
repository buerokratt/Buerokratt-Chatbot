#!/bin/bash

docker run --rm --network bykstack -v `pwd`/DSL/Liquibase/liquibase.properties:/liquibase/liquibase.properties -v `pwd`/DSL/Liquibase/test_data_changelog:/liquibase/test_data_changelog -v `pwd`/DSL/Liquibase/test.yaml:/liquibase/changelog.yaml -v `pwd`/DSL/Liquibase/data:/liquibase/data liquibase/liquibase --defaultsFile=/liquibase/liquibase.properties --contexts=test update
