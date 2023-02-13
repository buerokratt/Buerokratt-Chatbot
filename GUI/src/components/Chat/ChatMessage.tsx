import {FC, useEffect, useLayoutEffect, useState} from 'react';
import {format} from 'date-fns';

import {Message} from 'types/message';
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
    const [messageStatus, setMessageStatus] = useState<any>({
        read: false,
        readTime: null,
    })

    useLayoutEffect(() => {
        console.log('message.read', message)
        if (message.read === true) {
            setMessageStatus({
                read: true,
                readTime: message.readTime,
            })
        }
    }, [message]);

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
            {messageStatus.read === true && (
                // <span style={{color: 'red'}}>Message Read</span>
                <span className='active-chat__message-status'>{null ? MessageStatus.READ : MessageStatus.DELIVERED}
                    <time
                        dateTime={message.authorTimestamp}> {format(new Date(messageStatus.readTime), 'HH:ii:ss')}</time></span>
            )}
        </div>
    );
};

export default ChatMessage;
