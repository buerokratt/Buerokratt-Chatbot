/*
declaration:
  version: 0.1
  description: "Insert emergency notice configuration including text, schedule, and visibility flag"
  method: post
  accepts: json
  returns: json
  namespace: config
  allowlist:
    body:
      - field: emergencyNoticeText
        type: string
        description: "Text content of the emergency notice"
      - field: emergencyNoticeStartISO
        type: string
        description: "Start time of the emergency notice (ISO 8601 format)"
      - field: emergencyNoticeEndISO
        type: string
        description: "End time of the emergency notice (ISO 8601 format)"
      - field: isEmergencyNoticeVisible
        type: string
        description: "Flag indicating whether the emergency notice should be visible"
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
VALUES
('emergencyNoticeText', :emergencyNoticeText),
(
    'emergencyNoticeStartISO',
    :emergencyNoticeStartISO
),
('emergencyNoticeEndISO', :emergencyNoticeEndISO),
(
    'isEmergencyNoticeVisible',
    :isEmergencyNoticeVisible
)
RETURNING key, value;
