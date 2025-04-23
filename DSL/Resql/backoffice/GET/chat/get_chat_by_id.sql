SELECT
    c.chat_id AS id,
    c.customer_support_id,
    c.customer_support_display_name,
    c.end_user_id,
    c.end_user_first_name,
    c.end_user_last_name,
    c.status,
    c.feedback_text,
    c.feedback_rating,
    c.end_user_email,
    c.end_user_phone,
    c.end_user_os,
    c.end_user_url,
    c.created,
    c.updated,
    c.ended,
    c.external_id,
    c.received_from,
    c.received_from_name,
    c.forwarded_to_name,
    c.forwarded_to,
    c.last_message_including_empty_content,
    c.last_message_timestamp,
    c.csa_title
FROM denormalized_chat c
WHERE chat_id = :id
ORDER BY denormalized_record_created DESC
LIMIT 1;
