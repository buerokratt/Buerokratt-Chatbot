INSERT INTO message (
    chat_base_id,
    base_id,
    content,
    event,
    author_id,
    author_first_name,
    author_last_name,
    author_role,
    rating,
    forwarded_by_user,
    forwarded_from_csa,
    forwarded_to_csa, options
)
VALUES (
    :chatId,
    (CASE
        WHEN :messageId IS NOT NULL AND :messageId <> '' THEN :messageId
        ELSE (GEN_RANDOM_UUID()::VARCHAR)
    END),
    :content,
    :event,
    :authorId,
    :authorFirstName,
    :authorLastName,
    :authorRole,
    (NULLIF(:rating, '')::INTEGER),
    :forwardedByUser,
    :forwardedFromCsa,
    :forwardedToCsa,
    :options
) RETURNING updated;
