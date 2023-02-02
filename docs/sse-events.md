### A list of Bürokratt Chatbot's SSE events

The following is a list of events sent **by back-end to front-end** by using Server-Sent Events (SSE).

This content is to be used by front-end developers to create and test applying appropriate styles and actions on widget-side.

| Event description                                                                                                          | REST endpoint                    | Content of interest                                     | Sample response                                                             |
| :------------------------------------------------------------------------------------------------------------------------- | :------------------------------- | :------------------------------------------------------ | :-------------------------------------------------------------------------- |
| End chat session by the End User                                                                                           | /end-chat                        |                                                         |                                                                             |
| [End chat session by the CSA](https://github.com/buerokratt/Buerokratt-Chatbot/issues/6)                                   | /cs-end-chat                     |                                                         |                                                                             |
| [Provide End User estimated waiting for response](https://github.com/buerokratt/Buerokratt-Chatbot/issues/48)              | /estimated-waiting-time          |                                                         | [Estimated waiting time for response](#Estimated-waiting-time-for-response) |
| [Provide End User estimated waiting for response](https://github.com/buerokratt/Buerokratt-Chatbot/issues/48)              | /estimated-waiting-time/{CHATID} |                                                         | [Estimated waiting time for response](#Estimated-waiting-time-for-response) |
| [Notification of the authentication result](https://github.com/buerokratt/Buerokratt-Chatbot/issues/46)                    |     /login-with-tara-jwt                             |                                                         |                                                                             |
| [Show information about chat forwarding and takeover](https://github.com/buerokratt/Buerokratt-Chatbot/issues/39)          | /cs-get-messages-by-chat-id      | `forwardedByUser`, `forwardedFromCsa`, `forwardedToCsa` |                                                                             |
| [CSA sees if the End User has seen message](https://github.com/buerokratt/Buerokratt-Chatbot/issues/11)                    | /cs-get-new-messages             |                                                         |                                                                             |
| [Notifications about unanswered and new active forwarded chat](https://github.com/buerokratt/Buerokratt-Chatbot/issues/24) |                                  |                                                         |                                                                             |
| [Show information about chat activities](https://github.com/buerokratt/Buerokratt-Chatbot/issues/42)                       |                                  |                                                         |                                                                             |
| [End User is notified when Bürokratt is not working](https://github.com/buerokratt/Buerokratt-Chatbot/issues/43)           | /healthz                         |                                                         | [System health-check](#System-health-check)                                 |
|                                                                                                                            |                                  |                                                         |                                                                             |

### Sample requests

#### Estimated waiting time for response

Return for `/estimated-waiting-time`

```json
{ "response": { "durationInSeconds": "100", "positionInUnassignedChats": "0" } }
```

Return for `/estimated-waiting-time/{CHATID}`

```json
{ "response": { "durationInSeconds": "300", "positionInUnassignedChats": "3" } }
```

#### System health-check

```json
{"data":{"set_healthz_response":{"data":[{"name":"TIM","version":"1.0"},{"name":"RUUTER","version":"1.0"},{"name":"DMAPPER","version":"1.0"},{"name":"RESQL","version":"1.0"}]}},"error":null}
```
