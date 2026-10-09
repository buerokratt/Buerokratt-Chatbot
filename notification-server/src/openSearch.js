const { v4: uuidv4 } = require('uuid');

const { sendAzureAgenticRequest } = require('./azureAgenticRequest');
const { streamAzureOpenAIResponse } = require('./azureOpenAI');
const { getPreviousResponseId, savePreviousResponseId } = require('./chatLlmState');
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

async function streamAgenticResponse({ response, connectionId, channelId, sender }) {
  const citationState = createAgenticStreamState();
  const held = { text: '', isHolding: true };
  let finalAnnotations = [];

  for await (const part of response) {
    if (!activeConnections.has(connectionId) || stoppedChannels.has(channelId)) break;

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

  if (!activeConnections.has(connectionId) || stoppedChannels.has(channelId)) return;

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

function isFallbackMessage(text, openAIFallback1, openAIFallback2) {
  return text === openAIFallback1 || text === openAIFallback2;
}

async function* saveResponseIdOnCompletion(stream, chatId) {
  for await (const part of stream) {
    if (part.type === 'response.completed' || part.type === 'response.incomplete') {
      await savePreviousResponseId(chatId, (part.response ?? part).id);
    }
    yield part;
  }
}

async function fetchAgenticResponse({
  channelId,
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
  const previous_response_id = await getPreviousResponseId(channelId);

  const response = await sendAzureAgenticRequest(messages, {
    ...options,
    stream,
    agent_name,
    agent_type,
    client_id: azure_client_id,
    client_secret: azure_client_secret,
    max_output_tokens: azure_agentic_max_output_tokens,
    previous_response_id,
    structured_inputs,
  }).catch((error) => {
    if (stream || !error.message?.includes('"code":"content_filter"')) throw error;
    return { output: [{ type: 'message', content: [{ type: 'output_text', text: ESTONIAN_GUARDRAIL_MESSAGE }] }] };
  });

  if (stream) {
    return saveResponseIdOnCompletion(response, channelId);
  }

  await savePreviousResponseId(channelId, response?.id);
  return response;
}

async function fetchLLMResponse({ use_agentic, messages, options, ...agenticParams }) {
  if (use_agentic) {
    return fetchAgenticResponse({ messages, options, ...agenticParams });
  }
  return streamAzureOpenAIResponse(messages, options);
}

async function sendRawResponse({ response, connectionId, channelId, sender, stream }) {
  if (!stream) {
    sender(response);
    return;
  }

  for await (const part of response) {
    if (!activeConnections.has(connectionId) || stoppedChannels.has(channelId)) break;
    sender(part);
  }
}

async function deliverResponse({
  response,
  channelId,
  stream,
  use_agentic,
  openAIFallback1,
  openAIFallback2,
  estonianFallback,
}) {
  if (!stream) {
    const { content, context } = buildCompleteResponseContent({
      response,
      use_agentic,
      openAIFallback1,
      openAIFallback2,
      estonianFallback,
    });
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

  if (use_agentic) {
    await streamAgenticResponse({ response, channelId });
  } else {
    await streamClassicResponse({
      response,
      channelId,
      openAIFallback1,
      openAIFallback2,
      estonianFallback,
    });
  }
}

function buildCompleteResponseContent({ response, use_agentic, openAIFallback1, openAIFallback2, estonianFallback }) {
  if (use_agentic) {
    const textPart = extractMessageTextPart(response);
    const annotations = hasAzureAiSearchTool(response) ? textPart?.annotations : [];
    const { content, context } = formatAgenticCitations(textPart?.text, annotations);
    return { content: isGuardrailMessage(content) ? ESTONIAN_GUARDRAIL_MESSAGE : content, context };
  }

  const content = response.choices?.[0]?.message?.content || '';
  const context = response.choices?.[0]?.message?.context || {};
  const trimmed = content.trim();

  return {
    content: isFallbackMessage(trimmed, openAIFallback1, openAIFallback2) ? estonianFallback : content,
    context,
  };
}

function isFallbackPrefix(text, openAIFallback1, openAIFallback2) {
  return openAIFallback1.startsWith(text) || openAIFallback2.startsWith(text);
}

function processClassicDelta(state, part, openAIFallback1, openAIFallback2) {
  const choice = part.choices?.[0];
  if (!choice) return null;

  if (!state.context && choice.delta?.context) state.context = choice.delta.context;
  const content = choice.delta?.content || '';
  if (!content) return null;

  state.cumulative += content;

  if (state.startedStreaming) return content;

  if (isFallbackPrefix(state.cumulative, openAIFallback1, openAIFallback2)) return null;

  state.startedStreaming = true;
  return state.cumulative;
}

async function streamClassicResponse({ response, channelId, openAIFallback1, openAIFallback2, estonianFallback }) {
  const state = { context: undefined, cumulative: '', startedStreaming: false };

  for await (const part of response) {
    if (stoppedChannels.has(channelId)) break;

    const emitText = processClassicDelta(state, part, openAIFallback1, openAIFallback2);
    if (emitText) {
      await publishNotificationEvent(channelId, {
        type: 'stream_chunk',
        channelId,
        content: emitText,
        isComplete: false,
      });
    }
  }

  if (stoppedChannels.has(channelId)) return;

  if (!state.startedStreaming && isFallbackMessage(state.cumulative.trim(), openAIFallback1, openAIFallback2)) {
    await publishNotificationEvent(channelId, {
      type: 'stream_chunk',
      channelId,
      content: estonianFallback,
      isComplete: false,
    });
  }

  await publishNotificationEvent(channelId, {
    type: 'stream_complete',
    channelId,
    content: '',
    context: state.context || {},
    isComplete: true,
  });
}

async function createAzureOpenAIStreamRequest({
  channelId,
  messages,
  options = {},
  use_agentic = false,
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
    const response = await fetchLLMResponse({
      use_agentic,
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
    const openAIFallback1 =
      'The requested information is not found in the retrieved data. Please try another query or topic.';
    const openAIFallback2 =
      'The requested information is not available in the retrieved data. Please try another query or topic.';
    const estonianFallback =
      'Mulle kättesaadavates andmetes puudub teie küsimusele vastav info. Palun täpsustage oma küsimust.';

    await deliverResponse({
      response,
      channelId,
      stream,
      use_agentic,
      openAIFallback1,
      openAIFallback2,
      estonianFallback,
    });

    return {
      success: true,
      channelId,
      message: `Azure OpenAI ${stream ? 'streaming' : 'response'} published`,
    };
  } catch (error) {
    const errorMessage = `Failed to ${stream ? 'stream' : 'generate'} response`;
    try {
      await publishNotificationEvent(channelId, {
        type: stream ? 'stream_error' : 'response_error',
        channelId,
        content: errorMessage,
        isComplete: true,
      });
    } catch (publishError) {
      console.error('Failed to publish LLM error event:', publishError);
    }
    console.error(`Error in createAzureOpenAIStreamRequest (stream=${stream}):`, error);
    throw error;
  }
}

module.exports = {
  createAzureOpenAIStreamRequest,
  stoppedChannels,
};
