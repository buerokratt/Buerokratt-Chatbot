WITH
    initial_user AS (
        INSERT INTO "user" (
            login,
            id_code,
            first_name,
            last_name,
            display_name,
            status,
            created,
            csa_title,
            csa_email
        )
        SELECT
            :userIdCode,
            :userIdCode,
            :firstName,
            :lastName,
            :firstName,
            'active',
            :created::TIMESTAMP WITH TIME ZONE,
            null,
            null
        WHERE NOT EXISTS (SELECT 1 FROM "user")
        RETURNING id_code
    ),

    initial_user_csa_authority_profile_settings_record AS (
        INSERT INTO denorm_user_csa_authority_profile_settings (
            login,
            id_code,
            first_name,
            last_name,
            display_name,
            user_status,
            authority_name,
            created
        )
        SELECT
            :userIdCode,
            :userIdCode,
            :firstName,
            :lastName,
            :firstName,
            'active',
            ARRAY[:initialUserRole],
            :created::TIMESTAMP WITH TIME ZONE
        FROM initial_user
        RETURNING id_code
    ),

    existing_user AS (
        SELECT
            login,
            password_hash,
            display_name,
            status,
            first_name,
            last_name,
            id_code,
            csa_title,
            csa_email
        FROM "user"
        WHERE
            id_code = :userIdCode
            AND id IN (
                SELECT MAX(id) FROM "user"
                WHERE status <> 'deleted'
                GROUP BY id_code
            )
    )

SELECT :userIdCode AS user_id_code
WHERE
    (SELECT id_code FROM initial_denorm_record) IS NOT null
    OR (SELECT id_code FROM existing_user) IS NOT null;
