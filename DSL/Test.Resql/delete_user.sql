-- Simple test script to compare the original and denormalized delete queries
-- For PostgreSQL

-- Setup test tables
DROP TABLE IF EXISTS test_user, test_user_authority, test_customer_support_agent_activity, 
    test_user_profile_settings, test_denorm_user_csa_authority_profile_settings CASCADE;
DROP TYPE IF EXISTS test_user_status, test_status CASCADE;

-- Create custom types
CREATE TYPE test_user_status AS ENUM ('active', 'inactive', 'deleted');
CREATE TYPE test_status AS ENUM ('online', 'offline');

-- Create test tables
CREATE TABLE test_user (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50),
    password_hash VARCHAR(60),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    id_code VARCHAR(50),
    display_name VARCHAR(50),
    status test_user_status,
    created TIMESTAMP WITH TIME ZONE,
    csa_title VARCHAR,
    csa_email VARCHAR,
    department TEXT
);

CREATE TABLE test_user_authority (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50),
    authority_name VARCHAR[],
    created TIMESTAMP WITH TIME ZONE
);

CREATE TABLE test_customer_support_agent_activity (
    id SERIAL PRIMARY KEY,
    id_code VARCHAR,
    active BOOLEAN,
    created TIMESTAMP WITH TIME ZONE,
    status test_status
);

CREATE TABLE test_user_profile_settings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50),
    forwarded_chat_popup_notifications BOOLEAN,
    forwarded_chat_sound_notifications BOOLEAN,
    forwarded_chat_email_notifications BOOLEAN,
    new_chat_popup_notifications BOOLEAN,
    new_chat_sound_notifications BOOLEAN,
    new_chat_email_notifications BOOLEAN,
    use_autocorrect BOOLEAN
);

CREATE TABLE test_denorm_user_csa_authority_profile_settings (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50),
    password_hash VARCHAR(60),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    id_code VARCHAR(50),
    display_name VARCHAR(50),
    user_status test_user_status,
    created TIMESTAMP WITH TIME ZONE,
    csa_title VARCHAR,
    csa_email VARCHAR,
    department TEXT,
    authority_name VARCHAR[],
    status test_status,
    active BOOLEAN,
    forwarded_chat_popup_notifications BOOLEAN,
    forwarded_chat_sound_notifications BOOLEAN,
    forwarded_chat_email_notifications BOOLEAN,
    new_chat_popup_notifications BOOLEAN,
    new_chat_sound_notifications BOOLEAN,
    new_chat_email_notifications BOOLEAN,
    use_autocorrect BOOLEAN
);

-- Create temporary tables to capture results
CREATE TEMPORARY TABLE original_results (
    test_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50),
    user_status test_user_status,
    authority VARCHAR[],
    activity_status test_status,
    settings_popup BOOLEAN
);

CREATE TEMPORARY TABLE denorm_results (
    test_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50),
    user_status test_user_status,
    authority VARCHAR[],
    activity_status test_status,
    settings_popup BOOLEAN
);

-- Define test variables
CREATE TEMPORARY TABLE test_variables (
    test_timestamp TIMESTAMP,
    test_user_id VARCHAR
);
INSERT INTO test_variables VALUES ('2023-01-10 12:00:00', 'USR001');

-- Define convenience function to get variables (to avoid repeating SELECT statements)
CREATE OR REPLACE FUNCTION get_test_var(var_name TEXT) 
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    IF var_name = 'timestamp' THEN
        SELECT test_timestamp::TEXT INTO result FROM test_variables LIMIT 1;
    ELSIF var_name = 'user_id' THEN
        SELECT test_user_id INTO result FROM test_variables LIMIT 1;
    END IF;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insert test data
INSERT INTO test_user (login, password_hash, first_name, last_name, id_code, display_name, status, created, csa_title, csa_email, department) VALUES 
('admin1', 'hash1', 'Admin', 'One', 'ADM001', 'Admin One', 'active', '2023-01-01', 'Admin', 'admin1@test.com', 'IT'),
('admin2', 'hash2', 'Admin', 'Two', 'ADM002', 'Admin Two', 'active', '2023-01-01', 'Admin', 'admin2@test.com', 'IT'),
('user1', 'hash3', 'User', 'One', 'USR001', 'User One', 'active', '2023-01-01', 'Agent', 'user1@test.com', 'Support');

INSERT INTO test_user_authority (user_id, authority_name, created) VALUES
('ADM001', ARRAY['ROLE_ADMINISTRATOR', 'ROLE_USER'], '2023-01-01'),
('ADM002', ARRAY['ROLE_ADMINISTRATOR', 'ROLE_USER'], '2023-01-01'),
('USR001', ARRAY['ROLE_USER'], '2023-01-01');

INSERT INTO test_customer_support_agent_activity (id_code, active, created, status) VALUES
('ADM001', true, '2023-01-01', 'online'),
('ADM002', true, '2023-01-01', 'online'),
('USR001', true, '2023-01-01', 'online');

INSERT INTO test_user_profile_settings (user_id, forwarded_chat_popup_notifications, forwarded_chat_sound_notifications, forwarded_chat_email_notifications, new_chat_popup_notifications, new_chat_sound_notifications, new_chat_email_notifications, use_autocorrect) VALUES
('ADM001', true, true, false, true, true, false, true),
('ADM002', true, true, false, true, true, false, true),
('USR001', true, true, false, true, true, false, true);

-- Populate denormalized table
INSERT INTO test_denorm_user_csa_authority_profile_settings
(login, password_hash, first_name, last_name, id_code, display_name, user_status, created, 
 csa_title, csa_email, department, authority_name, status, active,
 forwarded_chat_popup_notifications, forwarded_chat_sound_notifications,
 forwarded_chat_email_notifications, new_chat_popup_notifications,
 new_chat_sound_notifications, new_chat_email_notifications, use_autocorrect)
SELECT
    u.login, 
    u.password_hash,
    u.first_name,
    u.last_name,
    u.id_code,
    u.display_name,
    u.status,
    u.created,
    u.csa_title,
    u.csa_email,
    u.department,
    ua.authority_name,
    csa.status,
    csa.active,
    ups.forwarded_chat_popup_notifications,
    ups.forwarded_chat_sound_notifications,
    ups.forwarded_chat_email_notifications,
    ups.new_chat_popup_notifications,
    ups.new_chat_sound_notifications,
    ups.new_chat_email_notifications,
    ups.use_autocorrect
FROM
    test_user u
    JOIN test_user_authority ua ON u.id_code = ua.user_id
    JOIN test_customer_support_agent_activity csa ON u.id_code = csa.id_code
    JOIN test_user_profile_settings ups ON u.id_code = ups.user_id;

-- Run the original query with CTEs
WITH
    active_administrators AS (
        SELECT user_id
        FROM test_user_authority
        WHERE
            'ROLE_ADMINISTRATOR' = ANY(authority_name)
            AND id IN (
                SELECT MAX(id)
                FROM test_user_authority
                GROUP BY user_id
            )
    ),

    delete_from_customer_support_activity AS (
        INSERT
        INTO test_customer_support_agent_activity (id_code, active, created, status)
        SELECT
            get_test_var('user_id'),
            false,
            get_test_var('timestamp')::TIMESTAMP,
            'offline'
        WHERE (
            1 < (SELECT COUNT(user_id) FROM active_administrators)
            OR (
                1 = (SELECT COUNT(user_id) FROM active_administrators)
                AND get_test_var('user_id') NOT IN (SELECT user_id FROM active_administrators)
            )
        )
        RETURNING id_code
    ),

    delete_user AS (
        INSERT
        INTO test_user (
            login,
            password_hash,
            first_name,
            last_name,
            id_code,
            display_name,
            status,
            created,
            csa_title,
            csa_email,
            department
        )
        SELECT
            login,
            password_hash,
            first_name,
            last_name,
            id_code,
            display_name,
            'deleted',
            get_test_var('timestamp')::TIMESTAMP,
            csa_title,
            csa_email,
            department
        FROM test_user
        WHERE
            id_code = get_test_var('user_id')
            AND status <> 'deleted'
            AND id IN (
                SELECT MAX(id) FROM test_user
                WHERE id_code = get_test_var('user_id')
            )
            AND (
                1 < (SELECT COUNT(user_id) FROM active_administrators)
                OR (
                    1 = (SELECT COUNT(user_id) FROM active_administrators)
                    AND get_test_var('user_id') NOT IN (SELECT user_id FROM active_administrators)
                )
            )
        RETURNING id_code
    ),

    delete_authority AS (
        INSERT
        INTO test_user_authority (user_id, authority_name, created)
        SELECT
            get_test_var('user_id'),
            ARRAY[]::VARCHAR [],
            get_test_var('timestamp')::TIMESTAMP
        FROM test_user_authority
        WHERE
            1 < (SELECT COUNT(user_id) FROM active_administrators)
            OR (
                1 = (SELECT COUNT(user_id) FROM active_administrators)
                AND get_test_var('user_id') NOT IN (SELECT user_id FROM active_administrators)
            )
        GROUP BY user_id
        LIMIT 1
        RETURNING user_id
    ),

    delete_settings AS (
        INSERT
        INTO test_user_profile_settings (
            user_id,
            forwarded_chat_popup_notifications,
            forwarded_chat_sound_notifications,
            forwarded_chat_email_notifications,
            new_chat_popup_notifications,
            new_chat_sound_notifications,
            new_chat_email_notifications,
            use_autocorrect
        )
        SELECT
            get_test_var('user_id'),
            false,
            false,
            false,
            false,
            false,
            false,
            false
        WHERE
            1 < (SELECT COUNT(user_id) FROM active_administrators)
            OR (
                1 = (SELECT COUNT(user_id) FROM active_administrators)
                AND get_test_var('user_id') NOT IN (SELECT user_id FROM active_administrators)
            )
        RETURNING user_id
    )

SELECT pg_sleep(0.1);
INSERT INTO original_results (user_id, user_status, authority, activity_status, settings_popup)
SELECT 
    u.id_code,
    u.status,
    ua.authority_name,
    csa.status,
    ups.forwarded_chat_popup_notifications
FROM 
    test_user u
    JOIN test_user_authority ua ON u.id_code = ua.user_id
    JOIN test_customer_support_agent_activity csa ON u.id_code = csa.id_code
    JOIN test_user_profile_settings ups ON u.id_code = ups.user_id
WHERE 
    u.id_code = get_test_var('user_id')
ORDER BY 
    u.id DESC, ua.id DESC, csa.id DESC, ups.id DESC
LIMIT 1;

-- Reset test data
TRUNCATE TABLE test_user, test_user_authority, test_customer_support_agent_activity, 
    test_user_profile_settings, test_denorm_user_csa_authority_profile_settings;

-- Reinsert test data
INSERT INTO test_user (login, password_hash, first_name, last_name, id_code, display_name, status, created, csa_title, csa_email, department) VALUES 
('admin1', 'hash1', 'Admin', 'One', 'ADM001', 'Admin One', 'active', '2023-01-01', 'Admin', 'admin1@test.com', 'IT'),
('admin2', 'hash2', 'Admin', 'Two', 'ADM002', 'Admin Two', 'active', '2023-01-01', 'Admin', 'admin2@test.com', 'IT'),
('user1', 'hash3', 'User', 'One', 'USR001', 'User One', 'active', '2023-01-01', 'Agent', 'user1@test.com', 'Support');

INSERT INTO test_user_authority (user_id, authority_name, created) VALUES
('ADM001', ARRAY['ROLE_ADMINISTRATOR', 'ROLE_USER'], '2023-01-01'),
('ADM002', ARRAY['ROLE_ADMINISTRATOR', 'ROLE_USER'], '2023-01-01'),
('USR001', ARRAY['ROLE_USER'], '2023-01-01');

INSERT INTO test_customer_support_agent_activity (id_code, active, created, status) VALUES
('ADM001', true, '2023-01-01', 'online'),
('ADM002', true, '2023-01-01', 'online'),
('USR001', true, '2023-01-01', 'online');

INSERT INTO test_user_profile_settings (user_id, forwarded_chat_popup_notifications, forwarded_chat_sound_notifications, forwarded_chat_email_notifications, new_chat_popup_notifications, new_chat_sound_notifications, new_chat_email_notifications, use_autocorrect) VALUES
('ADM001', true, true, false, true, true, false, true),
('ADM002', true, true, false, true, true, false, true),
('USR001', true, true, false, true, true, false, true);

-- Populate denormalized table
INSERT INTO test_denorm_user_csa_authority_profile_settings
(login, password_hash, first_name, last_name, id_code, display_name, user_status, created, 
 csa_title, csa_email, department, authority_name, status, active,
 forwarded_chat_popup_notifications, forwarded_chat_sound_notifications,
 forwarded_chat_email_notifications, new_chat_popup_notifications,
 new_chat_sound_notifications, new_chat_email_notifications, use_autocorrect)
SELECT
    u.login, 
    u.password_hash,
    u.first_name,
    u.last_name,
    u.id_code,
    u.display_name,
    u.status,
    u.created,
    u.csa_title,
    u.csa_email,
    u.department,
    ua.authority_name,
    csa.status,
    csa.active,
    ups.forwarded_chat_popup_notifications,
    ups.forwarded_chat_sound_notifications,
    ups.forwarded_chat_email_notifications,
    ups.new_chat_popup_notifications,
    ups.new_chat_sound_notifications,
    ups.new_chat_email_notifications,
    ups.use_autocorrect
FROM
    test_user u
    JOIN test_user_authority ua ON u.id_code = ua.user_id
    JOIN test_customer_support_agent_activity csa ON u.id_code = csa.id_code
    JOIN test_user_profile_settings ups ON u.id_code = ups.user_id;

-- Run denormalized query with CTEs
WITH
    active_administrators AS (
        SELECT id_code
        FROM test_denorm_user_csa_authority_profile_settings
        WHERE
            'ROLE_ADMINISTRATOR' = ANY(authority_name)
            AND id IN (
                SELECT MAX(id)
                FROM test_denorm_user_csa_authority_profile_settings
                GROUP BY id_code
            )
    ),

    delete_from_denorm_table AS (
        INSERT INTO test_denorm_user_csa_authority_profile_settings (
            login,
            password_hash,
            first_name,
            last_name,
            id_code,
            display_name,
            user_status,
            created,
            csa_title,
            csa_email,
            department,
            authority_name,
            status,
            active,
            forwarded_chat_popup_notifications,
            forwarded_chat_sound_notifications,
            forwarded_chat_email_notifications,
            new_chat_popup_notifications,
            new_chat_sound_notifications,
            new_chat_email_notifications,
            use_autocorrect
        )
        SELECT
            login,
            password_hash,
            first_name,
            last_name,
            id_code,
            display_name,
            'deleted',
            get_test_var('timestamp')::TIMESTAMP,
            csa_title,
            csa_email,
            department,
            ARRAY[]::VARCHAR[],
            'offline',
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        FROM test_denorm_user_csa_authority_profile_settings
        WHERE
            id_code = get_test_var('user_id')
            AND user_status <> 'deleted'
            AND (
                1 < (SELECT COUNT(id_code) FROM active_administrators)
                OR (
                    1 = (SELECT COUNT(id_code) FROM active_administrators)
                    AND get_test_var('user_id') NOT IN (SELECT id_code FROM active_administrators)
                )
            )
        ORDER BY id DESC
        LIMIT 1
        RETURNING id_code
    ),

    delete_user AS (
        INSERT INTO test_user (
            login,
            password_hash,
            first_name,
            last_name,
            id_code,
            display_name,
            status,
            created,
            csa_title,
            csa_email,
            department
        )
        SELECT
            login,
            password_hash,
            first_name,
            last_name,
            id_code,
            display_name,
            'deleted',
            get_test_var('timestamp')::TIMESTAMP,
            csa_title,
            csa_email,
            department
        FROM test_user
        WHERE
            id_code = get_test_var('user_id')
            AND status <> 'deleted'
            AND (
                1 < (SELECT COUNT(id_code) FROM active_administrators)
                OR (
                    1 = (SELECT COUNT(id_code) FROM active_administrators)
                    AND get_test_var('user_id') NOT IN (SELECT id_code FROM active_administrators)
                )
            )
        ORDER BY id DESC
        LIMIT 1
        RETURNING id_code
    )

SELECT pg_sleep(0.1);
INSERT INTO denorm_results (user_id, user_status, authority, activity_status, settings_popup)
SELECT 
    u.id_code,
    u.user_status,
    u.authority_name,
    u.status,
    u.forwarded_chat_popup_notifications
FROM 
    test_denorm_user_csa_authority_profile_settings u
WHERE 
    u.id_code = get_test_var('user_id')
ORDER BY 
    u.id DESC
LIMIT 1;

-- Compare results
SELECT
    CASE 
        WHEN (
            (SELECT COUNT(*) FROM original_results) = (SELECT COUNT(*) FROM denorm_results) AND
            NOT EXISTS (
                SELECT 1 FROM original_results o
                LEFT JOIN denorm_results d USING (user_id)
                WHERE 
                    o.user_status <> d.user_status OR
                    o.authority <> d.authority OR
                    o.activity_status <> d.activity_status OR
                    o.settings_popup <> d.settings_popup
            )
        ) 
        THEN 'PASS: Queries return identical results'
        ELSE 'FAIL: Queries return different results'
    END AS test_result;

-- Show detailed comparison
SELECT 
    o.user_id,
    o.user_status AS original_status,
    d.user_status AS denorm_status,
    o.authority AS original_authority,
    d.authority AS denorm_authority,
    o.activity_status AS original_activity,
    d.activity_status AS denorm_activity,
    o.settings_popup AS original_settings,
    d.settings_popup AS denorm_settings,
    (o.user_status = d.user_status AND
     o.authority = d.authority AND
     o.activity_status = d.activity_status AND
     o.settings_popup = d.settings_popup) AS match
FROM 
    original_results o
    JOIN denorm_results d USING (user_id);

-- Clean up
DROP FUNCTION IF EXISTS get_test_var;
DROP TABLE test_user, test_user_authority, test_customer_support_agent_activity, 
    test_user_profile_settings, test_denorm_user_csa_authority_profile_settings;
DROP TABLE original_results, denorm_results;
DROP TABLE test_variables;
DROP TYPE test_user_status, test_status;