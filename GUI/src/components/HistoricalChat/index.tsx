import { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { MdOutlineModeEditOutline, MdOutlineSave } from 'react-icons/all';

import { Button, FormSelect, FormTextarea, Icon, Track } from 'components';
import { ReactComponent as BykLogoWhite } from 'assets/logo-white.svg';
import { CHAT_EVENTS, Chat as ChatType } from 'types/chat';
import { Message } from 'types/message';
import ChatMessage from './ChatMessage';
import './HistoricalChat.scss';
import apiDev from 'services/api-dev';
import ChatEvent from 'components/ChatEvent';

type ChatProps = {
  chat: ChatType;
  onChatStatusChange: (event: string) => void;
  onCommentChange: (comment: string) => void;
}

type GroupedMessage = {
  name: string;
  type: string;
  messages: Message[];
}

const chatStatuses = [
  CHAT_EVENTS.ACCEPTED,
  CHAT_EVENTS.CLIENT_LEFT_FOR_UNKNOWN_REASONS,
  CHAT_EVENTS.CLIENT_LEFT_WITH_ACCEPTED,
  CHAT_EVENTS.CLIENT_LEFT_WITH_NO_RESOLUTION,
  CHAT_EVENTS.HATE_SPEECH,
  CHAT_EVENTS.OTHER,
  CHAT_EVENTS.RESPONSE_SENT_TO_CLIENT_EMAIL,
];

const HistoricalChat: FC<ChatProps> = ({ chat, onChatStatusChange, onCommentChange }) => {
  const { t } = useTranslation();
  const chatRef = useRef<HTMLDivElement>(null);
  const [messageGroups, setMessageGroups] = useState<GroupedMessage[]>([]);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [messagesList, setMessagesList] = useState<Message[]>([]);

  useEffect(() => {
    getMessages();
  }, [])

  const getMessages = async () => {
    const { data: res } = await apiDev.post('cs-get-messages-by-chat-id', {
      'chatId': chat.id
    });
    setMessagesList(res.data.cs_get_messages_by_chat_id);
  };

  const endUserFullName = chat.endUserFirstName !== '' && chat.endUserLastName !== ''
    ? `${chat.endUserFirstName} ${chat.endUserLastName}` : t('global.anonymous');

  useEffect(() => {
    if (!messagesList) return;
    let groupedMessages: GroupedMessage[] = [];
    messagesList.forEach((message) => {
      const lastGroup = groupedMessages[groupedMessages.length - 1];
      if (lastGroup?.type === message.authorRole) {
        if (!message.event || message.event.toLowerCase() === 'greeting') {
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
  }, [messagesList, endUserFullName]);

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
          <div className='historical-chat__toolbar-row'>
            <Track gap={16} justify='between'>
              {editingComment || editingComment === '' ? (
                <FormTextarea
                  name='comment'
                  label={t('global.comment')}
                  value={editingComment}
                  hideLabel
                  onChange={(e) =>
                    setEditingComment(e.target.value)
                  }
                />
              ) : (
                <p>{chat.comment}</p>
              )}
              {editingComment || editingComment === '' ? (
                <Button
                  appearance='text'
                  onClick={() => {
                    onCommentChange(editingComment);
                    setEditingComment(null);
                  }}
                >
                  <Icon icon={<MdOutlineSave />} />
                  {t('global.save')}
                </Button>
              ) : (
                <Button
                  appearance='text'
                  onClick={() =>
                    setEditingComment(chat.comment ?? '')
                  }
                >
                  <Icon icon={<MdOutlineModeEditOutline />} />
                  {t('global.edit')}
                </Button>
              )}
            </Track>
          </div>
          <div className='historical-chat__toolbar-row'>
            <FormSelect
              name='chatStatus'
              label={t('chat.chatStatus')}
              onSelectionChange={(selection) => selection ? onChatStatusChange(selection.value) : null}
              options={chatStatuses.map((status) => ({
                label: t(`chat.events.${status}`, { date: '' }),
                value: status
              }))}
            />
          </div>
        </div>
      </div>
      <div id='anchor' ref={chatRef}></div>
    </div>
  );
};

export default HistoricalChat;
