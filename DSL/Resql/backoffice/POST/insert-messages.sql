INSERT INTO message(chat_base_id, base_id, content, event, author_timestamp, author_id, author_first_name,
                    author_last_name, author_role, rating, updated, created)
SELECT :destinationChatId                                               AS chat_base_id,
       (SELECT value) ->> 'baseId'                                      AS base_id,
       (SELECT value) ->> 'content'                                     AS content,
       (SELECT value) ->> 'event'                                       AS event,
       ((SELECT value) ->> 'authorTimestamp')::timestamp with time zone AS author_timestamp,
       (SELECT value) ->> 'authorId'                                    AS author_id,
       (SELECT value) ->> 'authorFirstName'                             AS author_first_name,
       (SELECT value) ->> 'authorLastName'                              AS author_last_name,
       (SELECT value) ->> 'authorRole'                                  AS author_role,
       (SELECT value) ->> 'rating'                                      AS rating,
       ((SELECT value) ->> 'updated')::timestamp with time zone         AS updated,
       ((SELECT value) ->> 'created')::timestamp with time zone         AS created
FROM json_array_elements(array_to_json(ARRAY [ :messages ])) WITH ORDINALITY msg;