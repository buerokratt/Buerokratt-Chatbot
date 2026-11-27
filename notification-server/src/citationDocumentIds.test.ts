import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  normalizeUrl,
  extractSearchResources,
  enrichCitations,
  addCitationDocumentIds,
} = require('./citationDocumentIds.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { extractMessageTextPart, formatAgenticCitations } = require('./citationFormatting.js');

type SearchDocument = { id: string; url: string; content: string };

function doc(prefix: string, documentId: string, chunk: number, url: string): SearchDocument {
  return {
    id: `${prefix}_${documentId}_chunks_${chunk}`,
    url,
    content: `${documentId}#${chunk}\n${documentId}\nTitle\n${url}\n`,
  };
}

function searchOutput(documents: SearchDocument[]) {
  return { type: 'azure_ai_search_call_output', output: JSON.stringify({ documents, get_urls: [] }) };
}

const URLS = {
  app: 'https://example.com/docs/doc-a',
  marriage: 'https://example.com/docs/doc-b',
  aliases: 'https://example.com/docs/doc-c',
  trust: 'https://example.com/docs/doc-d',
  consent: 'https://example.com/docs/doc-e',
  terms: 'https://example.com/docs/doc-f',
  events: 'https://example.com/docs/doc-g',
};

const FIRST_SEARCH = searchOutput([
  doc('aaa111', 'arvaArticle-1001', 0, URLS.app),
  doc('aaa111', 'arvaArticle-1002', 0, URLS.marriage),
  doc('bbb222', 'arvaArticle-1003', 3, URLS.aliases),
  doc('bbb222', 'arvaArticle-1004', 6, URLS.trust),
  doc('aaa111', 'arvaArticle-1005', 0, URLS.terms),
  doc('bbb222', 'arvaArticle-1004', 5, URLS.trust),
  doc('bbb222', 'arvaArticle-1003', 0, URLS.aliases),
]);

const SECOND_SEARCH = searchOutput([
  doc('aaa111', 'arvaArticle-1001', 0, URLS.app),
  doc('aaa111', 'arvaArticle-1002', 0, URLS.marriage),
  doc('aaa111', 'eventService-1-step1', 2, URLS.events),
  doc('aaa111', 'arvaArticle-1006', 0, URLS.consent),
  doc('bbb222', 'arvaArticle-1003', 0, URLS.aliases),
  doc('bbb222', 'arvaArticle-1004', 5, URLS.trust),
]);

const ANSWER_TEXT =
  'First test statement【9:5†source】 and second test statement【9:0†source】.\n\n' +
  'Third test statement【9:1†source】, fourth test statement【9:12†source】 and fifth test statement【6:5†source】.';

function annotation(marker: string, url: string, title: string) {
  const start_index = ANSWER_TEXT.indexOf(marker);
  return { type: 'url_citation', url, title, start_index, end_index: start_index + marker.length };
}

const SAMPLE_RESPONSE = {
  tools: [{ type: 'azure_ai_search' }],
  output: [
    { type: 'reasoning', summary: [] },
    { type: 'azure_ai_search_call', arguments: '{}' },
    FIRST_SEARCH,
    { type: 'reasoning', summary: [] },
    { type: 'azure_ai_search_call', arguments: '{}' },
    SECOND_SEARCH,
    {
      type: 'message',
      content: [
        {
          type: 'output_text',
          text: ANSWER_TEXT,
          annotations: [
            annotation('【9:5†source】', URLS.consent, 'Doc E'),
            annotation('【9:0†source】', URLS.app, 'Doc A'),
            annotation('【9:1†source】', URLS.marriage, 'Doc B'),
            annotation('【9:12†source】', URLS.aliases, 'Doc C'),
            annotation('【6:5†source】', URLS.trust, 'Doc D'),
          ],
        },
      ],
    },
  ],
};

let warnSpy: ReturnType<typeof vi.spyOn>;
let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('normalizeUrl', () => {
  it('trims, lowercases the host and removes the fragment and trailing slashes', () => {
    expect(normalizeUrl('  https://WWW.Example.COM/Docs/Page/#section  ')).toBe('https://www.example.com/Docs/Page');
    expect(normalizeUrl('https://www.example.com/')).toBe('https://www.example.com');
  });

  it('handles values that are not valid URLs', () => {
    expect(normalizeUrl('not a url/#x')).toBe('not a url');
    expect(normalizeUrl('')).toBe('');
    expect(normalizeUrl(undefined)).toBe('');
  });
});

describe('extractSearchResources', () => {
  it('merges and deduplicates document ID and URL pairs from every search output', () => {
    expect(extractSearchResources(SAMPLE_RESPONSE)).toEqual([
      { id: 'arvaArticle-1001', url: URLS.app },
      { id: 'arvaArticle-1002', url: URLS.marriage },
      { id: 'arvaArticle-1003', url: URLS.aliases },
      { id: 'arvaArticle-1004', url: URLS.trust },
      { id: 'arvaArticle-1005', url: URLS.terms },
      { id: 'eventService-1-step1', url: URLS.events },
      { id: 'arvaArticle-1006', url: URLS.consent },
    ]);
  });

  it('falls back to the second content line when the chunk ID does not match', () => {
    const response = {
      output: [
        searchOutput([
          { id: 'unexpected-id', url: 'https://example.com/a', content: 'service-2001#0\nservice-2001__\n' },
        ]),
      ],
    };
    expect(extractSearchResources(response)).toEqual([{ id: 'service-2001', url: 'https://example.com/a' }]);
  });

  it('strips trailing underscores from the chunk ID', () => {
    const response = {
      output: [
        searchOutput([{ id: 'abc123_eventService-2-step2__chunks_1', url: 'https://example.com/b', content: '' }]),
      ],
    };
    expect(extractSearchResources(response)).toEqual([{ id: 'eventService-2-step2', url: 'https://example.com/b' }]);
  });

  it('skips documents whose ID is not a known document type', () => {
    const response = {
      output: [
        searchOutput([{ id: 'abc123_otherDoc-1_chunks_0', url: 'https://example.com/c', content: 'x\nbad id\n' }]),
      ],
    };
    expect(extractSearchResources(response)).toEqual([]);
  });

  it('skips search outputs with invalid JSON and logs a warning', () => {
    const response = {
      output: [{ type: 'azure_ai_search_call_output', id: 'fco_1', output: '{not json' }, FIRST_SEARCH],
    };
    expect(extractSearchResources(response)).toHaveLength(5);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('fco_1'));
  });

  it('returns an empty list for a $backoffice response or a response without searches', () => {
    const backoffice = { output: [{ type: 'message', content: [{ type: 'output_text', text: '$backoffice' }] }] };
    expect(extractSearchResources(backoffice)).toEqual([]);
    expect(extractSearchResources({})).toEqual([]);
    expect(extractSearchResources(undefined)).toEqual([]);
  });
});

describe('enrichCitations', () => {
  const resources = extractSearchResources(SAMPLE_RESPONSE);

  it('adds the matching document ID as key without changing other fields or order', () => {
    const textPart = extractMessageTextPart(SAMPLE_RESPONSE);
    const { context } = formatAgenticCitations(textPart.text, textPart.annotations);

    const enriched = enrichCitations(context.citations, resources);

    expect(enriched).toEqual([
      { url: '', title: 'Doc E', filepath: URLS.consent, key: 'arvaArticle-1006' },
      { url: '', title: 'Doc A', filepath: URLS.app, key: 'arvaArticle-1001' },
      {
        url: '',
        title: 'Doc B',
        filepath: URLS.marriage,
        key: 'arvaArticle-1002',
      },
      { url: '', title: 'Doc C', filepath: URLS.aliases, key: 'arvaArticle-1003' },
      { url: '', title: 'Doc D', filepath: URLS.trust, key: 'arvaArticle-1004' },
    ]);
    expect(context.citations[0]).not.toHaveProperty('key');
  });

  it('matches on the normalized URL and uses url when filepath is empty', () => {
    const [byHost] = enrichCitations(
      [{ url: '', title: '', filepath: URLS.app.replace('example.com', 'EXAMPLE.COM') }],
      resources,
    );
    expect(byHost.key).toBe('arvaArticle-1001');

    const [byUrl] = enrichCitations([{ url: ` ${URLS.app}/#top `, title: '', filepath: '' }], resources);
    expect(byUrl.key).toBe('arvaArticle-1001');
  });

  it('sets key to null and logs a warning when no document matches', () => {
    const [citation] = enrichCitations([{ url: '', title: 'X', filepath: 'https://example.com/unknown' }], resources);
    expect(citation).toEqual({ url: '', title: 'X', filepath: 'https://example.com/unknown', key: null });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('No source document ID'));
  });

  it('uses the first match and logs a warning when several documents share a URL', () => {
    const [citation] = enrichCitations(
      [{ url: '', title: 'X', filepath: URLS.app }],
      [
        { id: 'arvaArticle-1', url: URLS.app },
        { id: 'arvaArticle-2', url: URLS.app },
      ],
    );
    expect(citation.key).toBe('arvaArticle-1');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Multiple source document IDs'));
  });
});

describe('addCitationDocumentIds', () => {
  it('returns the context unchanged when there are no citations', () => {
    const empty = {};
    expect(addCitationDocumentIds(empty, SAMPLE_RESPONSE)).toBe(empty);
  });

  it('returns the original context and logs an error when enrichment throws', () => {
    const context = { citations: [{ url: '', title: 'X', filepath: URLS.app }] };
    const throwingResponse = {
      get output() {
        throw new Error('boom');
      },
    };

    expect(addCitationDocumentIds(context, throwingResponse)).toBe(context);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('source document IDs'), 'boom');
  });
});
