INSERT INTO message(chat_base_id, base_id, content, event, author_timestamp, author_id, author_first_name,
                    author_last_name, author_role, rating, created, forwarded_by_user, forwarded_from_csa,
                    forwarded_to_csa, options)
VALUES (:chatId,
        (CASE
             WHEN :messageId IS NOT NULL AND :messageId <> '' THEN :messageId
             ELSE (gen_random_uuid()::varchar) END),
        :content, :event, :authorTimestamp::timestamp with time zone, :authorId, :authorFirstName,
        :authorLastName,
        :authorRole, (NULLIF(:rating, '')::integer), :created::timestamp with time zone, :forwardedByUser, :forwardedFromCsa, :forwardedToCsa,
        :options);
