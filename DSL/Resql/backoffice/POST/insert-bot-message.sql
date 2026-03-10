INSERT INTO message(chat_base_id, base_id, content, buttons, event, author_timestamp, author_id, author_first_name,
                    author_last_name, author_role, rating, created)
SELECT (SELECT value) ->> 'chatId'          AS chat_base_id,
       (SELECT uuid_in(md5(concat(random()::text, ((SELECT value) ->> 'content')::text))::cstring)),
       (SELECT value) ->> 'content'         AS content,
       (SELECT value) ->> 'buttons'         AS buttons,
       (SELECT value) ->> 'event'        AS event,
       now() + ordinality * interval '1 microsecond',
       (SELECT value) ->> 'authorId'        AS author_id,
       (SELECT value) ->> 'authorFirstName' AS author_first_name,
       (SELECT value) ->> 'authorLastName'  AS author_last_name,
       'buerokratt',
       null,
       now() + ordinality * interval '1 microsecond'
FROM json_array_elements(array_to_json(ARRAY [ :messages ])) WITH ORDINALITY msg;
