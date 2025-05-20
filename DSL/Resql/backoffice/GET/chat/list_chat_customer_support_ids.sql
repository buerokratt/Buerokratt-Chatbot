SELECT
    DISTINCT customer_support_id
FROM chat
WHERE base_id = :chatId AND customer_support_id <> '' AND customer_support_id IS NOT NULL;