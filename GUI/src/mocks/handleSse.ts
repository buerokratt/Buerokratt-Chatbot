// @ts-ignore
import {MockEvent, EventSource} from 'mocksse';
import {chatMessagesSeen} from "./chatMessagesSeen";

enum Message {
    READ = 'message-read',
    DELIVERED = 'message-delivered',
}

/*
TODO: find out how to set
{ withCredentials: true }
*/

const handleSse = (messageGroups: any) => {
// Instantiate a MockEvent.
//     console.log('messageGroups', messageGroups)
    new MockEvent({
        // TODO: set correct url
        url: 'http://localhost:3000/cs-get-new-messages',
        setInterval: [5_000, 8_000],
        responses: [
            {type: Message.READ, data: chatMessagesSeen},
            {type: Message.DELIVERED, data: chatMessagesSeen},
        ]
    });

    // TODO: set correct url
    const eventSource = new EventSource('http://localhost:3000/cs-get-new-messages');

    // TODO find out what is the event name for message-delivered
    // eventSource.addEventListener(Message.DELIVERED, (event: any) => {
    //     console.log('event message-delivered', event.data.id);
    //
    // });


    eventSource.addEventListener(Message.READ, (event: any) => {
        const readMessageId = event.data.id;
        let messageReadStatus = false;
        let messageReadTime = event.data.authorTimestamp;
        messageGroups.forEach((messageGroup) => {
                if (messageGroup.messages[0].id === readMessageId) messageReadStatus = true;
            }
        );
        if(messageReadStatus) {
            messageGroups.forEach((messageGroup) => {
                if (messageGroup.messages[0].id === readMessageId) {
                    messageGroup.messages[0].read = messageReadStatus;
                    messageGroup.messages[0].readTime = messageReadTime;
                }
            });
        }

        return messageGroups;
            // return a response with the updated messageGroups

    });

    //TODO: handle error
    // eventSource.onerror = (error:any) => {
    //     // Expect to see the following message
    //     // error.message === '`EventSource` instance closed while sending.'
    // };
    let response = {
        eventSource: eventSource,
        messageGroups: messageGroups,

    }
    return response;
}

export default handleSse;