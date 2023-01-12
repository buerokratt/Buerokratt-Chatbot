export enum CHAT_STATUS {
  ENDED = 'ENDED',
  OPEN = 'OPEN',
  REDIRECTED = 'REDIRECTED',
}

export enum CHAT_EVENTS {
  ANSWERED = 'answered',
  TERMINATED = 'terminated',
  CLIENT_LEFT = 'client-left',
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
  receivedFrom?: string;
}
