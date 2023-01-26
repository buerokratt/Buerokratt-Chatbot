import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { et } from 'date-fns/locale';
import clsx from 'clsx';
import { MdOutlineAttachFile, MdOutlineSend } from 'react-icons/all';

import { Button, FormInput, FormSelect, Icon, Track } from 'components';
import { ReactComponent as BykLogoWhite } from 'assets/logo-white.svg';
import useUserInfoStore from 'store/store';
import { Chat as ChatType } from 'types/chat';
import { Message } from 'types/message';
import ChatMessage from './ChatMessage';
import ChatEvent from './ChatEvent';
import './HistoricalChat.scss';

type ChatProps = {
  chat: ChatType;
}

type GroupedMessage = {
  name: string;
  type: string;
  messages: Message[];
}

const HistoricalChat: FC<ChatProps> = ({ chat }) => {
  const { t } = useTranslation();
  const { userInfo } = useUserInfoStore();
  const chatRef = useRef<HTMLDivElement>(null);
  const [messageGroups, setMessageGroups] = useState<GroupedMessage[]>([]);
  const { data: messages } = useQuery<Message[]>({
    queryKey: [`cs-get-messages-by-chat-id/${chat.id}`],
  });

  console.log(chat);

  const hasAccessToActions = useMemo(() => {
    if (chat.customerSupportId === userInfo?.idCode) return true;
    return false;
  }, [chat, userInfo]);

  const endUserFullName = chat.endUserFirstName !== '' && chat.endUserLastName !== ''
    ? `${chat.endUserFirstName} ${chat.endUserLastName}` : t('global.anonymous');

  useEffect(() => {
    if (!messages) return;
    let groupedMessages: GroupedMessage[] = [];
    messages.forEach((message) => {
      const lastGroup = groupedMessages[groupedMessages.length - 1];
      if (lastGroup?.type === message.authorRole) {
        if (!message.event || message.event === 'greeting') {
          lastGroup.messages.push(message);
        } else {
          groupedMessages.push({
            name: '',
            type: 'event',
            messages: [message],
          });
        }
      } else {
        groupedMessages.push({
          name: message.authorRole === 'end-user'
            ? endUserFullName
            : message.authorRole === 'backoffice-user'
              ? `${message.authorFirstName} ${message.authorLastName}`
              : message.authorRole,
          type: message.authorRole,
          messages: [message],
        });
      }
    });
    setMessageGroups(groupedMessages);
  }, [messages, endUserFullName]);

  useEffect(() => {
    if (!chatRef.current || !messageGroups) return;
    chatRef.current.scrollIntoView({ block: 'end', inline: 'end' });
  }, [messageGroups]);

  return (
    <div className='historical-chat'>
      <div className='historical-chat__body'>
        <div className='historical-chat__group-wrapper'>
          {messageGroups && messageGroups.map((group, index) => (
            <div className={clsx(['historical-chat__group', `historical-chat__group--${group.type}`])}
                 key={`group-${index}`}>
              {group.type === 'event' ? (
                <ChatEvent message={group.messages[0]} />
              ) : (
                <>
                  <div className='historical-chat__group-initials'>
                    {group.type === 'buerokratt' || group.type === 'chatbot' ? (
                      <BykLogoWhite height={24} />
                    ) : (
                      <>{group.name.split(' ').map((n) => n[0]).join('').toUpperCase()}</>
                    )}
                  </div>
                  <div className='historical-chat__group-name'>{group.name}</div>
                  <div className='historical-chat__messages'>
                    {group.messages.map((message, i) => (
                      <ChatMessage message={message} key={`message-${i}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
          <div id='anchor' ref={chatRef}></div>
        </div>

        <div className='historical-chat__toolbar'>
          <FormSelect
            name='chatStatus'
            label={t('chat.chatStatus')}
            options={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default HistoricalChat;
