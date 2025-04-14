SELECT DISTINCT ON (last_message_timestamp)
    customer_support_display_name,
    last_message_including_empty_content,
    last_message_timestamp
FROM denormalized_chat
WHERE chat_id = :id
ORDER BY last_message_timestamp DESC
LIMIT 6;
