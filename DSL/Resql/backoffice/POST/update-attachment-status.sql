UPDATE attachment
SET
    status =:status,
    s3_bucket = COALESCE(:s3Bucket, s3_bucket),
    updated =:updated::timestamp with time zone
WHERE
    base_id =:baseId;