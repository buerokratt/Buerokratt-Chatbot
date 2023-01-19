import { FC, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import { Button, Dialog, FormInput, FormSelect, Track } from 'components';
import type { Conversation, Message } from 'types/conversation';
import type { Intent } from 'types/intent';
import { ReactComponent as BykLogoWhite } from 'assets/logo-white.svg';
import './HistoricalChat.scss';

type HistoricalChatProps = {
  conversationId: number;
}

type GroupedMessage = {
  name: string;
  type: 'bot' | 'client' | 'client-support';
  messages: Message[];
}

const HistoricalChat: FC<HistoricalChatProps> = ({ conversationId }) => {
  const { t } = useTranslation();
  const [markedMessage, setMarkedMessage] = useState<string | null>(null);
  const { data: conversation } = useQuery<Conversation>({
    queryKey: [`conversations/${conversationId}`],
  });
  const { data: intents } = useQuery<Intent[]>({
    queryKey: ['intents'],
  });

  const messageGroups = useMemo(() => {
    if (!conversation) return null;
    const groupedMessages: GroupedMessage[] = [];
    let lastName: string | null = null;
    let group: GroupedMessage | null = null;
    for (let message of conversation.messages) {
      if (lastName === null || lastName !== message.name) {
        group = {
          name: message.name,
          type: message.type,
          messages: [],
        };
        groupedMessages.push(group);
      }
      if (group) {
        group.messages.push(message);
      }
      lastName = message.name;
    }
    return groupedMessages;
  }, [conversation]);

  if (!conversation) return <>Loading...</>;

  return (
    <>
      <div className='chat'>
        {messageGroups && messageGroups.map((group, index) => (
          <div className={clsx(['chat__group', `chat__group--${group.type}`])} key={`group-${index}`}>
            <div className='chat__group-initials'>
              {group.type === 'bot' ? (
                <BykLogoWhite height={24} />
              ) : (
                <>{group.name.split(' ').map((n) => n[0]).join('').toUpperCase()}</>
              )}
            </div>
            <div className='chat__group-name'>{group.name}</div>
            <div className='chat__messages'>
              {group.messages.map((message, i) => (
                <div className='chat__message' key={`message-${i}`}>
                  {message.type === 'client' ? (
                    <button
                      className='chat__message-text'
                      onClick={() => setMarkedMessage(message.message)}
                    >
                      {message.message}
                    </button>
                  ) : (
                    <div className='chat__message-text'>{message.message}</div>
                  )}
                  <time dateTime={message.sentAt} className='chat__message-date'>
                    {format(new Date(message.sentAt), 'HH:ii:ss')}
                  </time>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {markedMessage && (
        // TODO: Modify modal with correct data
        <Dialog
          title='Euismod Egestas Elit'
          onClose={() => setMarkedMessage(null)}
          footer={
            <>
              <Button appearance='secondary' onClick={() => setMarkedMessage(null)}>
                {t('global.cancel')}
              </Button>
              <Button>{t('global.save')}</Button>
            </>
          }
        >
          <Track direction='vertical' gap={16}>
            <FormInput label='Nullam Ullamcorper' name='test1' defaultValue={markedMessage} />
            {intents && (
              <FormSelect
                label='Etiam Vestibulum'
                name='test2'
                options={intents.map((intent) => ({ label: intent.intent, value: String(intent.id) }))}
              />
            )}
          </Track>
        </Dialog>
      )}
    </>
  );
};

export default HistoricalChat;
