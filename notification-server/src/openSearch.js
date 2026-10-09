const { v4: uuidv4 } = require('uuid');

const { sendAzureAgenticRequest } = require('./azureAgenticRequest');
const {
  extractMessageTextPart,
  formatAgenticCitations,
  mapAnnotationsToCitations,
  createAgenticStreamState,
  consumeAgenticStreamDelta,
  flushAgenticStreamBuffer,
  hasAzureAiSearchTool,
} = require('./citationFormatting');
const { newNotificationsConfig } = require('./config');

const stoppedChannels = new Set();

const AGENTIC_GUARDRAIL_MESSAGE = "I'm sorry, but i cannot assist with that request.";
const ESTONIAN_GUARDRAIL_MESSAGE = 'Palun vabandust, aga kahjuks ei saa ma sellele päringule vastata.';

async function publishNotificationEvent(chatId, event) {
  const envelope = {
    eventUuid: uuidv4(),
    recipient: 'CHAT',
    recipientUuid: [chatId],
    type: event.type,
    payload: event,
  };

  const response = await fetch(newNotificationsConfig.eventUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(envelope),
  });

  if (!response.ok) {
    throw new Error(`New notification event was rejected: ${response.status} ${response.statusText}`);
  }
}

function isGuardrailMessage(text) {
  return text.trim().toLowerCase() === AGENTIC_GUARDRAIL_MESSAGE.toLowerCase();
}

// Holds the start of a streamed answer until it is clear it is not the guardrail message
function holdGuardrailText(held, text) {
  if (!held.isHolding || !text) return text;
  held.text += text;
  if (AGENTIC_GUARDRAIL_MESSAGE.toLowerCase().startsWith(held.text.trim().toLowerCase())) return '';
  held.isHolding = false;
  return held.text;
}

function releaseHeldText(held) {
  if (!held.isHolding) return '';
  return isGuardrailMessage(held.text) ? ESTONIAN_GUARDRAIL_MESSAGE : held.text;
}

async function streamAgenticResponse({ response, channelId }) {
  const citationState = createAgenticStreamState();
  const held = { text: '', isHolding: true };
  let finalAnnotations = [];

  for await (const part of response) {
    if (stoppedChannels.has(channelId)) break;

    if (part.type === 'response.output_text.delta') {
      const emitText = holdGuardrailText(held, consumeAgenticStreamDelta(citationState, part.delta || ''));
      if (emitText) {
        await publishNotificationEvent(channelId, {
          type: 'stream_chunk',
          channelId,
          content: emitText,
          isComplete: false,
        });
      }
    } else if (part.type === 'response.completed') {
      const fullResponse = part.response ?? part;
      finalAnnotations = hasAzureAiSearchTool(fullResponse)
        ? extractMessageTextPart(fullResponse)?.annotations || []
        : [];
    }
  }

  if (stoppedChannels.has(channelId)) return;

  const trailingText = releaseHeldText(held) + flushAgenticStreamBuffer(citationState);
  if (trailingText) {
    await publishNotificationEvent(channelId, {
      type: 'stream_chunk',
      channelId,
      content: trailingText,
      isComplete: false,
    });
  }

  const citations = mapAnnotationsToCitations(finalAnnotations);

  await publishNotificationEvent(channelId, {
    type: 'stream_complete',
    channelId,
    content: '',
    context: citations.length > 0 ? { citations } : {},
    isComplete: true,
  });
}

async function fetchAgenticResponse({
  messages,
  options,
  stream,
  agent_name,
  agent_type,
  azure_client_id,
  azure_client_secret,
  azure_agentic_max_output_tokens,
  structured_inputs,
}) {
  return sendAzureAgenticRequest(messages, {
    ...options,
    stream,
    agent_name,
    agent_type,
    client_id: azure_client_id,
    client_secret: azure_client_secret,
    max_output_tokens: azure_agentic_max_output_tokens,
    structured_inputs,
  }).catch((error) => {
    if (stream || !error.message?.includes('"code":"content_filter"')) throw error;
    return { output: [{ type: 'message', content: [{ type: 'output_text', text: ESTONIAN_GUARDRAIL_MESSAGE }] }] };
  });
}

async function sendRawResponse({ response, channelId, stream }) {
  if (!stream) {
    await publishNotificationEvent(channelId, {
      type: 'raw_response',
      channelId,
      content: response,
      isComplete: true,
    });
    return;
  }

  for await (const part of response) {
    if (stoppedChannels.has(channelId)) break;
    await publishNotificationEvent(channelId, {
      type: 'raw_response',
      channelId,
      content: part,
      isComplete: false,
    });
  }
}

async function deliverResponse({ response, channelId, stream }) {
  if (!stream) {
    const { content, context } = buildCompleteResponseContent(response);
    await publishNotificationEvent(channelId, {
      type: 'complete_response',
      channelId,
      content,
      context,
      isComplete: true,
    });
    return;
  }

  await publishNotificationEvent(channelId, { type: 'stream_start', streamId: channelId, channelId });
  await streamAgenticResponse({ response, channelId });
}

function buildCompleteResponseContent(response) {
  const textPart = extractMessageTextPart(response);
  const annotations = hasAzureAiSearchTool(response) ? textPart?.annotations : [];
  const { content, context } = formatAgenticCitations(textPart?.text, annotations);
  return { content: isGuardrailMessage(content) ? ESTONIAN_GUARDRAIL_MESSAGE : content, context };
}

async function createAgenticStreamRequest({
  channelId,
  messages,
  options = {},
  agent_name,
  agent_type,
  azure_client_id,
  azure_client_secret,
  azure_agentic_max_output_tokens,
  structured_inputs,
  raw_response = false,
}) {
  const { stream = true } = options;
  const streamToken = {};
  currentStreams.set(channelId, streamToken);

  try {
    stoppedChannels.delete(channelId);
    const response = await fetchAgenticResponse({
      messages,
      options,
      stream,
      agent_name,
      agent_type,
      azure_client_id,
      azure_client_secret,
      azure_agentic_max_output_tokens,
      structured_inputs,
    });

    if (raw_response) {
      await sendRawResponse({ response, channelId, stream });
      return;
    }

    await deliverResponse({
      response,
      channelId,
      stream,
    });

    return {
      success: true,
      channelId,
      message: `Agentic ${stream ? 'streaming' : 'response'} completed for all connections`,
    };
  } catch (error) {
    const errorMessage = `Failed to ${stream ? 'stream' : 'generate'} response`;
    try {
      await publishNotificationEvent(channelId, {
        type: 'stream_error',
        channelId,
        content: errorMessage,
        isComplete: true,
      });
    } catch (publishError) {
      console.error('Failed to publish LLM error event:', publishError);
    }
    console.error(`Error in createAgenticStreamRequest (stream=${stream}):`, error);
    throw error;
  }
}

module.exports = {
  createAgenticStreamRequest,
  stoppedChannels,
};
