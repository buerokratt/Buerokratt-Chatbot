import { FormTextarea, Icon, Track } from 'components';
import { useToast } from 'hooks/useToast';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineEdit, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { apiDev } from 'services/api';

const MessageContentView = (props: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(props.getValue());
  const [inputContent, setInputContent] = useState(content);
  const toast = useToast();
  const { t } = useTranslation();

  return (
    <Track gap={10}>
      {!isEditing && (
        <label
          style={{
            display: 'block',
            maxWidth: '300px',
            overflowY: 'auto',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            maxHeight: '70px',
            fontSize: '15.5px',
          }}
        >
          {content}
        </label>
      )}
      {isEditing && (
        <div style={{ width: '80%' }}>
          <FormTextarea
            name={''}
            label={''}
            minRows={1}
            maxRows={5}
            defaultValue={content}
            onChange={(e) => {
              setInputContent(e.target.value);
            }}
          ></FormTextarea>
        </div>
      )}
      {!isEditing && (
        <Icon
          style={{ cursor: 'pointer' }}
          icon={
            <AiOutlineEdit fontSize={22} onClick={() => setIsEditing(true)} />
          }
          size="medium"
        />
      )}
      {isEditing && (
        <Icon
          style={{ cursor: 'pointer' }}
          icon={
            <AiOutlineCheck
              fontSize={22}
              color="#308653"
              onClick={async () => {
                if (inputContent.length === 0) return;
                try {
                  await apiDev.post('chats/messages/edit', {
                    chatId: props.row.original.chatId,
                    messageId: props.row.original.id,
                    content: inputContent,
                  });
                  setIsEditing(false);
                  setContent(inputContent);
                  toast.open({
                    type: 'success',
                    title: t('global.notification'),
                    message: t('chat.validations.messageChanged'),
                  });
                } catch (_) {
                  toast.open({
                    type: 'error',
                    title: t('global.notificationError'),
                    message: t('chat.validations.messageChangeFailed'),
                  });
                }
              }}
            />
          }
          size="medium"
        />
      )}
      {isEditing && (
        <Icon
          style={{ cursor: 'pointer' }}
          icon={
            <AiOutlineClose
              fontSize={22}
              color="#D73E3E"
              onClick={() => {
                setIsEditing(false);
                setInputContent(content);
              }}
            />
          }
          size="medium"
        />
      )}
    </Track>
  );
};

export default MessageContentView;
