// @ts-ignore npm i --save-dev @types/mocksse does not exist
import {MockEvent, EventSource} from 'mocksse';
import {chatMessagesSeenSse} from "./chatMessagesSeenSse";

import {MessageSseEvent} from "../types/chat";
import {chatMessagesPreviewNew1Sse,chatMessagesPreviewNew2Sse,chatMessagesPreviewNew3Sse} from "./chatMessagesPreviewNewSse";


const handleSse = () => {
    new MockEvent({
        // TODO: set correct url
        url: 'http://localhost:3000/cs-get-new-messages',
        setInterval: [3_000, 2_000, 3_000, 4_000],
        responses: [
            {type: MessageSseEvent.READ, data: chatMessagesSeenSse},
            // {type: MessageSseEvent.DELIVERED, data: chatMessagesSeen},
            {type: MessageSseEvent.PREVIEW, data: chatMessagesPreviewNew1Sse },
            {type: MessageSseEvent.PREVIEW, data: chatMessagesPreviewNew2Sse },
            {type: MessageSseEvent.PREVIEW, data: chatMessagesPreviewNew3Sse },
        ]
    });

    // TODO: set correct url
    return new EventSource('http://localhost:3000/cs-get-new-messages',{
        withCredentials: true
    });

    // TODO find out what is the event name for message-delivered
    // eventSource.addEventListener(Message.DELIVERED, (event: any) => {
    //     console.log('event message-delivered', event.data.id);
    // });

    //TODO: handle error
    // eventSource.onerror = (error:any) => {
    //     // Expect to see the following message
    //     // error.message === '`EventSource` instance closed while sending.'
    // };
}

export default handleSse;