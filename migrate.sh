#!/bin/bash
docker run --rm --network bykstack -v `pwd`/DSL/Liquibase/changelog:/liquibase/changelog -v `pwd`/DSL/Liquibase/master.yml:/liquibase/master.yml -v `pwd`/DSL/Liquibase/data:/liquibase/data liquibase/liquibase --defaultsFile=/liquibase/changelog/liquibase.properties --changelog-file=master.yml --url=jdbc:postgresql://171.22.247.13:5433/byk?user=byk --password=2nH09n6Gly update
