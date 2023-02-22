export enum CHAT_STATUS {
  ENDED = 'ENDED',
  OPEN = 'OPEN',
  REDIRECTED = 'REDIRECTED',
}

export enum CHAT_EVENTS {
  ANSWERED = 'answered',
  TERMINATED = 'terminated',
  CLIENT_LEFT = 'client-left',
  CLIENT_LEFT_WITH_ACCEPTED = 'client-left-with-accepted',
  CLIENT_LEFT_WITH_NO_RESOLUTION = 'client-left-with-no-resolution',
  CLIENT_LEFT_FOR_UNKNOWN_REASONS = 'client-left-for-unknown-reason',
  ACCEPTED = 'accepted',
  HATE_SPEECH = 'hate-speech',
  OTHER = 'other',
  RESPONSE_SENT_TO_CLIENT_EMAIL = 'response-sent-to-client-email',
  GREETING = 'greeting',
  REQUESTED_AUTHENTICATION = 'requested-authentication',
  ASK_PERMISSION = 'ask-permission',
  ASK_PERMISSION_ACCEPTED = 'ask-permission-accepted',
  ASK_PERMISSION_REJECTED = 'ask-permission-rejected',
  ASK_PERMISSION_IGNORED = 'ask-permission-ignored',
  RATING = 'rating',
  REDIRECTED = 'redirected',
  CONTACT_INFORMATION = 'contact-information',
  CONTACT_INFORMATION_REJECTED = 'contact-information-rejected',
  CONTACT_INFORMATION_FULFILLED = 'contact-information-fulfilled',
  REQUESTED_CHAT_FORWARD = 'requested-chat-forward',
  REQUESTED_CHAT_FORWARD_ACCEPTED = 'requested-chat-forward-accepted',
  REQUESTED_CHAT_FORWARD_REJECTED = 'requested-chat-forward-rejected',
}

export interface Chat {
  id: string;
  customerSupportId?: string;
  customerSupportDisplayName?: string;
  endUserId?: string;
  endUserFirstName?: string;
  endUserLastName?: string;
  contactsMessage?: string;
  status: CHAT_STATUS;
  created: string;
  updated: string;
  ended: string;
  lastMessage: string;
  endUserUrl?: string;
  endUserOs?: string;
  lastMessageTimestamp?: string;
  forwardedToName?: string;
  forwardedByUser?: string;
  forwardedFromCsa?: string,
  forwardedToCsa?: string,
  receivedFrom?: string;
  comment: string;
  labels: string;
}

export enum MessageSseEvent {
  READ = 'message-read',
  DELIVERED = 'message-delivered'
}

export type MessageStatus = {
  messageId: string | null;
  readTime: any;
}