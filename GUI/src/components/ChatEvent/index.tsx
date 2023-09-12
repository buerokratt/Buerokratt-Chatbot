import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Message } from 'types/message';
import { CHAT_EVENTS } from 'types/chat';
import { format } from 'date-fns';
import './Chat.scss';

type ChatEventProps = {
  message: Message;
};

const ChatEvent: FC<ChatEventProps> = ({ message }) => {
  const { t } = useTranslation();
  const {
    event,
    authorTimestamp,
    forwardedByUser,
    forwardedFromCsa,
    forwardedToCsa,
  } = message;

  let EVENT_PARAMS;

  switch (event) {
    case CHAT_EVENTS.REDIRECTED:
      {
        if (forwardedByUser === forwardedFromCsa) {
          EVENT_PARAMS = t('chat.redirectedMessageByOwner', {
            from: forwardedFromCsa,
            to: forwardedToCsa,
            date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
          });
        } else if (forwardedByUser === forwardedToCsa) {
          EVENT_PARAMS = t('chat.redirectedMessageClaimed', {
            from: forwardedFromCsa,
            to: forwardedToCsa,
            date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
          });
        } else {
          EVENT_PARAMS = t('chat.redirectedMessage', {
            user: forwardedByUser,
            from: forwardedFromCsa,
            to: forwardedToCsa,
            date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
          });
        }
      }
      break;
    case CHAT_EVENTS.ANSWERED:
      EVENT_PARAMS = t('chat.events.answered', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.TERMINATED:
      EVENT_PARAMS = t('chat.events.terminated', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.CLIENT_LEFT:
      EVENT_PARAMS = t('chat.events.client-left', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.CLIENT_LEFT_WITH_ACCEPTED:
      EVENT_PARAMS = t('chat.events.client-left-with-accepted', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.CLIENT_LEFT_WITH_NO_RESOLUTION:
      EVENT_PARAMS = t('chat.events.client-left-with-no-resolution', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.CLIENT_LEFT_FOR_UNKNOWN_REASONS:
      EVENT_PARAMS = t('chat.events.client-left-for-unknown-reason', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.ACCEPTED:
      EVENT_PARAMS = t('chat.events.accepted', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.HATE_SPEECH:
      EVENT_PARAMS = t('chat.events.hate-speech', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.OTHER:
      EVENT_PARAMS = t('chat.events.other', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.RESPONSE_SENT_TO_CLIENT_EMAIL:
      EVENT_PARAMS = t('chat.events.response-sent-to-client-email', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.GREETING:
      EVENT_PARAMS = t('chat.events.greeting', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.REQUESTED_AUTHENTICATION:
      EVENT_PARAMS = t('chat.events.requested-authentication', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.AUTHENTICATION_SUCCESSFUL:
      EVENT_PARAMS = t('chat.events.authentication-successful', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.AUTHENTICATION_FAILED:
      EVENT_PARAMS = t('chat.events.authentication-failed', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.ASK_PERMISSION:
      EVENT_PARAMS = t('chat.events.ask-permission', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.ASK_PERMISSION_ACCEPTED:
      EVENT_PARAMS = t('chat.events.ask-permission-accepted', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.ASK_PERMISSION_REJECTED:
      EVENT_PARAMS = t('chat.events.ask-permission-rejected', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.ASK_PERMISSION_IGNORED:
      EVENT_PARAMS = t('chat.events.ask-permission-ignored', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.RATING:
      EVENT_PARAMS = t('chat.events.rating', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.CONTACT_INFORMATION:
      EVENT_PARAMS = t('chat.events.contact-information', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.CONTACT_INFORMATION_REJECTED:
      EVENT_PARAMS = t('chat.events.contact-information-rejected', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.CONTACT_INFORMATION_FULFILLED:
      EVENT_PARAMS = t('chat.events.contact-information-fulfilled', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.REQUESTED_CHAT_FORWARD:
      EVENT_PARAMS = t('chat.events.requested-chat-forward', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.REQUESTED_CHAT_FORWARD_ACCEPTED:
      EVENT_PARAMS = t('chat.events.requested-chat-forward-accepted', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    case CHAT_EVENTS.REQUESTED_CHAT_FORWARD_REJECTED:
      EVENT_PARAMS = t('chat.events.requested-chat-forward-rejected', {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
    default:
      EVENT_PARAMS = t(`chat.events.${event?.toLowerCase()}`, {
        date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:mm:ss'),
      });
      break;
  }

  return (
    <div className="active-chat__event-message">
      <p>{EVENT_PARAMS}</p>
    </div>
  );
};

export default ChatEvent;
