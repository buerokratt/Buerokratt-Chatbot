import { FC, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { et } from 'date-fns/locale';
import clsx from 'clsx';
import { MdOutlineAttachFile, MdOutlineSend } from 'react-icons/all';
import { Button, FormInput, Icon, Track } from 'components';
import { ReactComponent as BykLogoWhite } from 'assets/logo-white.svg';
import useUserInfoStore from 'store/store';
import { Chat as ChatType, MessageSseEvent, MessageStatus } from 'types/chat';
import { Message, MessagePreviewSseResponse } from 'types/message';
import ChatMessage from './ChatMessage';
import ChatEvent from './ChatEvent';
import './Chat.scss';
import handleSse from "../../mocks/handleSse";
import { findIndex } from 'lodash';
import axios from 'axios';


type ChatProps = {
    chat: ChatType;
    onChatEnd: (chat: ChatType) => void;
    onForwardToColleauge?: (chat: ChatType) => void;
    onForwardToEstablishment?: (chat: ChatType) => void;
    onSendToEmail?: (chat: ChatType) => void;
    onStartAService?: (chat: ChatType) => void;
}

type GroupedMessage = {
    name: string;
    type: string;
    messages: Message[];
}

const Chat: FC<ChatProps> = ({ chat, onChatEnd, onForwardToColleauge, onForwardToEstablishment, onSendToEmail, onStartAService }) => {
    const { t } = useTranslation();
    const { userInfo } = useUserInfoStore();
    const chatRef = useRef<HTMLDivElement>(null);
    const [messageGroups, _setMessageGroups] = useState<GroupedMessage[]>([]);
    const messageGroupsRef = useRef(messageGroups);
    const setMessageGroups = (data: GroupedMessage[]) => {
        messageGroupsRef.current = data;
        _setMessageGroups(data);
    };
    const [isPending, startTransition] = useTransition();
    const [responseText, setResponseText] = useState('');
    const [selectedMessages, setSelectedMessages] = useState<Message[]>([]);
    const { data: messages } = useQuery<Message[]>({
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


    const setPreviewMessage = (event: MessagePreviewSseResponse) => {
        const PREVIEW_MESSAGE: GroupedMessage = {
            name: endUserFullName,
            type: event.data.authorRole,
            messages: event.data as any, // TODO fix types
        };
        const CURRENT_MESSAGE_GROUPS = messageGroupsRef.current;
        const index = findIndex(CURRENT_MESSAGE_GROUPS, (o) => o.messages[0].id === PREVIEW_MESSAGE.messages[0].id);

        if (index === -1) {
            CURRENT_MESSAGE_GROUPS.push(PREVIEW_MESSAGE);
            startTransition(() => {
                setMessageGroups(CURRENT_MESSAGE_GROUPS)
            })
        } else {
            CURRENT_MESSAGE_GROUPS.splice(index, 1, PREVIEW_MESSAGE);
            startTransition(() => {
                setMessageGroups(CURRENT_MESSAGE_GROUPS)
            })
        }
    };


    const hasAccessToActions = useMemo(() => {
        if (chat.customerSupportId === userInfo?.idCode) return true;
        return false;
    }, [chat, userInfo]);

    const endUserFullName = chat.endUserFirstName !== '' && chat.endUserLastName !== ''
        ? `${chat.endUserFirstName} ${chat.endUserLastName}` : t('global.anonymous');

    const allSideButtons = [
        {
            id: 'endChat', button: <Button
                key='endChat'
                appearance='success'
                onClick={onChatEnd ? () => onChatEnd(chat) : undefined}>
                {t('chat.active.endChat')}
            </Button>
        },
        { id: 'askAuthentication', button: <Button key='askAuthentication' appearance='secondary'>{t('chat.active.askAuthentication')}</Button> },
        { id: 'askForContact', button: <Button key='askForContact' appearance='secondary'>{t('chat.active.askForContact')}</Button> },
        { id: 'askPermission', button: <Button key='askPermission' appearance='secondary'>{t('chat.active.askPermission')}</Button> },
        {
            id: 'forwardToColleague', button: <Button key='forwardToColleague' appearance='secondary' onClick={onForwardToColleauge ? () => {
                onForwardToColleauge(chat);
                setSelectedMessages([]);
            } : undefined}>
                {t('chat.active.forwardToColleague')}
            </Button>
        },
        {
            id: 'forwardToOrganization', button: <Button key='forwardToOrganization' appearance='secondary'
                onClick={onForwardToEstablishment ? () => onForwardToEstablishment(chat) : undefined}>{t('chat.active.forwardToOrganization')}</Button>
        },
        {
            id: 'sendToEmail', button: <Button
                key='sendToEmail'
                appearance='secondary'
                onClick={onSendToEmail ? () => onSendToEmail(chat) : undefined}>
                {t('chat.active.sendToEmail')}
            </Button>
        }
    ];
    const [sideButtons, setSideButtons] = useState([]);
    const [buttonsToAllow] = useState<any[]>([]);

    useEffect(() => {
        if (sideButtons.length > 0) return;
        let buttons: any = [];
        // userInfo?.authorities.forEach((authority) => {
        //     // make role more uri friendly
        //     let role = authority.substring(5).replaceAll('_', '-').toLowerCase();
        //     // TODO: Replace '/active/admin.json' with '/<type>/<role>.json'.
        //     axios({ url: `http://localhost:8085/cdn/buttons/chats/active/${role}.json` })
        //         .then(res => {
        //             res.data.buttons.forEach((btnId: any) => {
        //                 if (!buttonsToAllow.includes(btnId))
        //                     buttonsToAllow.push(btnId);
        //             });
        //         });
        // });
        // allSideButtons.forEach((button) => {
        //     if (buttonsToAllow.includes(button.id))
        //         buttons.push(button.button);
        // });
        // setSideButtons(buttons);
    }, [buttonsToAllow, sideButtons]);

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

        sseResponse.addEventListener(MessageSseEvent.PREVIEW, (event: MessagePreviewSseResponse) => {
            setPreviewMessage(event);
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
                        <p style={{ fontSize: 14, lineHeight: '1.5', color: '#4D4F5D' }}>
                            {t('chat.active.startedAt', { date: format(new Date(chat.created), 'dd. MMMM Y HH:ii:ss', { locale: et }) })}
                        </p>
                        <h3>{endUserFullName}</h3>
                    </Track>
                </div>

                <div className='active-chat__group-wrapper'>
                    {messageGroups && messageGroups.map((group, index) => (
                        <div className={clsx(['active-chat__group', `active-chat__group--${group.type}`])}
                            key={`group-${index}`}>
                            {group.type === 'event' ? (
                                <ChatEvent message={group.messages[0]} />
                            ) : (
                                <>
                                    <div className='active-chat__group-initials'>
                                        {group.type === 'buerokratt' || group.type === 'chatbot' ? (
                                            <BykLogoWhite height={24} />
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
                        maxLength={5}
                        onChange={(e) => setResponseText(e.target.value)}
                    />
                    <div className='active-chat__toolbar-actions'>
                        <Button appearance='primary' onClick={handleResponseTextSend}>
                            <Icon icon={<MdOutlineSend fontSize={18} />} size='medium' />
                        </Button>
                        <Button appearance='secondary'>
                            <Icon icon={<MdOutlineAttachFile fontSize={18} />} size='medium' />
                        </Button>
                        {/* <Button appearance='secondary'
                            onClick={onForwardToEstablishment ? () => onForwardToEstablishment(chat) : undefined}>{t('chat.active.forwardToOrganization')}</Button>
                        <Button
                            appearance='secondary'
                            onClick={onSendToEmail ? () => onSendToEmail(chat) : undefined}>
                            {t('chat.active.sendToEmail')}
                        </Button> */}
                        {/* <Button
                            appearance='secondary'
                            onClick={onStartAService ? () => onStartAService(chat) : undefined}>
                            {t('chat.active.startService')}
                        </Button> */}
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
                            <p>{format(new Date(chat.created), 'dd. MMMM Y HH:ii:ss', { locale: et }).toLowerCase()}</p>
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
                        <p>{format(new Date(chat.created), 'dd. MMMM Y HH:ii:ss', { locale: et }).toLowerCase()}</p>
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
