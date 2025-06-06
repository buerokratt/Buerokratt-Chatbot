INSERT INTO widget_domains (name, url, active)
SELECT
    x->>'name',
    x->>'url',
    (x->>'active')::boolean
FROM jsonb_array_elements(:widget-domains::jsonb) AS x;