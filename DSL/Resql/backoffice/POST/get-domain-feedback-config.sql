WITH configuration_values AS (
    SELECT id,
           KEY,
           value
    FROM configuration
    WHERE KEY IN ('feedbackActive',
                  'feedbackQuestion',
                  'feedbackNoticeActive',
                  'feedbackNotice')
      AND "domain" = :domainUUID::UUID
      AND id IN (SELECT max(id) FROM configuration WHERE "domain" = :domainUUID::UUID GROUP BY KEY)
      AND NOT deleted
),
global_rating_scale AS (
    SELECT value AS is_five_rating_scale
    FROM configuration
    WHERE KEY = 'isFiveRatingScale'
      AND "domain" IS NULL
      AND id IN (SELECT max(id) FROM configuration WHERE KEY = 'isFiveRatingScale' AND "domain" IS NULL)
      AND NOT deleted
)
SELECT
    MAX(CASE WHEN KEY = 'feedbackActive' THEN value END) AS feedback_active,
    MAX(CASE WHEN KEY = 'feedbackQuestion' THEN value END) AS feedback_question,
    MAX(CASE WHEN KEY = 'feedbackNoticeActive' THEN value END) AS feedback_notice_active,
    MAX(CASE WHEN KEY = 'feedbackNotice' THEN value END) AS feedback_notice,
    (SELECT is_five_rating_scale FROM global_rating_scale LIMIT 1) AS is_five_rating_scale
FROM configuration_values;
