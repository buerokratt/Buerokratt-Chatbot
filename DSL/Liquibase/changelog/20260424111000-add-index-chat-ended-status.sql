-- liquibase formatted sql
-- changeset ahmedyasser:20260424111000 runInTransaction:false

DROP INDEX CONCURRENTLY IF EXISTS idx_chat_ended_status;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_ended_status
    ON chat (ended, base_id, id)
    WHERE ended IS NOT NULL
      AND status <> 'IDLE';
