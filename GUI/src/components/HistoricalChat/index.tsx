import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { MdOutlineModeEditOutline, MdOutlineSave } from 'react-icons/all';

import { Button, FormSelect, FormTextarea, Icon, Track } from 'components';
import { ReactComponent as BykLogoWhite } from 'assets/logo-white.svg';
import useUserInfoStore from 'store/store';
import {Chat as ChatType} from 'types/chat';
import {Message} from 'types/message';
import ChatMessage from './ChatMessage';
import ChatEvent from './ChatEvent';
import './HistoricalChat.scss';

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
  'client-left-with-accepted',
  'client-left-with-no-resolution',
  'client-left-for-unknown-reason',
  'accepted',
  'hate-speech',
  'other',
  'response-sent-to-client-email',
];

const HistoricalChat: FC<ChatProps> = ({ chat, onChatStatusChange, onCommentChange }) => {
  const { t } = useTranslation();
  const { userInfo } = useUserInfoStore();
  const chatRef = useRef<HTMLDivElement>(null);
  const [messageGroups, setMessageGroups] = useState<GroupedMessage[]>([]);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const { data: messages } = useQuery<Message[]>({
    queryKey: [`cs-get-messages-by-chat-id/${chat.id}`],
  });

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
          <div className='historical-chat__toolbar-row'>
            <Track gap={16} justify='between'>
              {editingComment ? (
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
              {editingComment ? (
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
                    setEditingComment(chat.comment)
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
              options={chatStatuses.map((status) => ({ label: t(`chat.events.${status}`), value: status }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalChat;
