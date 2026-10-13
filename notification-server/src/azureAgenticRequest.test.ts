import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { azureAgenticAuthConfig, azureAgenticConfig } = require('./config.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { sendAzureAgenticRequest, buildRequestBody, isPreviousResponseNotFound } = require('./azureAgenticRequest.js');

const MESSAGES = [
  { role: 'system', content: 'You are a helpful assistant' },
  { role: 'user', content: 'Tere' },
];

const AGENT_OPTIONS = { agent_name: 'agent', agent_type: 'agent_reference', max_output_tokens: 1000 };

function jsonResponse(body: unknown, status = 200) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });
}

describe('buildRequestBody', () => {
  it('omits previous_response_id on the first message of a chat', () => {
    const body = buildRequestBody(MESSAGES, { ...AGENT_OPTIONS, stream: true });

    expect(body).not.toHaveProperty('previous_response_id');
  });

  it('includes previous_response_id when there is a previous response', () => {
    const body = buildRequestBody(MESSAGES, { ...AGENT_OPTIONS, stream: true, previous_response_id: 'resp_123' });

    expect(body.previous_response_id).toBe('resp_123');
  });

  it('never sends the system message', () => {
    const body = buildRequestBody(MESSAGES, { ...AGENT_OPTIONS, stream: false });

    expect(body.input).toEqual([{ role: 'user', content: 'Tere' }]);
    expect(body.agent).toEqual({ name: 'agent', type: 'agent_reference' });
    expect(body.max_output_tokens).toBe(1000);
  });
});

describe('isPreviousResponseNotFound', () => {
  it('detects the not-found error code', () => {
    expect(isPreviousResponseNotFound(400, '{"error":{"code":"previous_response_not_found"}}')).toBe(true);
  });

  it('detects the not-found error message', () => {
    expect(isPreviousResponseNotFound(404, "Previous response with id 'resp_1' not found.")).toBe(true);
  });

  it('ignores unrelated errors', () => {
    expect(isPreviousResponseNotFound(400, 'Invalid max_output_tokens')).toBe(false);
    expect(isPreviousResponseNotFound(500, 'previous_response_not_found')).toBe(false);
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

  it('retries without previous_response_id when the previous response no longer exists', async () => {
    stubFetch([
      jsonResponse({ error: { code: 'previous_response_not_found' } }, 400),
      jsonResponse({ id: 'resp_new', output: [] }),
    ]);

    const response = await sendAzureAgenticRequest(MESSAGES, { ...AGENT_OPTIONS, previous_response_id: 'resp_old' });

    expect(response.id).toBe('resp_new');
    expect(requestBodies).toHaveLength(2);
    expect(requestBodies[0].previous_response_id).toBe('resp_old');
    expect(requestBodies[1]).not.toHaveProperty('previous_response_id');
  });

  it('does not retry other errors', async () => {
    stubFetch([jsonResponse('Internal error', 500)]);

    await expect(
      sendAzureAgenticRequest(MESSAGES, { ...AGENT_OPTIONS, previous_response_id: 'resp_old' }),
    ).rejects.toThrow('Azure Agentic API request failed: 500');
    expect(requestBodies).toHaveLength(1);
  });
});
