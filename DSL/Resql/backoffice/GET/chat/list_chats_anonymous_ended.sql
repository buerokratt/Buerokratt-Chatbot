SELECT base_id
FROM chat.chat
WHERE
    ended IS NOT NULL
    AND status = 'ENDED'
    AND end_user_id = ''
    AND ended < :fromDate::TIMESTAMP WITH TIME ZONE;
