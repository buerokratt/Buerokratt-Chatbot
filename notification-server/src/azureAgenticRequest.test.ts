import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { azureAgenticAuthConfig, azureAgenticConfig } = require('./config.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { sendAzureAgenticRequest, buildRequestBody } = require('./azureAgenticRequest.js');

const MESSAGES = [
  { role: 'system', content: 'You are a helpful assistant' },
  { role: 'user', content: 'Tere' },
];

const HISTORY_MESSAGES = [
  { role: 'user', content: 'What do you know about taxes?' },
  { role: 'assistant', content: 'Which taxes do you want to know about?' },
  { role: 'user', content: 'VAT rates.' },
];

const AGENT_OPTIONS = { agent_name: 'agent', agent_type: 'agent_reference', max_output_tokens: 1000 };

function jsonResponse(body: unknown, status = 200) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });
}

describe('buildRequestBody', () => {
  it('sends the conversation history explicitly in input without previous_response_id', () => {
    const body = buildRequestBody(HISTORY_MESSAGES, { ...AGENT_OPTIONS, stream: true, previous_response_id: 'resp_1' });

    expect(body).not.toHaveProperty('previous_response_id');
    expect(body.input).toEqual(HISTORY_MESSAGES);
  });

  it('never sends the system message', () => {
    const body = buildRequestBody(MESSAGES, { ...AGENT_OPTIONS, stream: false });

    expect(body.input).toEqual([{ role: 'user', content: 'Tere' }]);
    expect(body.agent).toEqual({ name: 'agent', type: 'agent_reference' });
    expect(body.max_output_tokens).toBe(1000);
  });

  it('includes structured_inputs when provided', () => {
    const structured_inputs = { url: 'https://test.ee/et/mingilink' };
    const body = buildRequestBody(MESSAGES, { ...AGENT_OPTIONS, stream: false, structured_inputs });

    expect(body.structured_inputs).toEqual(structured_inputs);
  });

  it('omits structured_inputs when absent or empty', () => {
    expect(buildRequestBody(MESSAGES, { ...AGENT_OPTIONS, stream: false })).not.toHaveProperty('structured_inputs');
    expect(buildRequestBody(MESSAGES, { ...AGENT_OPTIONS, stream: false, structured_inputs: {} })).not.toHaveProperty(
      'structured_inputs',
    );
    expect(buildRequestBody(MESSAGES, { ...AGENT_OPTIONS, stream: false, structured_inputs: null })).not.toHaveProperty(
      'structured_inputs',
    );
  });
});

describe('sendAzureAgenticRequest', () => {
  const requestBodies: Record<string, unknown>[] = [];

  beforeEach(() => {
    Object.assign(azureAgenticConfig, { endpoint: 'https://agent.test', projectName: 'project', apiVersion: 'v1' });
    Object.assign(azureAgenticAuthConfig, { tenantId: 'tenant', clientId: 'client', clientSecret: 'secret' });
    requestBodies.length = 0;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function stubFetch(agentResponses: Response[]) {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        if (url.includes('login.microsoftonline.com')) {
          return jsonResponse({ access_token: 'token', expires_in: 3600 });
        }
        requestBodies.push(JSON.parse(init.body as string));
        return agentResponses.shift();
      }),
    );
  }

  it('sends a single request with the full history', async () => {
    stubFetch([jsonResponse({ id: 'resp_new', output: [] })]);

    const response = await sendAzureAgenticRequest(HISTORY_MESSAGES, AGENT_OPTIONS);

    expect(response.id).toBe('resp_new');
    expect(requestBodies).toHaveLength(1);
    expect(requestBodies[0]).not.toHaveProperty('previous_response_id');
    expect(requestBodies[0].input).toEqual(HISTORY_MESSAGES);
  });

  it('does not retry failed requests', async () => {
    stubFetch([jsonResponse({ error: { code: 'previous_response_not_found' } }, 400)]);

    await expect(sendAzureAgenticRequest(MESSAGES, AGENT_OPTIONS)).rejects.toThrow(
      'Azure Agentic API request failed: 400',
    );
    expect(requestBodies).toHaveLength(1);
  });
});
