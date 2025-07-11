WITH configuration_values AS (
    SELECT id,
           KEY,
           value
    FROM configuration
    WHERE KEY IN ('feedbackActive', 
                  'feedbackQuestion', 
                  'feedbackNoticeActive',
                  'feedbackNotice')
      AND id IN (SELECT max(id) FROM configuration GROUP BY KEY)
      AND NOT deleted
)
SELECT
    MAX(CASE WHEN KEY = 'feedbackActive' THEN value END) AS feedback_active,
    MAX(CASE WHEN KEY = 'feedbackQuestion' THEN value END) AS feedback_question,
    MAX(CASE WHEN KEY = 'feedbackNoticeActive' THEN value END) AS feedback_notice_active,
    MAX(CASE WHEN KEY = 'feedbackNotice' THEN value END) AS feedback_notice
FROM configuration_values;
