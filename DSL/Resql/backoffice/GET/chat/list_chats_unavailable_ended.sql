SELECT
    chat_id AS id,
    customer_support_id,
    customer_support_display_name,
    end_user_id,
    end_user_first_name,
    end_user_last_name,
    end_user_email,
    end_user_phone,
    end_user_os,
    end_user_url,
    status,
    first_message_timestamp AS created,
    updated,
    ended,
    forwarded_to_name,
    received_from,
    labels,
    comment,
    last_message,
    last_message_event,
    contacts_message,
    last_message_timestamp,
    csa_title
FROM (
    SELECT
        chat_id,
        customer_support_id,
        customer_support_display_name,
        end_user_id,
        end_user_first_name,
        end_user_last_name,
        end_user_email,
        end_user_phone,
        end_user_os,
        end_user_url,
        status,
        first_message_timestamp,
        updated,
        ended,
        forwarded_to_name,
        received_from,
        labels,
        comment,
        last_message,
        contacts_message,
        last_message_timestamp,
        CASE
            WHEN :is_csa_title_visible = 'true' THEN csa_title
            ELSE ''
        END AS csa_title,
        last_message_event AS last_message_event,
        created,
        ROW_NUMBER() OVER (PARTITION BY chat_id ORDER BY denormalized_record_created DESC) as rn
    FROM chat.denormalized_chat
) AS subquery
WHERE rn = 1
  AND created::DATE BETWEEN :start::date AND :end::date
  AND ended IS NOT NULL
  AND last_message_event IN (
      'unavailable_holiday',
      'unavailable-contact-information-fulfilled',
      'contact-information-skipped',
      'unavailable_organization',
      'unavailable_csas',
      'unavailable_csas_ask_contacts'
  )
ORDER BY created ASC 
LIMIT :limit;
