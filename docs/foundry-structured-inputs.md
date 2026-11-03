# Foundry agent: sending the end user's page URL

Bürokratt can send the URL of the page the end user is on to the Foundry agent with every message. The agent can then use it, for example to search only the content that belongs to that page.

It works through Foundry [structured inputs](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/structured-inputs). The URL is sent as `structured_inputs.url`, and the agent uses it through the `{{url}}` placeholder.

## Enabling it

1. Backoffice → **Settings → SKM configuration**
2. Turn on **Use agentic retrieval**
3. Turn on **Include current end-user URL as context in each request**
4. Save

| Config key | Default |
|:--|:--|
| `azure_agentic_use_structured_inputs` | `false` |

- The switch applies to both the SKM and the BGK agentic paths. BGK uses its own `BGK_USE_AGENTIC` to turn agentic retrieval on, but reads this switch from the SKM configuration.
- With multi-domain enabled, the switch can be set per domain.
- When the switch is off, requests are sent as before, without `structured_inputs`.

## Agent definition

The agent must declare a `url` structured input and use `{{url}}`, for example in the search filter:

```json
{
  "definition": {
    "kind": "prompt",
    "model": "gpt-5.4",
    "instructions": "You are a helpful assistant. Always provide citations.",
    "tools": [
      {
        "type": "azure_ai_search",
        "azure_ai_search": {
          "indexes": [
            {
              "query_type": "vector_semantic_hybrid",
              "top_k": 12,
              "index_asset_id": "<index_name>/versions/1",
              "filter": "url eq '{{url}}'"
            }
          ]
        }
      }
    ],
    "structured_inputs": {
      "url": {
        "description": "The page the end user is on",
        "required": true,
        "schema": { "type": "string" }
      }
    },
    "tool_choice": "required"
  }
}
```

## Request sent to Foundry

```json
{
  "input": [{ "role": "user", "content": "What services do you offer?" }],
  "agent": { "name": "my-agent", "type": "agent_reference" },
  "structured_inputs": { "url": "https://example.com/en/services" },
  "max_output_tokens": 10000,
  "stream": false
}
```

## How it works

- The widget sends the current page URL (`window.location.href`) as `endUserUrl` with every message. If the user moves to another page, the next message carries the new URL.
- Ruuter stores the URL with the user's message (`message.end_user_url`) and passes it on to the bot.
- Chat history still shows the URL of the page where the chat started (`chat.end_user_url`).

## Good to know

- **Exact match:** the full URL is sent, including query string and `#hash`. A filter such as `url eq '{{url}}'` only matches if the `url` field in the index is exactly the same.
- **Required input:** if the agent marks `url` as `required`, turn the switch on before using that agent. Otherwise requests without a URL may fail. To avoid this, give the input a default value in the agent definition.
- **Privacy:** URLs can contain personal data. The URL is stored with each message and sent to Azure, and the anonymizer does not process it.
