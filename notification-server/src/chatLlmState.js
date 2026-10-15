const LLM_STATE_URL = () => `${process.env.RUUTER_URL}/backoffice/internal/llm-state`;

const toLogValue = (value) => String(value).replace(/[\n\r]/g, '');

async function postLlmState(path, body) {
  const response = await fetch(`${LLM_STATE_URL()}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`LLM state ${path} request failed: ${response.status}`);
  }

  return response.json();
}

async function getPreviousResponseId(chatId) {
  if (!chatId) return undefined;

  try {
    const data = await postLlmState('get', { chatId });
    const previousResponseId = data?.response?.previousResponseId ?? data?.previousResponseId;
    return previousResponseId || undefined;
  } catch (error) {
    console.error(`Failed to get previous response id for chat ${toLogValue(chatId)}:`, error.message);
    return undefined;
  }
}

async function savePreviousResponseId(chatId, responseId) {
  if (!chatId || !responseId) return;

  try {
    await postLlmState('save', { chatId, previousResponseId: responseId });
  } catch (error) {
    console.error(`Failed to save previous response id for chat ${toLogValue(chatId)}:`, error.message);
  }
}

module.exports = {
  getPreviousResponseId,
  savePreviousResponseId,
};
