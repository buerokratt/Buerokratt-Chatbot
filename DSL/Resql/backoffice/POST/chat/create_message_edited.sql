INSERT INTO message (
    chat_base_id,
    base_id,
    content,
    event,
    author_timestamp,
    author_id,
    author_first_name,
    author_last_name,
    author_role,
    rating,
    created,
    forwarded_by_user,
    forwarded_from_csa,
    forwarded_to_csa
)
VALUES (
    :chatId,
    (CASE
        WHEN :messageId IS NOT NULL AND :messageId <> '' THEN :messageId
        ELSE (GEN_RANDOM_UUID()::VARCHAR)
    END),
    :content,
    LOWER(:event)::event_type,
    :authorTimestamp::TIMESTAMP WITH TIME ZONE,
    :authorId,
    :authorFirstName,
    :authorLastName,
    :authorRole::author_role_type,
    (NULLIF(:rating, '')::INTEGER),
    :created::TIMESTAMP WITH TIME ZONE,
    :forwardedByUser,
    :forwardedFromCsa,
    :forwardedToCsa
) RETURNING updated;
