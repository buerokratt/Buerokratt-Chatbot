INSERT INTO chat.message (
    chat_base_id,
    base_id,
    content,
    event,
    author_timestamp,
    created,
    author_id,
    author_first_name,
    author_last_name,
    author_role,
    rating,
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
    CASE 
        WHEN :authorTimestamp::TEXT = 'CURRENT_TIMESTAMP' THEN now()
        ELSE COALESCE(:authorTimestamp::TIMESTAMP WITH TIME ZONE, now())
    END,
    CASE 
        WHEN :created::TEXT = 'CURRENT_TIMESTAMP' THEN now()
        ELSE COALESCE(:created::TIMESTAMP WITH TIME ZONE, now())
    END,
    :authorId,
    :authorFirstName,
    :authorLastName,
    :authorRole::author_role_type,
    (NULLIF(:rating, '')::INTEGER),
    :forwardedByUser,
    :forwardedFromCsa,
    :forwardedToCsa
) RETURNING updated::TEXT;
