INSERT INTO chat.message (
    chat_base_id,
    base_id,
    content,
    buttons,
    event,
    author_timestamp,
    author_id,
    author_first_name,
    author_last_name, author_role, rating, created, updated
)
SELECT
    (SELECT value) ->> 'chatId' AS chat_base_id,
    (
        SELECT
            UUID_IN(
                MD5(
                    CONCAT(RANDOM()::TEXT, ((SELECT value) ->> 'content')::TEXT)
                )::CSTRING
            )
    ),
    (SELECT value) ->> 'content' AS content,
    (SELECT value) ->> 'buttons' AS buttons,
    ((SELECT value) ->> 'event')::event_type AS event,
    NOW() + ordinality * INTERVAL '1 microsecond',
    (SELECT value) ->> 'authorId' AS author_id,
    (SELECT value) ->> 'authorFirstName' AS author_first_name,
    (SELECT value) ->> 'authorLastName' AS author_last_name,
    'buerokratt'::author_role_type,
    null,
    NOW() + ordinality * INTERVAL '1 microsecond',
    NOW() + ordinality * INTERVAL '1 microsecond'
FROM JSON_ARRAY_ELEMENTS(ARRAY_TO_JSON(ARRAY[:messages])) WITH ORDINALITY
RETURNING updated::TEXT;
