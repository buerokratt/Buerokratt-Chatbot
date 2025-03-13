INSERT INTO configuration (key, value, created)
VALUES ('isAuthConversations', :isAuthConversations, :created::timestamp with time zone),
       ('authPeriod', :authPeriod, :created::timestamp with time zone),
       ('isAnonymConversations', :isAnonymConversations, :created::timestamp with time zone),
       ('anonymPeriod', :anonymPeriod, :created::timestamp with time zone),
       ('deletionTimeISO', :deletionTimeISO, :created::timestamp with time zone)
    RETURNING key, value;
