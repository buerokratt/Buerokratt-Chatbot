import { FC, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import { Button, Dialog, FormInput, FormSelect, Track } from 'components';
import { ReactComponent as BykLogoWhite } from 'assets/logo-white.svg';
import { Message } from 'types/message';
import './Chat.scss';

type ChatProps = {
  messages: Message[];
}

type GroupedMessage = {
  name: string;
  // type: 'buerokratt' | 'end-user' | 'chatbot' | 'backoffice-user'
}

const Chat: FC<ChatProps> = ({ messages }) => {
  const { t } = useTranslation();

  // const messageGroups = useMemo(() => {
  //   if (!messages) return null;
  //   const groupedMessages: GroupedMessage[] = [];
  //   let lastName: string | null = null;
  //   let group: GroupedMessage | null = null;
  //   for (let message of conversation.messages) {
  //     if (lastName === null || lastName !== message.name) {
  //       group = {
  //         name: message.name,
  //         type: message.type,
  //         messages: [],
  //       };
  //       groupedMessages.push(group);
  //     }
  //     if (group) {
  //       group.messages.push(message);
  //     }
  //     lastName = message.name;
  //   }
  //   return groupedMessages;
  // }, [messages]);

  return (
    <div className='chat'>
      {/*{messageGroups && messageGroups.map((group, index) => (*/}
      {/*  <div className={clsx(['chat__group', `chat__group--${group.type}`])} key={`group-${index}`}>*/}
      {/*    <div className='chat__group-initials'>*/}
      {/*      {group.type === 'bot' ? (*/}
      {/*        <BykLogoWhite height={24} />*/}
      {/*      ) : (*/}
      {/*        <>{group.name.split(' ').map((n) => n[0]).join('').toUpperCase()}</>*/}
      {/*      )}*/}
      {/*    </div>*/}
      {/*    <div className='chat__group-name'>{group.name}</div>*/}
      {/*    <div className='chat__messages'>*/}
      {/*      {group.messages.map((message, i) => (*/}
      {/*        <div className='chat__message' key={`message-${i}`}>*/}
      {/*          {message.type === 'client' ? (*/}
      {/*            <button*/}
      {/*              className='chat__message-text'*/}
      {/*              onClick={() => setMarkedMessage(message.message)}*/}
      {/*            >*/}
      {/*              {message.message}*/}
      {/*            </button>*/}
      {/*          ) : (*/}
      {/*            <div className='chat__message-text'>{message.message}</div>*/}
      {/*          )}*/}
      {/*          <time dateTime={message.sentAt} className='chat__message-date'>*/}
      {/*            {format(new Date(message.sentAt), 'HH:ii:ss')}*/}
      {/*          </time>*/}
      {/*        </div>*/}
      {/*      ))}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*))}*/}
    </div>
  );
};

export default Chat;
