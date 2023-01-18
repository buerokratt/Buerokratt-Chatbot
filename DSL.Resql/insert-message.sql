INSERT INTO message(chat_base_id, base_id, content, event, author_timestamp, author_id, author_first_name,
                    author_last_name, author_role, rating, created,forwarded_by_csa,
                    forwarded_from_csa,forwarded_to_csa,forward_received_from_csa, forward_received_by_csa)
VALUES (:chatId, :messageId, :content, :event, :authorTimestamp::timestamp with time zone, :authorId, :authorFirstName, :authorLastName,
        :authorRole, :rating, :created::timestamp with time zone, :forwardedByCsa,
        :forwardedFromCsa,:forwardedToCsa, :forwardReceivedFromCsa,:forwardReceivedByCsa);