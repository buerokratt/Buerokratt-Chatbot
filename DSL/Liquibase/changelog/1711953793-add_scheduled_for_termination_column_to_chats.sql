-- liquibase formatted sql
-- changeset baha-a:1711953793
ALTER TABLE chat
ADD scheduled_for_terminated DATE NULL;
