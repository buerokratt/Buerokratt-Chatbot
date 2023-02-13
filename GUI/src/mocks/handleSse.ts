// @ts-ignore npm i --save-dev @types/mocksse does not exist
import {MockEvent, EventSource} from 'mocksse';
import {chatMessagesSeen} from "./chatMessagesSeen";
import {MessageSseEvent} from "../types/chat";

/*
TODO: find out how to set
{ withCredentials: true }
*/

const handleSse = () => {
    new MockEvent({
        // TODO: set correct url
        url: 'http://localhost:3000/cs-get-new-messages',
        setInterval: 3_000,
        responses: [
            {type: MessageSseEvent.READ, data: chatMessagesSeen},
            // {type: MessageSseEvent.DELIVERED, data: chatMessagesSeen},
        ]
    });

    // TODO: set correct url
    return new EventSource('http://localhost:3000/cs-get-new-messages');

    // TODO find out what is the event name for message-delivered
    // eventSource.addEventListener(Message.DELIVERED, (event: any) => {
    //     console.log('event message-delivered', event.data.id);
    //
    // });

    //TODO: handle error
    // eventSource.onerror = (error:any) => {
    //     // Expect to see the following message
    //     // error.message === '`EventSource` instance closed while sending.'
    // };
}

export default handleSse;