import {FC, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useQuery} from '@tanstack/react-query';
import {format} from 'date-fns';
import {et} from 'date-fns/locale';
import clsx from 'clsx';
import {MdOutlineAttachFile, MdOutlineSend} from 'react-icons/all';
import {Button, FormInput, Icon, Track} from 'components';
import {ReactComponent as BykLogoWhite} from 'assets/logo-white.svg';
import useUserInfoStore from 'store/store';
import {Chat as ChatType, MessageSseEvent, MessageStatus} from 'types/chat';
import {Message} from 'types/message';
import ChatMessage from './ChatMessage';
import ChatEvent from './ChatEvent';
import './Chat.scss';
import handleSse from "../../mocks/handleSse";



type ChatProps = {
    chat: ChatType;
    onChatEnd: (chat: ChatType) => void;
    onForwardToColleauge?: (chat: ChatType) => void;
    onForwardToEstablishment?: (chat: ChatType) => void;
    onSendToEmail?: (chat: ChatType) => void;
}

type GroupedMessage = {
    name: string;
    type: string;
    messages: Message[];
}

const Chat: FC<ChatProps> = ({chat, onChatEnd, onForwardToColleauge, onForwardToEstablishment, onSendToEmail}) => {
        const {t} = useTranslation();
        const {userInfo} = useUserInfoStore();
        const chatRef = useRef<HTMLDivElement>(null);
        const [messageGroups, setMessageGroups] = useState<GroupedMessage[]>([]);
        const [responseText, setResponseText] = useState('');
        const [selectedMessages, setSelectedMessages] = useState<Message[]>([]);
        const {data: messages} = useQuery<Message[]>({
            queryKey: [`cs-get-messages-by-chat-id/${chat.id}`],
        });

        const [messageReadStatus, _setMessageReadStatus] = useState<MessageStatus>({
            messageId: null,
            readTime: null,
        });
        const messageReadStatusRef = useRef(messageReadStatus);
        const setMessageReadStatus = (data: MessageStatus) => {
            messageReadStatusRef.current = data;
            _setMessageReadStatus(data);
        };

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
            chatRef.current.scrollIntoView({block: 'end', inline: 'end'});
        }, [messageGroups]);

        const handleResponseTextSend = () => {

        };

        useEffect(() => {
                const sseResponse = handleSse();
                sseResponse.addEventListener(MessageSseEvent.READ, (event: any) => {

                    setMessageReadStatus({
                        messageId: event.data.id,
                        readTime: event.data.created,
                    })
                });
                return () => {
                    sseResponse.close();
                };
            }, []
        );
        return (
            <div className='active-chat'>
                <div className='active-chat__body'>
                    <div className='active-chat__header'>
                        <Track direction='vertical' gap={8} align='left'>
                            <p style={{fontSize: 14, lineHeight: '1.5', color: '#4D4F5D'}}>
                                {t('chat.active.startedAt', {date: format(new Date(chat.created), 'dd. MMMM Y HH:ii:ss', {locale: et})})}
                            </p>
                            <h3>{endUserFullName}</h3>
                        </Track>
                    </div>

                    <div className='active-chat__group-wrapper'>
                        {messageGroups && messageGroups.map((group, index) => (
                            <div className={clsx(['active-chat__group', `active-chat__group--${group.type}`])}
                                 key={`group-${index}`}>
                                {group.type === 'event' ? (
                                    <ChatEvent message={group.messages[0]}/>
                                ) : (
                                    <>
                                        <div className='active-chat__group-initials'>
                                            {group.type === 'buerokratt' || group.type === 'chatbot' ? (
                                                <BykLogoWhite height={24}/>
                                            ) : (
                                                <>{group.name.split(' ').map((n) => n[0]).join('').toUpperCase()}</>
                                            )}
                                        </div>
                                        <div className='active-chat__group-name'>{group.name}</div>
                                        <div className='active-chat__messages'>
                                            {group.messages.map((message, i) => (
                                                <ChatMessage
                                                    message={message}
                                                    readStatus={messageReadStatusRef}
                                                    key={`message-${i}`}
                                                    onSelect={(message) => setSelectedMessages(prevState => [...prevState, message])}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        <div id='anchor' ref={chatRef}></div>
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
                                <Icon icon={<MdOutlineSend fontSize={18}/>} size='medium'/>
                            </Button>
                            <Button appearance='secondary'>
                                <Icon icon={<MdOutlineAttachFile fontSize={18}/>} size='medium'/>
                            </Button>
                        </div>
                    </div>
                </div>
                <div className='active-chat__side'>
                    <div className='active-chat__side-actions'>
                        <Button
                            appearance='success'
                            onClick={onChatEnd ? () => onChatEnd(chat) : undefined}
                        >
                            {t('chat.active.endChat')}
                        </Button>
                        <Button appearance='secondary'>{t('chat.active.askAuthentication')}</Button>
                        <Button appearance='secondary'>{t('chat.active.askForContact')}</Button>
                        <Button appearance='secondary'>{t('chat.active.askPermission')}</Button>
                        <Button appearance='secondary' onClick={onForwardToColleauge ? () => {
                            onForwardToColleauge(chat);
                            setSelectedMessages([]);
                        } : undefined}>
                            {t('chat.active.forwardToColleague')}
                        </Button>
                        <Button appearance='secondary'
                                onClick={onForwardToEstablishment ? () => onForwardToEstablishment(chat) : undefined}>{t('chat.active.forwardToOrganization')}</Button>
                        <Button
                            appearance='secondary'
                            onClick={onSendToEmail ? () => onSendToEmail(chat) : undefined}>
                            {t('chat.active.sendToEmail')}
                        </Button>
                    </div>
                    <div className='active-chat__side-meta'>
                        <div>
                            <p><strong>ID</strong></p>
                            <p>{chat.id}</p>
                        </div>
                        <div>
                            <p><strong>{t('chat.endUser')}</strong></p>
                            <p>{endUserFullName}</p>
                        </div>
                        {chat.customerSupportDisplayName && (
                            <div>
                                <p><strong>{t('chat.csaName')}</strong></p>
                                <p>{chat.customerSupportDisplayName}</p>
                            </div>
                        )}
                        <div>
                            <p><strong>{t('chat.startedAt')}</strong></p>
                            <p>{format(new Date(chat.created), 'dd. MMMM Y HH:ii:ss', {locale: et}).toLowerCase()}</p>
                        </div>
                        <div>
                            <p><strong>{t('chat.device')}</strong></p>
                            <p>{chat.endUserOs}</p>
                        </div>
                        <div>
                            <p><strong>{t('chat.location')}</strong></p>
                            <p>{chat.endUserUrl}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
;

export default Chat;
