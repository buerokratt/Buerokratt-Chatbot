INSERT INTO configuration (key, value, created)
VALUES
    (:key, :value, :created::timestamp with time zone);
    (:key2, :value2, :created::timestamp with time zone);