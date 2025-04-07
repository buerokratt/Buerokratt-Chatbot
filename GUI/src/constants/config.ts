export const EMERGENCY_NOTICE_LENGTH = 250;
export const WELCOME_MESSAGE_LENGTH = 250;
export const NO_CSA_MESSAGE_LENGTH = 250;
export const BOT_CANNOT_ANSWER_MESSAGE_LENGTH = 250;
export const OUTSIDE_WORKING_HOURS_MESSAGE_LENGTH = 250;
export const USER_IDLE_STATUS_TIMEOUT = 300000; // milliseconds
export const CHAT_INPUT_LENGTH = 500;
export const POPUP_DURATION = 2; // seconds
export const CHAT_HISTORY_PREFERENCES_KEY = 'chat-history-preferences';
export const isHiddenFeaturesEnabled =
  import.meta.env.REACT_APP_ENABLE_HIDDEN_FEATURES?.toLowerCase().trim() ==
    'true' ||
  import.meta.env.REACT_APP_ENABLE_HIDDEN_FEATURES?.toLowerCase().trim() == '1';
