-- liquibase formatted sql
-- changeset ahmedyasser:20260424110000 runInTransaction:false
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_ended_status
    ON chat (ended)
    WHERE ended IS NOT NULL
      AND status <> 'IDLE';

-- rollback DROP INDEX CONCURRENTLY IF EXISTS idx_chat_ended_status;
