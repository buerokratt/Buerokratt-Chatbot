SELECT
    login,
    first_name,
    last_name,
    id_code,
    display_name,
    CASE
        WHEN :is_csa_title_visible = 'true' THEN csa_title
        ELSE ''
    END AS csa_title,
    csa_email,
    department,
    authority_name AS authorities,
    status AS customer_support_status,
    status_comment,
    csa_created AS status_comment_time_stamp,
    CEIL(COUNT(*) OVER () / :page_size::DECIMAL) AS total_pages
FROM auth_users.denormalized_user_data AS d_1
WHERE
    user_status <> 'deleted'
    AND ARRAY_LENGTH(authority_name, 1) > 0
    AND created = (
        SELECT MAX(d_2.created)
        FROM auth_users.denormalized_user_data AS d_2
        WHERE d_1.id_code = d_2.id_code
    )
    AND (authority_name)::TEXT[] && 
        (SELECT array_agg(trim(e)) FROM 
            unnest(string_to_array(
            btrim(:roles, '[]'), 
            ','
            )) AS e)::TEXT ARRAY
    AND (
        :search_display_name_and_csa_title IS NULL
        OR display_name ILIKE '%' || :search_display_name_and_csa_title || '%'
        OR csa_title ILIKE '%' || :search_display_name_and_csa_title || '%'
    )
    AND (
        :search_full_name_and_csa_title IS NULL
        OR (first_name || ' ' || last_name) ILIKE '%' || :search_full_name_and_csa_title || '%'
        OR csa_title ILIKE '%' || :search_full_name_and_csa_title || '%'
    )
    AND ((:show_active_only)::boolean <> TRUE OR status <> 'offline')
    AND (:search_full_name IS NULL OR (
        (first_name || ' ' || last_name) ILIKE '%' || :search_full_name || '%'
    ))
    AND (:search_id_code IS NULL OR id_code ILIKE '%' || :search_id_code || '%')
    AND (
        :search_display_name IS NULL
        OR display_name ILIKE '%' || :search_display_name || '%'
    )
    AND (:search_csa_title IS NULL OR csa_title ILIKE '%' || :search_csa_title || '%')
    AND (:search_csa_email IS NULL OR csa_email ILIKE '%' || :search_csa_email || '%')
    AND (:search_authority IS NULL OR EXISTS (
        SELECT 1
        FROM UNNEST(authority_name) AS authority
        WHERE authority::TEXT ILIKE '%' || :search_authority || '%'
    ))
    AND (
        :search_department IS NULL
        OR department ILIKE '%' || :search_department || '%'
    )
    AND id_code NOT IN (:excluded_users)
ORDER BY
    CASE WHEN :sorting = 'name asc' THEN first_name END ASC,
    CASE WHEN :sorting = 'name desc' THEN first_name END DESC,
    CASE WHEN :sorting = 'idCode asc' THEN id_code END ASC,
    CASE WHEN :sorting = 'idCode desc' THEN id_code END DESC,
    CASE WHEN :sorting = 'Role asc' THEN authority_name END ASC,
    CASE WHEN :sorting = 'Role desc' THEN authority_name END DESC,
    CASE WHEN :sorting = 'displayName asc' THEN display_name END ASC,
    CASE WHEN :sorting = 'displayName desc' THEN display_name END DESC,
    CASE WHEN :sorting = 'csaTitle asc' THEN csa_title END ASC,
    CASE WHEN :sorting = 'csaTitle desc' THEN csa_title END DESC,
    CASE WHEN :sorting = 'csaEmail asc' THEN csa_email END ASC,
    CASE WHEN :sorting = 'csaEmail desc' THEN csa_email END DESC,
    CASE WHEN :sorting = 'department asc' THEN department END ASC,
    CASE WHEN :sorting = 'department desc' THEN department END DESC,
    CASE WHEN :sorting = 'customerSupportStatus asc' THEN status END ASC,
    CASE WHEN :sorting = 'customerSupportStatus desc' THEN status END DESC
OFFSET ((GREATEST((:page)::integer, 1) - 1) * (:page_size)::integer) LIMIT (:page_size)::integer;