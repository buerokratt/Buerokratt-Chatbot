import {
  ChangeEvent,
  FC,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { et } from 'date-fns/locale';
import clsx from 'clsx';
import { MdOutlineAttachFile, MdOutlineSend } from 'react-icons/all';
import {
  Button,
  FormInput,
  FormTextarea,
  Icon,
  Label,
  Track,
} from 'components';
import { ReactComponent as BykLogoWhite } from 'assets/logo-white.svg';
import useUserInfoStore from 'store/store';
import {
  Chat as ChatType,
  MessageSseEvent,
  MessageStatus,
  CHAT_EVENTS,
} from 'types/chat';
import { useMutation } from '@tanstack/react-query';
import {
  Attachment,
  AttachmentTypes,
  Message,
  MessagePreviewSseResponse,
} from 'types/message';
import ChatMessage from './ChatMessage';
import ChatEvent from '../ChatEvent';
import handleSse from '../../mocks/handleSse';
import { findIndex } from 'lodash';
import { CHAT_INPUT_LENGTH } from 'constants/config';
import apiDev from 'services/api-dev';
import ChatTextArea from './ChatTextArea';
import TextareaAutosize, {
  TextareaAutosizeProps,
} from 'react-textarea-autosize';
import { ROLES } from 'utils/constants';
import newMessageSound from '../../assets/newMessageSound.mp3';
import { AUTHOR_ROLES, MESSAGE_FILE_SIZE_LIMIT } from 'utils/constants';
import formatBytes from 'utils/format-bytes';
import useSendAttachment from 'modules/attachment/hooks';
import { AxiosError } from 'axios';
import { useToast } from 'hooks/useToast';
import './Chat.scss';

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
  const { userInfo } = useUserInfoStore();
  const chatRef = useRef<HTMLDivElement>(null);
  const [messageGroups, _setMessageGroups] = useState<GroupedMessage[]>([]);
  const messageGroupsRef = useRef(messageGroups);
  const setMessageGroups = (data: GroupedMessage[]) => {
    messageGroupsRef.current = data;
    _setMessageGroups(data);
  };
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [responseText, setResponseText] = useState('');
  const [selectedMessages, setSelectedMessages] = useState<Message[]>([]);
  const [chatCsaActive, setChatCsaActive] = useState<boolean>(true);
  const [messagesList, setMessagesList] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [userInputFile, setUserInputFile] = useState<Attachment>();
  const [errorMessage, setErrorMessage] = useState('');
  const audio = useMemo(() => new Audio(newMessageSound), []);
  let messagesLength = 0;

  useEffect(() => {
    getCsaStatus();
    const interval = setInterval(() => {
      getMessages();
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const getCsaStatus = async () => {
    const { data: res } = await apiDev.post(
      'cs-get-customer-support-activity-by-id',
      {
        customerSupportId: chat.customerSupportId,
      }
    );
    setChatCsaActive(
      res.data.get_customer_support_activity[0]?.status === 'online'
    );
  };

  const getMessages = async () => {
    const { data: res } = await apiDev.post('cs-get-messages-by-chat-id', {
      chatId: chat.id,
    });
    if (
      messagesLength != 0 &&
      messagesLength < res.data.cs_get_messages_by_chat_id.length &&
      res.data.cs_get_messages_by_chat_id[
        res.data.cs_get_messages_by_chat_id.length - 1
      ].authorId != userInfo?.idCode
    ) {
      audio.play();
      onRefresh();
    }
    messagesLength = res.data.cs_get_messages_by_chat_id.length;
    setMessagesList(res.data.cs_get_messages_by_chat_id);
  };

  const sendAttachmentMutation = useSendAttachment();
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

    setUserInput(e.target.files[0].name);
    setUserInputFile({
      chatId: chat.id, // TODO get chatId from the store
      name: e.target.files[0].name,
      type: e.target.files[0].type as AttachmentTypes,
      size: e.target.files[0].size,
      base64: base64,
    });
  };

  const postMessageMutation = useMutation({
    mutationFn: (message: Message) => apiDev.post('cs-post-message', message),
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
      apiDev.post('cs-post-event-message', {
        chatId: message.chatId ?? '',
        event: message.event ?? '',
        authorTimestamp: message.authorTimestamp ?? '',
      }),
    onSuccess: () => {},
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
      apiDev.post('cs-claim-chat', {
        id: chat.id ?? '',
        customerSupportId: userInfo?.idCode ?? '',
        customerSupportDisplayName: userInfo?.displayName ?? '',
        csaTitle: userInfo?.csaTitle ?? '',
        forwardedByUser: userInfo?.idCode ?? '',
        forwardedFromCsa: userInfo?.idCode ?? '',
        forwardedToCsa: userInfo?.idCode ?? '',
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
    const index = findIndex(
      CURRENT_MESSAGE_GROUPS,
      (o) => o.messages[0].id === PREVIEW_MESSAGE.messages[0].id
    );

    if (index === -1) {
      CURRENT_MESSAGE_GROUPS.push(PREVIEW_MESSAGE);
      startTransition(() => {
        setMessageGroups(CURRENT_MESSAGE_GROUPS);
      });
    } else {
      CURRENT_MESSAGE_GROUPS.splice(index, 1, PREVIEW_MESSAGE);
      startTransition(() => {
        setMessageGroups(CURRENT_MESSAGE_GROUPS);
      });
    }
  };

  const endUserFullName =
    chat.endUserFirstName !== '' && chat.endUserLastName !== ''
      ? `${chat.endUserFirstName} ${chat.endUserLastName}`
      : t('global.anonymous');

  const allSideButtons =
    chat.customerSupportId === userInfo?.idCode
      ? [
          {
            id: 'endChat',
            button: (
              <Button
                key="endChat"
                appearance="success"
                onClick={onChatEnd ? () => onChatEnd(chat) : undefined}
              >
                {t('chat.active.endChat')}
              </Button>
            ),
          },
          {
            id: 'askAuthentication',
            button: (
              <Button
                key="askAuthentication"
                appearance="secondary"
                onClick={() =>
                  handleChatEvent(CHAT_EVENTS.REQUESTED_AUTHENTICATION)
                }
              >
                {t('chat.active.askAuthentication')}
              </Button>
            ),
          },
          {
            id: 'askForContact',
            button: (
              <Button
                key="askForContact"
                appearance="secondary"
                onClick={() => handleChatEvent(CHAT_EVENTS.CONTACT_INFORMATION)}
              >
                {t('chat.active.askForContact')}
              </Button>
            ),
          },
          {
            id: 'askPermission',
            button: (
              <Button
                key="askPermission"
                appearance="secondary"
                onClick={() => handleChatEvent(CHAT_EVENTS.ASK_PERMISSION)}
              >
                {t('chat.active.askPermission')}
              </Button>
            ),
          },
          {
            id: 'forwardToColleague',
            button: (
              <Button
                key="forwardToColleague"
                appearance="secondary"
                onClick={
                  onForwardToColleauge
                    ? () => {
                        onForwardToColleauge(chat);
                        setSelectedMessages([]);
                      }
                    : undefined
                }
              >
                {t('chat.active.forwardToColleague')}
              </Button>
            ),
          },
          {
            id: 'forwardToOrganization',
            button: (
              <Button
                key="forwardToOrganization"
                appearance="secondary"
                onClick={
                  onForwardToEstablishment
                    ? () => onForwardToEstablishment(chat)
                    : undefined
                }
              >
                {t('chat.active.forwardToOrganization')}
              </Button>
            ),
          },
          {
            id: 'sendToEmail',
            button: (
              <Button
                key="sendToEmail"
                appearance="secondary"
                onClick={onSendToEmail ? () => onSendToEmail(chat) : undefined}
              >
                {t('chat.active.sendToEmail')}
              </Button>
            ),
          },
        ]
      : [];
  const [sideButtons, setSideButtons] = useState([]);
  const [buttonsToAllow] = useState<any[]>([]);

  useEffect(() => {
    if (sideButtons.length > 0) return;
    let buttons: any = [];
    // userInfo?.authorities.forEach((authority) => {
    //     // make role more uri friendly
    //     let role = authority.substring(5).replaceAll('_', '-').toLowerCase();
    //     // TODO: Replace '/active/admin.json' with '/<type>/<role>.json'.
    //     axios({ url: `import.meta.env.REACT_APP_RUUTER_V1_PRIVATE_API_URL/cdn/buttons/chats/active/${role}.json` })
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
    if (!messagesList) return;
    let groupedMessages: GroupedMessage[] = [];
    messagesList.forEach((message) => {
      const lastGroup = groupedMessages[groupedMessages.length - 1];
      if (lastGroup?.type === message.authorRole) {
        if (
          !message.event ||
          message.event === '' ||
          message.event === 'greeting'
        ) {
          lastGroup.messages.push(message);
        } else {
          groupedMessages.push({
            name: '',
            type: 'event',
            messages: [message],
          });
        }
      } else {
        if (
          !message.event ||
          message.event === '' ||
          message.event === 'greeting'
        ) {
          groupedMessages.push({
            name:
              message.authorRole === 'end-user'
                ? endUserFullName
                : message.authorRole === 'backoffice-user'
                ? `${message.authorFirstName} ${message.authorLastName}`
                : message.authorRole,
            type: message.authorRole,
            messages: [message],
          });
        } else {
          groupedMessages.push({
            name: '',
            type: 'event',
            messages: [message],
          });
        }
      }
    });
    setMessageGroups(groupedMessages);
  }, [messagesList, endUserFullName]);

  useEffect(() => {
    if (!chatRef.current || !messageGroups) return;
    chatRef.current.scrollIntoView({ block: 'end', inline: 'end' });
  }, [messageGroups]);

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

    postMessageMutation.mutate(newMessage);
    setMessagesList((oldMessages) => [...oldMessages, newMessage]);
    setResponseText('');
  };

  const handleChatEvent = (event: string) => {
    const newMessage: Message = {
      chatId: chat.id,
      authorRole: AUTHOR_ROLES.BACKOFFICE_USER,
      content: '',
      event: event,
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

  useEffect(() => {
    const sseResponse = handleSse();
    sseResponse.addEventListener(MessageSseEvent.READ, (event: any) => {
      setMessageReadStatus({
        messageId: event.data.id,
        readTime: event.data.created,
      });
    });

    sseResponse.addEventListener(
      MessageSseEvent.PREVIEW,
      (event: MessagePreviewSseResponse) => {
        setPreviewMessage(event);
      }
    );

    return () => {
      sseResponse.close();
    };
  }, []);

  const getCsaName = (message: Message) => {
    return `${
      isCsaNameVisible
        ? `${message.authorFirstName} ${message.authorLastName}`
        : ''
    } ${
      isCsaTitleVisible && chat.csaTitle !== null ? chat.csaTitle : ''
    }`.trim();
  };

  return (
    <div className="active-chat">
      <div className="active-chat__body">
        <div className="active-chat__header">
          <Track direction="vertical" gap={8} align="left">
            <p style={{ fontSize: 14, lineHeight: '1.5', color: '#4D4F5D' }}>
              {t('chat.active.startedAt', {
                date: format(new Date(chat.created), 'dd. MMMM Y HH:ii:ss', {
                  locale: et,
                }),
              })}
            </p>
            <h3>{endUserFullName}</h3>
          </Track>
        </div>

        <div className="active-chat__group-wrapper">
          {messageGroups &&
            messageGroups.map((group, index) => (
              <div
                className={clsx([
                  'active-chat__group',
                  `active-chat__group--${group.type}`,
                ])}
                key={`group-${index}`}
              >
                {group.type === 'event' ? (
                  <ChatEvent message={group.messages[0]} />
                ) : (
                  <>
                    <div className="active-chat__group-initials">
                      {group.type === 'buerokratt' ||
                      group.type === 'chatbot' ? (
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
                          key={`message-${i}`}
                          onSelect={(message) =>
                            setSelectedMessages((prevState) => [
                              ...prevState,
                              message,
                            ])
                          }
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          <div id="anchor" ref={chatRef}></div>
        </div>

        {chat.customerSupportId == userInfo?.idCode && (
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
                maxLength={CHAT_INPUT_LENGTH}
                onChange={(e) => setResponseText(e.target.value)}
              />
              <div className="active-chat__toolbar-actions">
                <Button
                  id="myButton"
                  appearance="primary"
                  onClick={handleResponseTextSend}
                >
                  <Icon icon={<MdOutlineSend fontSize={18} />} size="medium" />
                  <input
                    type="file"
                    ref={hiddenFileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </Button>
                <Button appearance="secondary" onClick={handleUploadClick}>
                  <Icon
                    icon={<MdOutlineAttachFile fontSize={18} />}
                    size="medium"
                  />
                </Button>
              </div>
            </Track>
          </div>
        )}

        {(chat.customerSupportId === '' ||
          (chat.customerSupportId !== userInfo?.idCode && !chatCsaActive)) && (
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
      </div>
      <div className="active-chat__side">
        {(chat.customerSupportId === '' ||
          chat.customerSupportId === userInfo?.idCode) && (
          <div className="active-chat__side-actions">
            <Button
              appearance="success"
              onClick={onChatEnd ? () => onChatEnd(chat) : undefined}
            >
              {t('chat.active.endChat')}
            </Button>
            <Button
              appearance="secondary"
              disabled={chat.customerSupportId != userInfo?.idCode}
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
            <Button
              appearance="secondary"
              disabled={chat.customerSupportId != userInfo?.idCode}
              onClick={() => handleChatEvent(CHAT_EVENTS.ASK_PERMISSION)}
            >
              {t('chat.active.askPermission')}
            </Button>
            <Button
              appearance="secondary"
              onClick={
                onForwardToColleauge
                  ? () => {
                      onForwardToColleauge(chat);
                      setSelectedMessages([]);
                    }
                  : undefined
              }
            >
              {t('chat.active.forwardToColleague')}
            </Button>
            <Button
              appearance="secondary"
              onClick={
                onForwardToEstablishment
                  ? () => onForwardToEstablishment(chat)
                  : undefined
              }
            >
              {t('chat.active.forwardToOrganization')}
            </Button>
            <Button
              appearance="secondary"
              disabled={chat.customerSupportId != userInfo?.idCode}
              onClick={onSendToEmail ? () => onSendToEmail(chat) : undefined}
            >
              {t('chat.active.sendToEmail')}
            </Button>
            <Button
              appearance="secondary"
              disabled={chat.customerSupportId != userInfo?.idCode}
              onClick={
                onStartAService ? () => onStartAService(chat) : undefined
              }
            >
              {t('chat.active.startService')}
            </Button>
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
                <Button
                  appearance="secondary"
                  onClick={
                    onForwardToColleauge
                      ? () => {
                          onForwardToColleauge(chat);
                          setSelectedMessages([]);
                        }
                      : undefined
                  }
                >
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
              {format(new Date(chat.created), 'dd. MMMM Y HH:ii:ss', {
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

  function handleSendAttachment() {
    const mutationArgs = {
      data: userInputFile!,
    };
    sendAttachmentMutation.mutate(mutationArgs as any);
    sendAttachmentMutation.isLoading && console.log('Attachment sending...');
    sendAttachmentMutation.isSuccess && console.log('Attachment sent');
    sendAttachmentMutation.isError && console.log('Attachment sending error');
  }

  async function handleFileRead(file: File): Promise<string | null> {
    if (!Object.values(AttachmentTypes).some((v) => v === file.type)) {
      setErrorMessage(`${file.type} file type is not supported`);
      return null;
    }

    if (file.size > MESSAGE_FILE_SIZE_LIMIT) {
      setErrorMessage(
        `Max allowed file size is ${formatBytes(MESSAGE_FILE_SIZE_LIMIT)}`
      );
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
        reject(error);
      };
    });
  }
};
export default Chat;
