# A list of Bürokratt Chatbot's SSE events

The following is a list of events sent **by back-end to front-end** by using Server-Sent Events (SSE).

This content is to be used by front-end developers to create and test applying appropriate styles and actions on widget-side.

| Event description                                                                                                          | REST endpoint                      | Content of interest                                     | Sample response                                                             |
|:-------------------------------------------------------------------------------------------------------------------------- |:---------------------------------- |:------------------------------------------------------- |:--------------------------------------------------------------------------- |
| Start new chat (ruuter_v1 public /init-chat)                                                                               | /init-chat                         | `datamapper_url` / `post_customer_support_agent_notification`      | [Start new chat](#Start-new-chat)                                           |
| End chat session by the End User                                                                                           | /end-chat                          |                                                         | [End chat session by end user](#End-chat-session-by-end-user)               |
| [End chat session by the CSA](https://github.com/buerokratt/Buerokratt-Chatbot/issues/6)                                   | /cs-end-chat                       |                                                         | [End chat session by CSA](#End-chat-session-by-CSA)                         |
| [Provide End User estimated waiting for response](https://github.com/buerokratt/Buerokratt-Chatbot/issues/48)              | /estimated-waiting-time            |                                                         | [Estimated waiting time for response](#Estimated-waiting-time-for-response) |
| [Provide End User estimated waiting for response](https://github.com/buerokratt/Buerokratt-Chatbot/issues/48)              | /estimated-waiting-time?chatId=123 |                                                         | [Estimated waiting time for response](#Estimated-waiting-time-for-response) |
| [Notification of the authentication result](https://github.com/buerokratt/Buerokratt-Chatbot/issues/46)                    | /login-with-tara-jwt |     `cs-get-messages-by-chat-id` "event": "authentication_successful"                                                     |     [Notification of authentication result](#Notification-of-authentication-result)                                                                        | 
| [Show information about chat forwarding and takeover](https://github.com/buerokratt/Buerokratt-Chatbot/issues/39)          | /cs-get-messages-by-chat-id        | `forwardedByUser`, `forwardedFromCsa`, `forwardedToCsa` | [Chat forwarding and takeover](#Chat-forwarding-and-takeover)               |
| [CSA sees if the End User has seen message](https://github.com/buerokratt/Buerokratt-Chatbot/issues/11)                    | /cs-get-new-messages               | ` "event": "message-read"`                              | [End user has seen message event](#End-user-has-seen-message-event)         |
| [Notifications about unanswered and new active forwarded chat](https://github.com/buerokratt/Buerokratt-Chatbot/issues/24) | /cs-get-all-active-chats           | `customerSupportId` when not empty/null, `event` when `redirected` |                                                                             |
| [Show information about chat activities](https://github.com/buerokratt/Buerokratt-Chatbot/issues/42)                       | All confs which get messages       | all `event` field values                                           | [Chat activities](#Chat-activities)                                         |
| [End User is notified when Bürokratt is not working](https://github.com/buerokratt/Buerokratt-Chatbot/issues/43)           | /cs-get-components-healthz-status  |                                                         | [System health-check](#System-health-check)                                 |
|                                                                                                                            |                                    |                                                         |                                                                             |

# Sample requests

## Estimated waiting time for response

Return for `/estimated-waiting-time`

```json
{
  "response": {
    "durationInSeconds": "100",
    "positionInUnassignedChats": "0"
  }
}
```

Return for `/estimated-waiting-time?chatId=123`

```json
{
  "response": {
    "durationInSeconds": "300",
    "positionInUnassignedChats": "3"
  }
}
```

## System health-check

```json
{
  "data": {
    "set_healthz_response": {
      "data": [
        {
          "name": "TIM",
          "version": "1.0"
        },
        {
          "name": "RUUTER",
          "version": "1.0"
        },
        {
          "name": "DMAPPER",
          "version": "1.0"
        },
        {
          "name": "RESQL",
          "version": "1.0"
        }
      ]
    }
  },
  "error": null
}
```

## Chat forwarding and takeover

Request body for POST: `cs-redirect-chat`

```json
{
  "id": "8cecdc84-57fb-4f18-845e-5ca0be3d6223",
  "customerSupportDisplayName": "someCsaAgent",
  "customerSupportId": "EE123Csa1Id",
  "forwardedByUser": "EE123AdminId",
  "forwardedFromCsa": "EE123Csa1Id",
  "forwardedToCsa": "EE123Csa2Id"
}
```


Response for GET: `cs-get-messages-by-chat-id`

```json
{
  "data": {
    "cs_get_messages_by_chat_id": [
      {
        "id": "f25ea8f0-ed23-4abf-9f76-d99b21094d69",
        "chatId": "8cecdc84-57fb-4f18-845e-5ca0be3d6223",
        "content": "hello",
        "event": "",
        "authorId": "",
        "authorTimestamp": "2023-01-18T12:56:52.159+00:00",
        "authorFirstName": "",
        "authorLastName": "",
        "authorRole": "end-user",
        "forwardedByUser": "someAdminUser",
        "forwardedFromCsa": "csa1",
        "forwardedToCsa": "csa2",
        "rating": "",
        "created": "2023-01-18T12:56:52.895+00:00",
        "updated": "2023-01-18T12:56:52.909+00:00"
      }
    ]
  },
  "error": null
}
```

## End user has seen message event

Request body for POST: `post-message`

```json
{
  "chatId": "23f2ebbc-90d4-4716-9894-9e14f553a852",
  "authorRole": "end-user",
  "authorTimestamp": "2023-01-13T14:23:52.953Z",
  "content": "",
  "event": "message-read"
}
```

Response body for SSE: `cs-get-new-messages`

```json
{
  "id": "0e6c2a27-fbc1-4f07-9c84-e941af4fce51",
  "chatid": "7045872f-bb09-4b8e-8dd0-76783983792b",
  "content": "",
  "event": "message-read",
  "authorId": "",
  "authorTimestamp": "2023-01-24T08:42:01.352+00:00",
  "authorFirstName": "",
  "authorLastName": "",
  "authorRole": "end-user",
  "forwardedByUser": null,
  "forwardedFromCsa": null,
  "forwardedToCsa": null,
  "rating": "",
  "created": "2023-01-24T08:42:01.538+00:00",
  "updated": "2023-01-24T08:42:01.545+00:00",
}
```

## Chat activities

Response body for SSE: `cs-get-new-messages`

```json
{
  "id": "0e6c2a27-fbc1-4f07-9c84-e941af4fce51",
  "chatid": "7045872f-bb09-4b8e-8dd0-76783983792b",
  "content": "",
  "event": "message-read",
  "authorId": "",
  "authorTimestamp": "2023-01-24T08:42:01.352+00:00",
  "authorFirstName": "",
  "authorLastName": "",
  "authorRole": "end-user",
  "forwardedByUser": null,
  "forwardedFromCsa": null,
  "forwardedToCsa": null,
  "rating": "",
  "created": "2023-01-24T08:42:01.538+00:00",
  "updated": "2023-01-24T08:42:01.545+00:00",
}
```

## End chat session by CSA

Request payload for POST: `cs-end-chat`

```json
{
  "chatId": "7045872f-bb09-4b8e-8dd0-76783983792b",
  "event": "ACCEPTED",
  "authorTimestamp": "2023-02-02T07:44:42.612Z",
  "authorFirstName": "Mary-Änn",
  "authorId": "EE49003106521",
  "authorRole": "backoffice-user"
}
```

## End chat session by end user

Request payload for POST: `end-chat`
```json
{
  "chatId": "7c237f49-7850-4b53-b008-4909c43fc298",
  "event": "client-left",
  "authorTimestamp": "2023-02-02T07:49:41.133Z",
  "authorRole": "end-user"
}
```

## Notification of authentication result

Response of `cs-get-messages-by-chat-id`
```json
{
  "cs_get_messages_by_chat_id": [
    {
      "id": "7d9cc156-6934-473c-92d8-81462e212765",
      "chatId": "3b71c597-cbb7-4f6e-ba99-a77acaefbe11",
      "content": "",
      "event": "authentication_successful",
      "authorId": "",
      "authorTimestamp": "2023-02-06T08:17:33.790+00:00",
      "authorFirstName": "",
      "authorLastName": "",
      "authorRole": "backoffice-user"
      "forwardedByUser": "",
      "forwardedFromCsa": "",
      "forwardedToCsa": "",
      "rating": "",
      "created": "2023-02-06T08:17:33.791+00:00",
      "updated": "2023-02-06T08:17:33.802+00:00"
    }
  ]
}
```

