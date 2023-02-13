import {Message} from "../../types/message";
import {Chat as ChatType} from "../../types/chat";

export type ChatProps = {
    chat: ChatType;
    onChatEnd: (chat: ChatType) => void;
    onForwardToColleauge?: (chat: ChatType) => void;
    onForwardToEstablishment?: (chat: ChatType) => void;
    onSendToEmail?: (chat: ChatType) => void;
}

export type GroupedMessage = {
    name: string;
    type: string;
    messages: Message[];
}

export enum MessageSseEvent {
    READ = 'message-read',
    DELIVERED = 'message-delivered'
}

export type ChatMessageProps = {
    message: Message;
    onSelect: (message: Message) => void;
    readStatus: {
        current: MessageStatus
    };
}

export type MessageStatus = {
    messageId: string | null;
    readTime: any;
}