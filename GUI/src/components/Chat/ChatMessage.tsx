import {FC, useState} from 'react';
import {format} from 'date-fns';
import clsx from 'clsx';
import {MdOutlineCheck} from 'react-icons/md';
import {Message} from "../../types/message";
import {MessageStatus} from "../../types/chat";

type ChatMessageProps = {
    message: Message;
    onSelect: (message: Message) => void;
    readStatus: {
        current: MessageStatus;
    };
}

const ChatMessage: FC<ChatMessageProps> = ({message, onSelect, readStatus}) => {
    const [selected, setSelected] = useState(false);

    return (
        <div className={clsx('active-chat__messageContainer')}>
            <div className={clsx('active-chat__message', {'active-chat__message--selected': selected})}>
                <div className='active-chat__message-text' onClick={() => {
                    setSelected(!selected);
                    onSelect(message);
                }}>{message.content}</div>
                <time dateTime={message.authorTimestamp} className='active-chat__message-date'>
                    {format(new Date(message.authorTimestamp), 'HH:ii:ss')}
                </time>
                {selected && (
                    <div className='active-chat__selection-icon'>
                        <MdOutlineCheck/>
                    </div>
                )}
            </div>
            {readStatus.current.messageId === message.id ? (
                <span className='active-chat__message-status'>Loetud
                  <time
                      dateTime={readStatus.current.readTime}> {format(new Date(readStatus.current.readTime), 'HH:ii:ss')}</time></span>
            ) : null}
        </div>
    );
};

export default ChatMessage;
