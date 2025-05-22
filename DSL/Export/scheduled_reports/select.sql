COPY (
    SELECT *
    FROM scheduled_reports
    WHERE (dataset_id, updated) NOT IN (
        SELECT dataset_id, max(updated)
        FROM scheduled_reports
        GROUP BY dataset_id
    ) AND updated < CURRENT_DATE - INTERVAL '1 day'
) TO stdout WITH csv HEADER;
