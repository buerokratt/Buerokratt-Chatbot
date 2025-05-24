INSERT INTO config.configuration (key, value)
VALUES (
    'isAuthConversations', :isAuthConversations
),
('authPeriod', :authPeriod),
('isAnonymConversations', :isAnonymConversations),
('anonymPeriod', :anonymPeriod),
('deletionTimeISO', :deletionTimeISO)
RETURNING key, value;
