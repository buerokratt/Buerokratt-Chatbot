import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getPreviousResponseId, savePreviousResponseId } = require('./chatLlmState.js');

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe('chatLlmState', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.RUUTER_URL = 'http://ruuter-public:8086';
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('getPreviousResponseId', () => {
    it('returns the stored response id of the chat', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ response: { previousResponseId: 'resp_1' } }));

      await expect(getPreviousResponseId('chat-1')).resolves.toBe('resp_1');
      expect(fetchMock).toHaveBeenCalledWith(
        'http://ruuter-public:8086/backoffice/internal/llm-state/get',
        expect.objectContaining({ body: JSON.stringify({ chatId: 'chat-1' }) }),
      );
    });

    it('returns undefined for a new chat', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ response: { previousResponseId: '' } }));

      await expect(getPreviousResponseId('chat-1')).resolves.toBeUndefined();
    });

    it('returns undefined instead of failing when the lookup fails', async () => {
      fetchMock.mockResolvedValue(jsonResponse('Bad Request', 400));

      await expect(getPreviousResponseId('chat-1')).resolves.toBeUndefined();
    });

    it('skips the lookup without a chat id', async () => {
      await expect(getPreviousResponseId(undefined)).resolves.toBeUndefined();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('savePreviousResponseId', () => {
    it('stores the response id of the chat', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ response: 'Saved' }));

      await savePreviousResponseId('chat-1', 'resp_2');

      expect(fetchMock).toHaveBeenCalledWith(
        'http://ruuter-public:8086/backoffice/internal/llm-state/save',
        expect.objectContaining({ body: JSON.stringify({ chatId: 'chat-1', previousResponseId: 'resp_2' }) }),
      );
    });

    it('does not throw when saving fails', async () => {
      fetchMock.mockRejectedValue(new Error('network down'));

      await expect(savePreviousResponseId('chat-1', 'resp_2')).resolves.toBeUndefined();
    });

    it('skips saving without a response id', async () => {
      await savePreviousResponseId('chat-1', undefined);

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
