WITH
    active_administrators AS (
        SELECT id_code
        FROM denorm_user_csa_authority_profile_settings
        WHERE
            'ROLE_ADMINISTRATOR' = ANY(authority_name)
            AND id IN (
                SELECT MAX(id)
                FROM denorm_user_csa_authority_profile_settings
                GROUP BY id_code
            )
    ),

    delete_from_denorm_table AS (
        INSERT INTO denorm_user_csa_authority_profile_settings (
            login,
            first_name,
            last_name,
            id_code,
            display_name,
            user_status,
            csa_title,
            csa_email,
            department,
            authority_name,
            status,
            status_comment,
            csa_created,
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
            first_name,
            last_name,
            id_code,
            display_name,
            'deleted',                           -- Set user_status to 'deleted'
            csa_title,
            csa_email,
            department,
            ARRAY[]::VARCHAR[],                  -- Empty authority_name array
            'offline',                           -- Set status to 'offline'
            status_comment,
            csa_created,
            false,                               -- Set active to false
            false,                               -- Reset all notification settings
            false,
            false,
            false,
            false,
            false,
            false
        FROM denorm_user_csa_authority_profile_settings
        WHERE
            id_code = :userIdCode
            AND user_status <> 'deleted'
            AND (
                1 < (SELECT COUNT(id_code) FROM active_administrators)
                OR (
                    1 = (SELECT COUNT(id_code) FROM active_administrators)
                    AND :userIdCode NOT IN (SELECT id_code FROM active_administrators)
                )
            )
        ORDER BY id DESC
        LIMIT 1
    ),

    delete_user AS (
        INSERT INTO "user" (
            login,
            password_hash,
            first_name,
            last_name,
            id_code,
            display_name,
            status,
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
            csa_title,
            csa_email,
            department
        FROM "user"
        WHERE
            id_code = :userIdCode
            AND status <> 'deleted'
            AND (
                1 < (SELECT COUNT(id_code) FROM active_administrators)
                OR (
                    1 = (SELECT COUNT(id_code) FROM active_administrators)
                    AND :userIdCode NOT IN (SELECT id_code FROM active_administrators)
                )
            )
        ORDER BY id DESC
        LIMIT 1
    )

SELECT MAX(status) FROM "user"
WHERE id_code = :userIdCode;
