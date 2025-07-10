INSERT INTO customer_support_agent_activity (id_code, active, created, status, status_comment)
VALUES (:userIdCode, :active, :created::timestamp with time zone, :status::status, :statusComment)
