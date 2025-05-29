-- liquibase formatted sql
-- changeset Artsiom Beida:20250524200711 ignore:true
ALTER TABLE allowed_statuses ALTER COLUMN name TYPE TEXT;

ALTER TABLE authority ALTER COLUMN name TYPE TEXT;

ALTER TABLE chat ALTER COLUMN base_id TYPE TEXT;
ALTER TABLE chat ALTER COLUMN customer_support_id TYPE TEXT;
ALTER TABLE chat ALTER COLUMN customer_support_display_name TYPE TEXT;
ALTER TABLE chat ALTER COLUMN end_user_id TYPE TEXT;
ALTER TABLE chat ALTER COLUMN end_user_first_name TYPE TEXT;
ALTER TABLE chat ALTER COLUMN end_user_last_name TYPE TEXT;
ALTER TABLE chat ALTER COLUMN end_user_os TYPE TEXT;
ALTER TABLE chat ALTER COLUMN end_user_url TYPE TEXT;
ALTER TABLE chat ALTER COLUMN feedback_text TYPE TEXT;
ALTER TABLE chat ALTER COLUMN forwarded_to TYPE TEXT;
ALTER TABLE chat ALTER COLUMN received_from TYPE TEXT;
ALTER TABLE chat ALTER COLUMN external_id TYPE TEXT;
ALTER TABLE chat ALTER COLUMN forwarded_to_name TYPE TEXT;
ALTER TABLE chat ALTER COLUMN received_from_name TYPE TEXT;
ALTER TABLE chat ALTER COLUMN csa_title TYPE TEXT;
ALTER TABLE chat ALTER COLUMN labels TYPE TEXT[];
ALTER TABLE chat ALTER COLUMN end_user_email TYPE TEXT;
ALTER TABLE chat ALTER COLUMN end_user_phone TYPE TEXT;

ALTER TABLE chat_history_comments ALTER COLUMN chat_id TYPE TEXT;
ALTER TABLE chat_history_comments ALTER COLUMN comment TYPE TEXT;

ALTER TABLE configuration ALTER COLUMN key TYPE TEXT;

ALTER TABLE denormalized_chat ALTER COLUMN chat_id TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN customer_support_id TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN customer_support_display_name TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN customer_support_first_name TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN customer_support_last_name TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN end_user_id TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN end_user_first_name TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN end_user_last_name TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN end_user_email TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN end_user_phone TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN end_user_os TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN end_user_url TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN last_message_author_id TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN forwarded_to TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN forwarded_to_name TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN received_from TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN received_from_name TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN external_id TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN comment_author TYPE TEXT;
ALTER TABLE denormalized_chat ALTER COLUMN labels TYPE TEXT[];

ALTER TABLE denormalized_user_data ALTER COLUMN login TYPE TEXT;
ALTER TABLE denormalized_user_data ALTER COLUMN first_name TYPE TEXT;
ALTER TABLE denormalized_user_data ALTER COLUMN last_name TYPE TEXT;
ALTER TABLE denormalized_user_data ALTER COLUMN id_code TYPE TEXT;
ALTER TABLE denormalized_user_data ALTER COLUMN display_name TYPE TEXT;
ALTER TABLE denormalized_user_data ALTER COLUMN csa_title TYPE TEXT;
ALTER TABLE denormalized_user_data ALTER COLUMN csa_email TYPE TEXT;

ALTER TABLE establishment ALTER COLUMN name TYPE TEXT;
ALTER TABLE establishment ALTER COLUMN url TYPE TEXT;
ALTER TABLE establishment ALTER COLUMN base_id TYPE TEXT;

ALTER TABLE message ALTER COLUMN chat_base_id TYPE TEXT;
ALTER TABLE message ALTER COLUMN base_id TYPE TEXT;
ALTER TABLE message ALTER COLUMN author_id TYPE TEXT;
ALTER TABLE message ALTER COLUMN author_first_name TYPE TEXT;
ALTER TABLE message ALTER COLUMN author_last_name TYPE TEXT;
ALTER TABLE message ALTER COLUMN forwarded_by_user TYPE TEXT;
ALTER TABLE message ALTER COLUMN forwarded_from_csa TYPE TEXT;
ALTER TABLE message ALTER COLUMN forwarded_to_csa TYPE TEXT;

ALTER TABLE message_preview ALTER COLUMN content TYPE TEXT;
ALTER TABLE message_preview ALTER COLUMN chat_base_id TYPE TEXT;

ALTER TABLE request_nonces ALTER COLUMN nonce TYPE TEXT;

ALTER TABLE "user" ALTER COLUMN login TYPE TEXT;
ALTER TABLE "user" ALTER COLUMN password_hash TYPE TEXT;
ALTER TABLE "user" ALTER COLUMN first_name TYPE TEXT;
ALTER TABLE "user" ALTER COLUMN last_name TYPE TEXT;
ALTER TABLE "user" ALTER COLUMN id_code TYPE TEXT;
ALTER TABLE "user" ALTER COLUMN display_name TYPE TEXT;
ALTER TABLE "user" ALTER COLUMN csa_title TYPE TEXT;
ALTER TABLE "user" ALTER COLUMN csa_email TYPE TEXT;

ALTER TABLE user_page_preferences ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE user_page_preferences ALTER COLUMN page_name TYPE TEXT;
