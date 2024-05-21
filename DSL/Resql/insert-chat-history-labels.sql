INSERT INTO chat (
  base_id,
  customer_support_id,
  customer_support_display_name,
  end_user_id,
  end_user_first_name,
  end_user_last_name,
  status,
  created,
  updated,
  ended,
  end_user_os,
  end_user_url,
  feedback_rating,
  feedback_text,
  forwarded_to,
  received_from,
  external_id,
  forwarded_to_name,
  received_from_name,
  csa_title,
  labels,
  end_user_email,
  end_user_phone
)
SELECT 
  base_id,
  customer_support_id,
  customer_support_display_name,
  end_user_id,
  end_user_first_name,
  end_user_last_name,
  status,
  created,
  updated,
  ended,
  end_user_os,
  end_user_url,
  feedback_rating,
  feedback_text,
  forwarded_to,
  received_from,
  external_id,
  forwarded_to_name,
  received_from_name,
  csa_title,
  ARRAY [ :labels ],
  end_user_email,
  end_user_phone
FROM chat
WHERE base_id = :chatId
ORDER BY id DESC
LIMIT 1;

