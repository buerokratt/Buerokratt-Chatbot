#!/bin/bash
docker compose -f testing-docker-compose.yml up -d

docker run --platform linux/amd64 --network=bykstack riaee/byk-users-db:liquibase20220615 --url=jdbc:postgresql://users_db_test:5432/byk --username=byk --password=01234 --changelog-file=./master.yml update

docker run --rm --network bykstack -v `pwd`/DSL/Liquibase/changelog:/liquibase/changelog -v `pwd`/DSL/Liquibase/master.yml:/liquibase/master.yml -v `pwd`/DSL/Liquibase/data:/liquibase/data liquibase/liquibase --defaultsFile=/liquibase/changelog/liquibase.properties --changelog-file=master.yml --url=jdbc:postgresql://users_db_test:5432/byk?user=byk --password=01234 --contexts=test update

docker compose -f testing-docker-compose.yml run --rm tests pytest

docker compose -f testing-docker-compose.yml down -v
