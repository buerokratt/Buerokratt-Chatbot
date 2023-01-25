import { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { et } from 'date-fns/locale';
import clsx from 'clsx';
import { MdOutlineAttachFile, MdOutlineSend } from 'react-icons/all';

import { Button, FormInput, Icon, Track } from 'components';
import { ReactComponent as BykLogoWhite } from 'assets/logo-white.svg';
import { Chat as ChatType } from 'types/chat';
import { Message } from 'types/message';
import './Chat.scss';

type ChatProps = {
  chat: ChatType;
}

type GroupedMessage = {
  name: string;
  type: string;
  messages: Message[];
}

const Chat: FC<ChatProps> = ({ chat }) => {
  const { t } = useTranslation();
  const chatRef = useRef<HTMLDivElement>(null);
  const [messageGroups, setMessageGroups] = useState<GroupedMessage[]>([]);
  const [responseText, setResponseText] = useState('');
  const { data: messages } = useQuery<Message[]>({
    queryKey: [`cs-get-messages-by-chat-id/${chat.id}`],
  });

  const endUserFullName = chat.endUserFirstName !== '' && chat.endUserLastName !== ''
    ? `${chat.endUserFirstName} ${chat.endUserLastName}` : t('global.anonymous');

  useEffect(() => {
    if (!messages) return;
    let groupedMessages: GroupedMessage[] = [];
    messages.forEach((message) => {
      const lastGroup = groupedMessages[groupedMessages.length - 1];
      if (lastGroup?.type === message.authorRole) {
        lastGroup.messages.push(message);
      } else {
        groupedMessages.push({
          name: message.authorRole === 'end-user' ? endUserFullName : message.authorRole,
          type: message.authorRole,
          messages: [message],
        });
      }
    });
    setMessageGroups(groupedMessages);
  }, [messages, endUserFullName]);

  useEffect(() => {
    if (!chatRef.current || !messageGroups) return;
    chatRef.current.scrollIntoView({ block: 'end' });
  }, [messageGroups]);

  const handleResponseTextSend = () => {

  };

  return (
    <div className='active-chat'>
      <div className='active-chat__body'>
        <div className='active-chat__header'>
          <Track direction='vertical' gap={8} align='left'>
            <p style={{ fontSize: 14, lineHeight: '1.5', color: '#4D4F5D' }}>
              {t('chat.active.startedAt', { date: format(new Date(chat.created), 'dd. MMMM Y HH:ii:ss', { locale: et }) })}
            </p>
            <h3>{endUserFullName}</h3>
          </Track>
        </div>

        <div className='active-chat__group-wrapper' ref={chatRef}>
          {messageGroups && messageGroups.map((group, index) => (
            <div className={clsx(['active-chat__group', `active-chat__group--${group.type}`])} key={`group-${index}`}>
              <div className='active-chat__group-initials'>
                {group.type === 'buerokratt' ? (
                  <BykLogoWhite height={24} />
                ) : (
                  <>{group.name.split(' ').map((n) => n[0]).join('').toUpperCase()}</>
                )}
              </div>
              <div className='active-chat__group-name'>{group.name}</div>
              <div className='active-chat__messages'>
                {group.messages.map((message, i) => (
                  <div className='active-chat__message' key={`message-${i}`}>
                    <div className='active-chat__message-text'>{message.content}</div>
                    <time dateTime={message.authorTimestamp} className='active-chat__message-date'>
                      {format(new Date(message.authorTimestamp), 'HH:ii:ss')}
                    </time>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div id='anchor'></div>
        </div>

        <div className='active-chat__toolbar'>
          <FormInput
            name='message'
            label={t('')}
            placeholder={t('chat.reply') + '...'}
            onChange={(e) => setResponseText(e.target.value)}
          />
          <div className='active-chat__toolbar-actions'>
            <Button appearance='primary' onClick={handleResponseTextSend}>
              <Icon icon={<MdOutlineSend />} size='medium' />
            </Button>
            <Button appearance='secondary'>
              <Icon icon={<MdOutlineAttachFile />} size='medium' />
            </Button>
          </div>
        </div>
      </div>
      <div className='active-chat__side'>
        <div className='active-chat__side-actions'>
          <Button appearance='success'>{t('chat.active.endChat')}</Button>
          <Button appearance='secondary'>{t('chat.active.askAuthentication')}</Button>
          <Button appearance='secondary'>{t('chat.active.askForContact')}</Button>
          <Button appearance='secondary'>{t('chat.active.askPermission')}</Button>
          <Button appearance='secondary'>{t('chat.active.forwardToColleague')}</Button>
          <Button appearance='secondary'>{t('chat.active.forwardToOrganization')}</Button>
        </div>
        <div className='active-chat__side-meta'>
          <div>
            <p><strong>ID</strong></p>
            <p>{chat.id}</p>
          </div>
          <div>
            <p><strong>Vestleja</strong></p>
            <p>{endUserFullName}</p>
          </div>
          {chat.customerSupportDisplayName && (
            <div>
              <p><strong>Nõustaja nimi</strong></p>
              <p>{chat.customerSupportDisplayName}</p>
            </div>
          )}
          <div>
            <p><strong>Vestlus alustatud</strong></p>
            <p>{format(new Date(chat.created), 'dd. MMMM Y HH:ii:ss', { locale: et }).toLowerCase()}</p>
          </div>
          <div>
            <p><strong>Seade</strong></p>
            <p>{chat.endUserOs}</p>
          </div>
          <div>
            <p><strong>Lähtekoht</strong></p>
            <p>{chat.endUserUrl}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
