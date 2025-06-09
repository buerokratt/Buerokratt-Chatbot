INSERT INTO widget_domains (name, url, active)
SELECT
    x->>'name',
    x->>'url',
    (x->>'active')::boolean
FROM jsonb_array_elements(:domains::jsonb) AS x;