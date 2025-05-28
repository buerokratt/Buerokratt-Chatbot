/*
declaration:
  version: 0.1
  description: "Insert multiple predefined configuration settings for conversation retention and deletion policies"
  method: post
  accepts: json
  returns: json
  namespace: config
  allowlist:
    body:
      - field: isAuthConversations
        type: string
        description: "Enable or disable authenticated conversations retention"
      - field: authPeriod
        type: string
        description: "Retention period for authenticated conversations"
      - field: isAnonymConversations
        type: string
        description: "Enable or disable anonymous conversations retention"
      - field: anonymPeriod
        type: string
        description: "Retention period for anonymous conversations"
      - field: deletionTimeISO
        type: string
        description: "ISO-formatted time at which deletion jobs are scheduled"
  response:
    fields:
      - field: key
        type: string
        description: "Configuration key name"
      - field: value
        type: string
        description: "Associated configuration value"
*/
INSERT INTO config.configuration (key, value)
VALUES (
    'isAuthConversations', :isAuthConversations
),
('authPeriod', :authPeriod),
('isAnonymConversations', :isAnonymConversations),
('anonymPeriod', :anonymPeriod),
('deletionTimeISO', :deletionTimeISO)
RETURNING key, value;
