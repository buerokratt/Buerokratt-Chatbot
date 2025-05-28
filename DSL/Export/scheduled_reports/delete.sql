DELETE FROM analytics.scheduled_reports
WHERE (dataset_id, updated) NOT IN (
    SELECT dataset_id, max(updated)
    FROM analytics.scheduled_reports
    GROUP BY dataset_id
) AND updated < %(export_boundary)s;
