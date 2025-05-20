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
    :id,
    :content,
    :event,
    :authorTimestamp::TIMESTAMP WITH TIME ZONE,
    :authorId,
    :authorFirstName,
    :authorLastName,
    :authorRole,
    (NULLIF(:rating, '')::INTEGER),
    :created::TIMESTAMP WITH TIME ZONE,
    :forwardedByUser,
    :forwardedFromCsa,
    :forwardedToCsa
);
