INSERT INTO message (
    chat_base_id,
    base_id,
    content,
    event,
    author_timestamp,
    author_id,
    author_first_name,
    author_last_name, author_role, rating, created
)
VALUES (
    :chatId,
    :messageId,
    ARRAY[:content],
    :event,
    :authorTimestamp::TIMESTAMP WITH TIME ZONE,
    :authorId,
    :authorFirstName,
    :authorLastName,
    :authorRole, (NULLIF(:rating, '')::INTEGER), :created::TIMESTAMP WITH TIME ZONE
);
