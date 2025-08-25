INSERT INTO widget_domains (name, url, active, domain_id)
SELECT
    x->>'name',
    x->>'url',
    (x->>'active')::boolean,
    (x->>'domainId')::UUID
FROM jsonb_array_elements(:domains::jsonb) AS x;