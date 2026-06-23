# LLM Module Integration — What Was Actually Implemented

This document records the changes made to integrate the BYK Chatbot with the self-hosted LLM Module.

---

## Commits

| Commit | Author | Description |
|--------|--------|-------------|
| `7dbdfb9a` | Ahmed Yasser | Added `llm_module_active` config flag (DB + GUI) |
| `d7e798d3` | Ruwini Rathnamalala | Chat flow integration with LLM Module (core wiring) |
| `6f55ae99` | Ruwini Rathnamalala | Sonar/code quality fixes on integration code |

---

## Changes by File

### 1. `DSL/Liquibase/changelog/20271351142952_add_llm_module_active_config.xml` _(new file)_

Inserts the feature flag into the `configuration` table on first deployment.

```xml
<changeSet id="20271351142952" author="ahmedyasser">
    <insert tableName="configuration">
        <column name="key" value="llm_module_active"/>
        <column name="value" value="false"/>
    </insert>
</changeSet>
```

**Default is `false`** — the existing Azure/Rasa/SKM flow continues to run unchanged until an admin explicitly enables the flag.

---

### 2. `DSL/Ruuter.public/backoffice/POST/internal/message-to-bot.yml`

This is the central routing file for every user message. The change adds an LLM branch that runs **before** the existing Azure intent detection.

**Before (simplified):**
```
check_bot_activity_result
    └── is_bot_active = true → check_for_intent (Azure)
    └── is_bot_active = false → assign_bot_not_active_response
```

**After:**
```
check_bot_activity_result
    └── is_bot_active = true → get_llm_module_active  ← NEW
                                    └── llm_module_active = true → get_chat_history_for_llm → assign_chat_history → call_llm_stream
                                    └── llm_module_active = false → check_for_intent (Azure, unchanged)
    └── is_bot_active = false → assign_bot_not_active_response (unchanged)
```

**New YAML steps added:**

```yaml
get_llm_module_active:
  call: http.post
  args:
    url: "[#CHATBOT_RESQL]/get-configuration"
    body:
      key: "llm_module_active"
  result: llm_module_active_result
  next: check_llm_module_active

check_llm_module_active:
  switch:
    - condition: ${llm_module_active_result.response.body[0]?.value === 'true'}
      next: get_chat_history_for_llm
  next: check_for_intent

get_chat_history_for_llm:
  call: http.post
  args:
    url: "[#CHATBOT_RESQL]/get-chat-messages"
    body:
      chatId: ${chatId}
  result: chat_history_result
  next: assign_chat_history

assign_chat_history:
  assign:
    conversation_history: '$=chat_history_result.response.body.map(m => ({
      authorRole: (m.author_role === "assistant" ? "bot" : m.author_role),
      message: m.content,
      timestamp: m.created
    }))='
  next: call_llm_stream

call_llm_stream:
  call: http.post
  args:
    url: "[#CHATBOT_NOTIFICATIONS]/channels/${chatId}/llm-stream"
    body:
      chatId: ${chatId}
      message: ${content}
      authorId: ${chat_bot_name}
      conversationHistory: ${conversation_history}
  result: llm_stream_result
  next: return_message_sent
```

**Key points:**
- Fetches full conversation history from DB before calling the LLM so the model has context.
- Maps `author_role = "assistant"` → `"bot"` to match the LLM Module's expected format.
- Calls the new `/channels/:chatId/llm-stream` endpoint on the Notification Server.
- Returns `202 Accepted` immediately; streaming happens asynchronously over SSE.

---

### 3. `notification-server/src/server.js`

Added the new HTTP endpoint that Ruuter calls to trigger LLM streaming.

```javascript
app.post('/channels/:channelId/llm-stream', async (req, res) => {
  const { channelId } = req.params;
  const { chatId, message, authorId, conversationHistory = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  res.status(202).json({ response: 'stream triggered' });

  createLLMOrchestrationStreamRequest({
    channelId,
    chatId: chatId || channelId,
    message,
    authorId,
    conversationHistory,
  }).catch((error) => {
    console.error('LLM stream error for channel:', error.message);
  });
});
```

**Why 202 and not 200?** Ruuter waits for a response before continuing. Returning 202 immediately unblocks Ruuter while the actual streaming to the Chat Widget continues asynchronously over the existing SSE connection.

---

### 4. `notification-server/src/openSearch.js`

Added `createLLMOrchestrationStreamRequest` — the function that:

1. Finds all active SSE connections for the given `channelId`.
2. If none are connected yet, queues the request in `streamQueue` (will replay when the widget connects).
3. For each active connection, POSTs to the LLM Orchestration Service at `/orchestrate/stream`.
4. Reads the SSE response from the LLM Module line by line and relays each token to the Chat Widget.

**SSE event protocol used:**

| Event sent to widget | When |
|----------------------|------|
| `stream_start` | Before first token arrives |
| `stream_chunk` | Each token from the LLM |
| `stream_complete` | When LLM sends `"END"` sentinel |
| `stream_error` | On fetch or parse failure |

**After code-quality fixes, the function was refactored into four helpers** to reduce cognitive complexity:

- `buildConversationHistory(conversationHistory)` — role normalisation mapping
- `processSSELine(line, sender, channelId)` — parses one SSE line, returns `true` on `END`
- `readLLMStream(reader, decoder, sender, channelId, connectionId)` — drives the read loop
- `handleLLMConnection(connectionId, connData, payload, channelId)` — fetch + stream + error handling per connection

---

### 5. `notification-server/src/sseUtil.js`

Updated the queue-replay logic (`processPendingRequests`) to handle LLM-queued requests.

When the Chat Widget connects (SSE opens), any requests that arrived while there was no active connection are replayed. The queue can now contain either an Azure stream request or an LLM stream request. The dispatch check was changed from a negated condition to a positive one:

```javascript
// Before (negated condition — Sonar warning)
if (requestData.message !== undefined) { /* LLM path */ } else { /* Azure path */ }

// After (positive condition)
if (requestData.message === undefined) { /* Azure path */ } else { /* LLM path */ }
```

---

### 6. `constants.ini`

```ini
LLM_ORCHESTRATOR_URL=http://llm-orchestration-service:8100
```

The Docker service name `llm-orchestration-service` is used because both the Chatbot stack and the LLM Module stack share the `bykstack` Docker network.

---

### 7. `notification-server/.env`

```
LLM_ORCHESTRATOR_URL=http://llm-orchestration-service:8100
```

Same value injected as a Node.js environment variable for the Notification Server container.

---

### 8. DB + GUI changes for `llm_module_active` flag (commit `7dbdfb9a`)

| File | Change |
|------|--------|
| `DSL/Liquibase/...add_llm_module_active_config.xml` | Inserts `llm_module_active=false` on deploy |
| `DSL/Resql/backoffice/POST/get-bot-config.sql` | Reads `llm_module_active` alongside other bot configs |
| `DSL/Resql/backoffice/POST/set-bot-config.sql` | Writes `llm_module_active` value |
| `DSL/Ruuter.private/.../configs/bot-config.yml` | GET/POST endpoints for the flag |
| `GUI/src/pages/Settings/SettingsChatSettings/index.tsx` | Toggle switch in BYK Admin UI |
| `GUI/src/types/botConfig.ts` | Added `llmModuleActive` field to type |
| `GUI/translations/en/common.json` | English label: "LLM Module Active" |
| `GUI/translations/et/common.json` | Estonian label |

**To enable the LLM Module:** go to BYK Admin GUI → Settings → toggle **LLM Module Active** ON.  
**To roll back:** toggle it OFF. No deployment needed. The Azure/Rasa/SKM path resumes instantly.

---

## End-to-End Flow (LLM Module Active)

```
User types message in Chat Widget
        │
        ▼
Chat Widget  →  GET /sse/notifications/:chatId  (SSE connection open, listening)
        │
        ▼
Ruuter  POST /chats/messages/add
        │
        ▼
message-to-bot.yml
        ├── Resql: is bot active? → yes
        ├── Resql: is llm_module_active? → true
        ├── Resql: get-chat-messages (fetch history for chatId)
        └── Notification Server  POST /channels/:chatId/llm-stream
                    │  (returns 202 immediately)
                    ▼
            LLM Orchestration Service  POST /orchestrate/stream
                    │  (SSE stream back)
                    │
                    ├──► stream_start  →  Chat Widget (typing indicator)
                    ├──► stream_chunk  →  Chat Widget (word by word)
                    ├──► stream_chunk  →  ...
                    └──► stream_complete → Chat Widget (saves full message to DB)
```
