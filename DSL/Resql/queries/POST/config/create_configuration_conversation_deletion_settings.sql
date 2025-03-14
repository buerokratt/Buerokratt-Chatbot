INSERT INTO configuration (key, value, created)
VALUES (
    'isAuthConversations', :isAuthConversations, :created::TIMESTAMP WITH TIME ZONE
),
('authPeriod', :authPeriod, :created::TIMESTAMP WITH TIME ZONE),
('isAnonymConversations', :isAnonymConversations, :created::TIMESTAMP WITH TIME ZONE),
('anonymPeriod', :anonymPeriod, :created::TIMESTAMP WITH TIME ZONE),
('deletionTimeISO', :deletionTimeISO, :created::TIMESTAMP WITH TIME ZONE)
RETURNING key, value;
