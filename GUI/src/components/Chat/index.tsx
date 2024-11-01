import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { et } from 'date-fns/locale';
import clsx from 'clsx';
import { MdOutlineAttachFile, MdOutlineSend } from 'react-icons/md';
import { Button, Icon, Label, Track } from 'components';
import { ReactComponent as BykLogoWhite } from 'assets/logo-white.svg';
import { Chat as ChatType, CHAT_EVENTS, CHAT_STATUS } from 'types/chat';
import { useMutation } from '@tanstack/react-query';
import { AttachmentTypes, Message } from 'types/message';
import ChatMessage from './ChatMessage';
import ChatEvent from '../ChatEvent';
import { isHiddenFeaturesEnabled, CHAT_INPUT_LENGTH } from 'constants/config';
import { apiDev } from 'services/api';
import ChatTextArea from './ChatTextArea';
import { AUTHOR_ROLES, MESSAGE_FILE_SIZE_LIMIT, ROLES } from 'utils/constants';
import { AxiosError } from 'axios';
import { useToast } from 'hooks/useToast';
import useStore from 'store';
import { userStore as useHeaderStore } from '@buerokratt-ria/header';
import sse from '../../services/sse-service';
import { useNavigate } from 'react-router-dom';
import PreviewMessage from './PreviewMessage';
import LoaderOverlay from './LoaderOverlay';
import { useNewMessageSound } from 'hooks/useAudio';
import './Chat.scss';
import { useInterval } from 'usehooks-ts';

type ChatProps = {
  chat: ChatType;
  isCsaNameVisible: boolean;
  isCsaTitleVisible: boolean;
  onChatEnd: (chat: ChatType) => void;
  onForwardToColleauge?: (chat: ChatType) => void;
  onForwardToEstablishment?: (chat: ChatType) => void;
  onSendToEmail?: (chat: ChatType) => void;
  onStartAService?: (chat: ChatType) => void;
  onRefresh: () => void;
};

type GroupedMessage = {
  name: string;
  type: string;
  messages: Message[];
};

const Chat: FC<ChatProps> = ({
  chat,
  isCsaNameVisible,
  isCsaTitleVisible,
  onChatEnd,
  onForwardToColleauge,
  onForwardToEstablishment,
  onSendToEmail,
  onStartAService,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const userInfo = useStore((state) => state.userInfo);
  const chatRef = useRef<HTMLDivElement>(null);

  const [messageGroups, setMessageGroups] = useState<GroupedMessage[]>([]);
  const messageGroupsRef = useRef(messageGroups);
  const setMessageGroupsState = (data: GroupedMessage[]) => {
    messageGroupsRef.current = data;
    setMessageGroups(data);
  };
  const toast = useToast();

  const [responseText, setResponseText] = useState('');
  const chatCsaActive = useHeaderStore((state) => state.chatCsaActive);
  const [messagesList, setMessagesList] = useState<Message[]>([]);
  const [latestPermissionMessageCreated, setLatestPermissionMessageCreated] = useState<string>();
  const [latestPermissionMessageSeconds, setLatestPermissionMessageSeconds] = useState<number>(0);
  const [previewTypingMessage, setPreviewTypingMessage] = useState<string | undefined>();

  const [newMessageEffect] = useNewMessageSound();
  const navigate = useNavigate();

  const askPermissionsTimeoutInSeconds = 60;
  let messagesLength = 0;

  const calculatePermissionMessageSeconds = () => {
    if (latestPermissionMessageCreated) {
      const countdown = Math.round(
        (new Date().getTime() - new Date(latestPermissionMessageCreated).getTime()) / 1000
      ) ?? 0;

      setLatestPermissionMessageSeconds(countdown);
    }
  }

  const handlePermissionMessages = () => {
    const permissionsMessages = messagesList.filter(
      (e: Message) =>
        e.event === 'ask-permission' ||
        e.event === 'ask-permission-accepted' ||
        e.event === 'ask-permission-rejected' ||
        e.event === 'ask-permission-ignored'
    );

    setLatestPermissionMessageCreated(permissionsMessages[permissionsMessages.length - 1]?.created || '');
    calculatePermissionMessageSeconds();
  }

  useInterval(() => {
    calculatePermissionMessageSeconds();
  }, (latestPermissionMessageCreated && latestPermissionMessageSeconds <= askPermissionsTimeoutInSeconds) ? 1000 : null);

  useEffect(() => {
    getMessages();
  }, []);

  useEffect(() => {
    const onMessage = async (res: any) => {
      if (res.type === 'preview') {
        const previewMessage = await apiDev.get(
          'agents/chats/messages/preview?chatId=' + chat.id
        );
        setPreviewTypingMessage(previewMessage.data.response);
      } else if (messagesList?.length > 0) {
        const res =
          (await apiDev.get(
            `agents/chats/messages/new?chatId=${chat.id}&lastRead=${
              chat.lastMessageTimestamp?.split('+')[0] ?? ''
            }`
          )) ?? [];
        const messages = res.data.response;
        setPreviewTypingMessage(undefined);
        const filteredMessages = messages?.filter((newMessage: Message) => {
          return filterMessages(messagesList, newMessage);
        });

        let newDisplayableMessages = filteredMessages?.filter(
          (msg: Message) => msg.authorId != userInfo?.idCode
        );

        if (newDisplayableMessages?.length > 0) {
          setMessagesList((oldMessages) => [
            ...oldMessages,
            ...newDisplayableMessages,
          ]);
        }

        handlePermissionMessages();

        const permissionsHandeledMessages: Message[] = filteredMessages?.filter(
          (e: Message) =>
            e.event === 'ask-permission-accepted' ||
            e.event === 'ask-permission-rejected' ||
            e.event === 'ask-permission-ignored'
        );
        if (permissionsHandeledMessages?.length > 0) {
          await getMessages();
        }
      }
    };

    const events = sse(`/${chat.id}`, onMessage);

    return () => {
      events.close();
    };
  }, [chat.id, messagesList]);

  const getMessages = async () => {
    const { data: res } = await apiDev.post('agents/chats/messages/all', {
      chatId: chat.id,
    });

    if (
      messagesLength != 0 &&
      messagesLength < res.response.length &&
      res.response[res.response.length - 1].authorId != userInfo?.idCode
    ) {
      newMessageEffect?.play();
      onRefresh();
    }
    messagesLength = res.response.length;

    handlePermissionMessages();

    setMessagesList(res.response);
  };

  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    hiddenFileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    const base64 = await handleFileRead(e.target.files[0]);

    if (!base64) return;

    // To be added: file upload logic
    // setUserInput(e.target.files[0].name);
    // setUserInputFile({
    //   chatId: chat.id,
    //   name: e.target.files[0].name,
    //   type: e.target.files[0].type as AttachmentTypes,
    //   size: e.target.files[0].size,
    //   base64: base64,
    // });
  };

  const postMessageMutation = useMutation({
    mutationFn: (message: Message) =>
      apiDev.post('agents/chats/messages/insert', message),
    onSuccess: () => {},
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const postEventMutation = useMutation({
    mutationFn: (message: Message) =>
      apiDev.post('agents/chats/messages/insert', {
        chatId: message.chatId ?? '',
        content: '',
        event: message.event ?? '',
        authorTimestamp: message.authorTimestamp ?? '',
      }),
    onSuccess: async () => {
      await getMessages();
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const postMessageWithNewEventMutation = useMutation({
    mutationFn: (message: Message) =>
      apiDev.post('agents/chats/messages/event', {
        id: message.id,
        event: CHAT_EVENTS.ASK_PERMISSION,
        authorTimestamp: message.authorTimestamp,
      }),
    onSuccess: async () => {
      await getMessages();
      handleChatEvent(CHAT_EVENTS.ASK_PERMISSION);
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const takeOverChatMutation = useMutation({
    mutationFn: () =>
      apiDev.post('chats/claim', {
        id: chat.id ?? '',
        customerSupportId: userInfo?.idCode ?? '',
        customerSupportDisplayName: userInfo?.displayName ?? '',
        csaTitle: userInfo?.csaTitle ?? '',
        forwardedByUser: userInfo?.idCode ?? '',
        forwardedFromCsa: userInfo?.idCode ?? '',
        forwardedToCsa: userInfo?.idCode ?? '',
      }),
    onSuccess: async () => {
      if (chat.customerSupportId === '') {
        navigate('/active', {
          state: {
            chatId: chat.id,
          },
        });
      } else {
        chat.customerSupportId = userInfo?.idCode;
      }
      onRefresh();
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const assignPendingChatMutation = useMutation({
    mutationFn: () =>
      apiDev.post('chats/pending/assign', {
        id: chat.id ?? '',
        customerSupportId: userInfo?.idCode ?? '',
        customerSupportDisplayName: userInfo?.displayName ?? '',
        csaTitle: userInfo?.csaTitle ?? '',
      }),
    onSuccess: async () => {
      chat.customerSupportId = userInfo?.idCode;
      onRefresh();
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const endPendingChat = useMutation({
    mutationFn: (event: string) =>
      apiDev.post('chats/end', {
        chatId: chat.id ?? '',
        event: event,
        authorTimestamp: new Date().toISOString(),
        authorFirstName: userInfo!.firstName,
        authorId: userInfo!.idCode,
        authorRole: userInfo!.authorities,
      }),
    onSuccess: async () => {
      onRefresh();
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const messageReadStatusRef = useRef({
    messageId: null,
    readTime: null,
  });

  const endUserFullName = getUserName();

  useEffect(() => {
    if (!messagesList) return;
    let groupedMessages: GroupedMessage[] = [];
    messagesList.forEach((message) => {
      const lastGroup = groupedMessages[groupedMessages.length - 1];
      if (
        lastGroup &&
        lastGroup.type === AUTHOR_ROLES.BACKOFFICE_USER &&
        lastGroup.messages.at(-1) &&
        message.event === CHAT_EVENTS.READ
      ) {
        lastGroup.messages.push(message);
        return;
      }
      if (lastGroup?.type === message.authorRole) {
        if (
          !message.event ||
          message.event === '' ||
          message.event === 'greeting'
        ) {
          lastGroup.messages.push({ ...message });
        } else {
          groupedMessages.push({
            name: '',
            type: 'event',
            messages: [{ ...message }],
          });
        }
      } else if (
        !message.event ||
        message.event === '' ||
        message.event === 'greeting'
      ) {
        const isBackOfficeUser =
          message.authorRole === 'backoffice-user'
            ? `${message.authorFirstName} ${message.authorLastName}`
            : message.authorRole;
        groupedMessages.push({
          name:
            message.authorRole === 'end-user'
              ? endUserFullName
              : isBackOfficeUser,
          type: message.authorRole,
          messages: [{ ...message }],
        });
      } else {
        groupedMessages.push({
          name: '',
          type: 'event',
          messages: [{ ...message }],
        });
      }
    });
    setMessageGroupsState(groupedMessages);
  }, [messagesList, endUserFullName]);

  useEffect(() => {
    if (!chatRef.current || !messageGroups) return;
    chatRef.current.scrollIntoView({ block: 'end', inline: 'end' });
  }, [messageGroups, previewTypingMessage]);

  const handleResponseTextSend = () => {
    const newMessage: Message = {
      chatId: chat.id,
      authorRole: AUTHOR_ROLES.BACKOFFICE_USER,
      content: responseText,
      authorTimestamp: new Date().toISOString(),
      authorFirstName: userInfo?.displayName ?? '',
      authorLastName: '',
      authorId: userInfo?.idCode ?? '',
      forwardedByUser: chat.forwardedByUser ?? '',
      forwardedFromCsa: chat.forwardedFromCsa ?? '',
      forwardedToCsa: chat.forwardedToCsa ?? '',
    };

    if (responseText !== '') {
      postMessageMutation.mutate(newMessage);
      setMessagesList((oldMessages) => [...oldMessages, newMessage]);
      setResponseText('');
    }
  };

  const handleChatEvent = (event: string) => {
    const newMessage: Message = {
      chatId: chat.id,
      authorRole: AUTHOR_ROLES.BACKOFFICE_USER,
      content: '',
      event: event,
      created: new Date().toLocaleString(),
      authorTimestamp: new Date().toISOString(),
      authorFirstName: userInfo?.displayName ?? '',
      authorLastName: '',
      authorId: userInfo?.idCode ?? '',
      forwardedByUser: chat.forwardedByUser ?? '',
      forwardedFromCsa: chat.forwardedFromCsa ?? '',
      forwardedToCsa: chat.forwardedToCsa ?? '',
    };

    postEventMutation.mutate(newMessage);
    setMessagesList((oldMessages) => [...oldMessages, newMessage]);
  };

  const disableAskForPermission =
    chat.customerSupportId != userInfo?.idCode ||
    (latestPermissionMessageSeconds <= askPermissionsTimeoutInSeconds && latestPermissionMessageSeconds != 0);

  const takeOverCondition =
    chat.customerSupportId === '' ||
    (chat.customerSupportId !== userInfo?.idCode &&
      userInfo?.authorities.includes('ROLE_ADMINISTRATOR'));

  return (
    <div className="active-chat">
      <div className="active-chat__body">
        <div className="active-chat__header">
          <Track direction="vertical" gap={8} align="left">
            <p style={{ fontSize: 14, lineHeight: '1.5', color: '#4D4F5D' }}>
              {t('chat.active.startedAt', {
                date: format(new Date(chat.created), 'dd. MMMM Y HH:mm:ss', {
                  locale: et,
                }),
              })}
            </p>
            <h3>{endUserFullName}</h3>
          </Track>
        </div>

        <div className="active-chat__group-wrapper">
          {messageGroups?.map((group, index) => (
            <div
              className={clsx([
                'active-chat__group',
                `active-chat__group--${group.type}`,
              ])}
              key={`${group.type}-${index}`}
            >
              {group.type === 'event' ? (
                <ChatEvent message={group.messages[0]} />
              ) : (
                <>
                  <div className="active-chat__group-initials">
                    {group.type === 'buerokratt' || group.type === 'chatbot' ? (
                      <BykLogoWhite height={24} />
                    ) : (
                      <>
                        {group.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </>
                    )}
                  </div>
                  <div className="active-chat__group-name">{group.name}</div>
                  <div className="active-chat__messages">
                    {group.messages.map((message, i) => (
                      <ChatMessage
                        message={message}
                        readStatus={messageReadStatusRef}
                        key={`${message.id ?? ''}-${i}`}
                        onSelect={(message) => {
                          // To be added: message selection logic
                          console.log(message);
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
          {previewTypingMessage && (
            <div className={clsx(['active-chat__group'])} key={`group`}>
              <div className="active-chat__group-initials">
                {<BykLogoWhite height={24} />}
              </div>
              <div className="active-chat__group-name">{'User Typing'}</div>
              <div className="active-chat__messages">
                <PreviewMessage
                  key={`preview-message`}
                  preview={previewTypingMessage ?? ''}
                />
              </div>
            </div>
          )}

          <div id="anchor" ref={chatRef}></div>
        </div>

        {chat.customerSupportId == userInfo?.idCode &&
          chat.status != CHAT_STATUS.IDLE && (
            <div className="active-chat__toolbar">
              <Track>
                <ChatTextArea
                  name="message"
                  label={t('')}
                  id="chatArea"
                  placeholder={t('chat.reply') + '...'}
                  minRows={1}
                  maxRows={8}
                  value={responseText}
                  onSubmit={(e) => handleResponseTextSend()}
                  maxLength={CHAT_INPUT_LENGTH}
                  onChange={(e) => setResponseText(e.target.value)}
                />
                <div className="active-chat__toolbar-actions">
                  <Button
                    id="myButton"
                    appearance="primary"
                    onClick={handleResponseTextSend}
                  >
                    <Icon
                      icon={<MdOutlineSend fontSize={18} />}
                      size="medium"
                    />
                    <input
                      type="file"
                      ref={hiddenFileInputRef}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </Button>
                  {isHiddenFeaturesEnabled && (
                    <Button appearance="secondary" onClick={handleUploadClick}>
                      <Icon
                        icon={<MdOutlineAttachFile fontSize={18} />}
                        size="medium"
                      />
                    </Button>
                  )}
                </div>
              </Track>
            </div>
          )}

        {takeOverCondition &&
          chatCsaActive === true &&
          chat.status != CHAT_STATUS.IDLE && (
            <div className="active-chat__toolbar">
              <Track justify="center">
                <div className="active-chat__toolbar-actions">
                  <Button
                    appearance="primary"
                    style={{
                      backgroundColor: '#25599E',
                      color: '#FFFFFF',
                      borderRadius: '50px',
                      paddingLeft: '40px',
                      paddingRight: '40px',
                    }}
                    onClick={() => takeOverChatMutation.mutate()}
                  >
                    {t('chat.active.takeOver')}
                  </Button>
                </div>
              </Track>
            </div>
          )}

        {chat.status === CHAT_STATUS.IDLE &&
          (chat.customerSupportId === 'chatbot' ||
            chat.customerSupportId != userInfo?.idCode) && (
            <div className="active-chat__toolbar">
              <Track justify="center">
                <div className="active-chat__toolbar-actions">
                  <Button
                    appearance="primary"
                    style={{
                      backgroundColor: '#25599E',
                      color: '#FFFFFF',
                      borderRadius: '50px',
                      paddingLeft: '40px',
                      paddingRight: '40px',
                    }}
                    onClick={() => assignPendingChatMutation.mutate()}
                  >
                    {t('chat.active.takeOver')}
                  </Button>
                </div>
              </Track>
            </div>
          )}

        {chat.status === CHAT_STATUS.IDLE &&
          chat.customerSupportId != 'chatbot' &&
          chat.customerSupportId === userInfo?.idCode && (
            <div className="active-chat__toolbar">
              <Track justify="center">
                <div className="active-chat__toolbar-actions">
                  <Button
                    appearance="error"
                    style={{
                      borderRadius: '50px',
                      paddingLeft: '40px',
                      paddingRight: '40px',
                    }}
                    onClick={() => endPendingChat.mutate('user-not-reached')}
                  >
                    {t('chat.active.couldNotReachUser')}
                  </Button>
                  <Button
                    appearance="success"
                    style={{
                      borderRadius: '50px',
                      paddingLeft: '40px',
                      paddingRight: '40px',
                    }}
                    onClick={() => endPendingChat.mutate('user-reached')}
                  >
                    {t('chat.active.ContactedUser')}
                  </Button>
                </div>
              </Track>
            </div>
          )}
      </div>
      <div className="active-chat__side">
        {(chat.customerSupportId === '' ||
          chat.customerSupportId === userInfo?.idCode) &&
          chat.status != CHAT_STATUS.IDLE && (
            <div className="active-chat__side-actions">
              <Button appearance="success" onClick={chatEnd()}>
                {t('chat.active.endChat')}
              </Button>
              <Button
                appearance="secondary"
                disabled={
                  chat.customerSupportId != userInfo?.idCode ||
                  chat.endUserId != ''
                }
                onClick={() =>
                  handleChatEvent(CHAT_EVENTS.REQUESTED_AUTHENTICATION)
                }
              >
                {t('chat.active.askAuthentication')}
              </Button>
              <Button
                appearance="secondary"
                disabled={chat.customerSupportId != userInfo?.idCode}
                onClick={() => handleChatEvent(CHAT_EVENTS.CONTACT_INFORMATION)}
              >
                {t('chat.active.askForContact')}
              </Button>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Button
                  appearance="secondary"
                  style={{ width: '100%' }}
                  disabledWithoutStyle={disableAskForPermission}
                  disabled={chat.customerSupportId != userInfo?.idCode}
                  onClick={() => {
                    const message: Message | undefined = messagesList.findLast(
                      (e) => e.event === CHAT_EVENTS.ASK_PERMISSION
                    );
                    if (message != undefined) {
                      postMessageWithNewEventMutation.mutate(message);
                    } else {
                      handleChatEvent(CHAT_EVENTS.ASK_PERMISSION);
                    }
                  }}
                >
                  {t('chat.active.askPermission')}
                </Button>
                {latestPermissionMessageSeconds <= askPermissionsTimeoutInSeconds && (
                  <LoaderOverlay
                    maxPercent={askPermissionsTimeoutInSeconds}
                    currentPercent={latestPermissionMessageSeconds}
                  />
                )}
              </div>
              <Button
                appearance="secondary"
                disabled={!chatCsaActive}
                onClick={forwardToColleague()}
              >
                {t('chat.active.forwardToColleague')}
              </Button>
              {isHiddenFeaturesEnabled && (
                <Button
                  appearance="secondary"
                  disabled={!chatCsaActive}
                  onClick={forwardToEstablishment()}
                >
                  {t('chat.active.forwardToOrganization')}
                </Button>
              )}
              {isHiddenFeaturesEnabled && (
                <Button
                  appearance="secondary"
                  disabled={chat.customerSupportId != userInfo?.idCode}
                  onClick={sendToEmail()}
                >
                  {t('chat.active.sendToEmail')}
                </Button>
              )}
              {isHiddenFeaturesEnabled && (
                <Button
                  appearance="secondary"
                  disabled={chat.customerSupportId != userInfo?.idCode}
                  onClick={StartAService()}
                >
                  {t('chat.active.startService')}
                </Button>
              )}
            </div>
          )}
        {chat.customerSupportId !== '' &&
          chat.customerSupportId !== userInfo?.idCode &&
          !chatCsaActive && (
            <div className="active-chat__side-actions">
              <Track gap={8} style={{ marginBottom: 36 }}>
                <Label type="warning">!</Label>
                <p className="csa-away">Nõustaja on eemal.</p>
              </Track>
              {userInfo?.authorities.some((authority) =>
                [
                  ROLES.ROLE_ADMINISTRATOR,
                  ROLES.ROLE_CUSTOMER_SUPPORT_AGENT,
                ].includes(authority as ROLES)
              ) && (
                <Button appearance="secondary" onClick={forwardToColleague()}>
                  {t('chat.active.forwardToColleague')}
                </Button>
              )}
            </div>
          )}
        <div className="active-chat__side-meta">
          <div>
            <p>
              <strong>ID</strong>
            </p>
            <p>{chat.id}</p>
          </div>
          <div>
            <p>
              <strong>{t('chat.endUser')}</strong>
            </p>
            <p>{endUserFullName}</p>
          </div>
          {chat.endUserId && (
            <div>
              <p>
                <strong>{t('chat.endUserId')}</strong>
              </p>
              <p>{chat.endUserId ?? ''}</p>
            </div>
          )}
          {chat.endUserEmail && (
            <div>
              <p>
                <strong>{t('chat.endUserEmail')}</strong>
              </p>
              <p>{chat.endUserEmail}</p>
            </div>
          )}
          {chat.endUserPhone && (
            <div>
              <p>
                <strong>{t('chat.endUserPhoneNumber')}</strong>
              </p>
              <p>{chat.endUserPhone}</p>
            </div>
          )}
          {chat.customerSupportDisplayName && (
            <div>
              <p>
                <strong>{t('chat.csaName')}</strong>
              </p>
              <p>{chat.customerSupportDisplayName}</p>
            </div>
          )}
          <div>
            <p>
              <strong>{t('chat.startedAt')}</strong>
            </p>
            <p>
              {format(new Date(chat.created), 'dd. MMMM Y HH:mm:ss', {
                locale: et,
              }).toLowerCase()}
            </p>
          </div>
          <div>
            <p>
              <strong>{t('chat.device')}</strong>
            </p>
            <p>{chat.endUserOs}</p>
          </div>
          <div>
            <p>
              <strong>{t('chat.location')}</strong>
            </p>
            <p>{chat.endUserUrl}</p>
          </div>
        </div>
      </div>
    </div>
  );

  function chatEnd() {
    return onChatEnd ? () => onChatEnd(chat) : undefined;
  }

  function forwardToEstablishment() {
    return onForwardToEstablishment
      ? () => onForwardToEstablishment(chat)
      : undefined;
  }

  function sendToEmail() {
    return onSendToEmail ? () => onSendToEmail(chat) : undefined;
  }

  function forwardToColleague() {
    return onForwardToColleauge
      ? () => {
          onForwardToColleauge(chat);
        }
      : undefined;
  }

  function StartAService() {
    return onStartAService ? () => onStartAService(chat) : undefined;
  }

  function getUserName() {
    return chat.endUserFirstName !== '' && chat.endUserLastName !== ''
      ? `${chat.endUserFirstName} ${chat.endUserLastName}`
      : t('global.anonymous');
  }

  async function handleFileRead(file: File): Promise<string | null> {
    if (!Object.values(AttachmentTypes).some((v) => v === file.type)) {
      return null;
    }

    if (file.size > MESSAGE_FILE_SIZE_LIMIT) {
      return null;
    } else {
      return await convertBase64(file);
    }
  }

  async function convertBase64(file: File): Promise<any> {
    return await new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(new Error('Error reading file'));
      };
    });
  }
};

function filterMessages(messagesList: Message[], newMessage: Message) {
  return !messagesList.some(
    (existingMessage) =>
      existingMessage.id === newMessage.id &&
      existingMessage.event === newMessage.event
  );
}
export default Chat;
