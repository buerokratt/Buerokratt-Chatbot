import { CHAT_EVENTS } from "types/chat";
import { Message } from "types/message";

export const isStateChangingEventMessage = (msg: Message): boolean =>
  msg.event === CHAT_EVENTS.GREETING ||
  msg.event === CHAT_EVENTS.ASK_PERMISSION_IGNORED ||
  (msg.event === CHAT_EVENTS.CONTACT_INFORMATION && msg.content?.length === 0) ||
  msg.event === CHAT_EVENTS.ANSWERED ||
  msg.event === CHAT_EVENTS.READ ||
  msg.event === CHAT_EVENTS.RATING ||
  msg.event === CHAT_EVENTS.TERMINATED;
