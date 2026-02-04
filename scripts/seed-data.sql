-- Seed default user for development
-- This script is idempotent - it can be run multiple times safely

-- Insert default user if not exists
INSERT INTO "user" (login, password_hash, first_name, last_name, id_code, display_name, status, created, csa_title, csa_email, jira_account_id, department, smax_account_id)
SELECT 'EE30303039914', 'OK', 'Kliendi', 'Teenindaja', 'EE30303039914', 'Oleks Koleks', 'active', NOW(), 'Vastaja', 'mail@mail.ee', '', 'Vastaja', ''
WHERE NOT EXISTS (
    SELECT 1 FROM "user" WHERE id_code = 'EE30303039914' LIMIT 1
);

-- Add administrator authority to the user if not exists
INSERT INTO user_authority (user_id, authority_name, created)
SELECT 'EE30303039914', '{ROLE_ADMINISTRATOR}', NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM user_authority WHERE user_id = 'EE30303039914' LIMIT 1
);
