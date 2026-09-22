import { describe, expect, it } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  extractMessageTextPart,
  formatAgenticCitations,
  mapAnnotationsToCitations,
  createAgenticStreamState,
  consumeAgenticStreamDelta,
  flushAgenticStreamBuffer,
  hasAzureAiSearchTool,
} = require('./citationFormatting.js');

const RIA_TEXT =
  'Riigi Infosüsteemi Amet on riiklik kompetentsikeskus【6:2†source】.\n\n' +
  'RIA küberturvalisuse keskus tegeleb muu hulgas【6:1†source】.\n\n' +
  'RIA riigi infosüsteemi teenistuse alla kuuluvad【6:7†source】.';

function annotationFor(text: string, marker: string, url: string, title: string) {
  const start_index = text.indexOf(marker);
  return { type: 'url_citation', url, title, start_index, end_index: start_index + marker.length };
}

const ANNOTATIONS = [
  annotationFor(RIA_TEXT, '【6:2†source】', 'https://www.ria.ee/a', 'A | RIA'),
  annotationFor(RIA_TEXT, '【6:1†source】', 'https://www.ria.ee/b', 'B | RIA'),
  annotationFor(RIA_TEXT, '【6:7†source】', 'https://www.ria.ee/c', 'C | RIA'),
];

describe('extractMessageTextPart', () => {
  it('finds the output_text content part of the message output item', () => {
    const response = {
      output: [
        { type: 'azure_ai_search_call_output' },
        { type: 'message', content: [{ type: 'output_text', text: 'hello', annotations: [] }] },
      ],
    };
    expect(extractMessageTextPart(response)).toEqual({ type: 'output_text', text: 'hello', annotations: [] });
  });

  it('returns undefined when there is no message output item', () => {
    expect(extractMessageTextPart({ output: [{ type: 'azure_ai_search_call_output' }] })).toBeUndefined();
    expect(extractMessageTextPart(undefined)).toBeUndefined();
  });
});

describe('formatAgenticCitations (non-streaming)', () => {
  it('replaces every marker with a doc reference and builds a deduplicated citations array', () => {
    const { content, context } = formatAgenticCitations(RIA_TEXT, ANNOTATIONS);

    expect(content).not.toMatch(/【|】/);
    expect(content).toContain('[doc1]');
    expect(content).toContain('[doc2]');
    expect(content).toContain('[doc3]');
    expect(context.citations).toHaveLength(3);
    expect(context.citations.map((c: { filepath: string }) => c.filepath)).toEqual([
      'https://www.ria.ee/a',
      'https://www.ria.ee/b',
      'https://www.ria.ee/c',
    ]);
  });

  it('deduplicates citations that point at the same URL', () => {
    const text = 'See A【1:1†source】 and again A【1:2†source】.';
    const annotations = [
      annotationFor(text, '【1:1†source】', 'https://www.ria.ee/a', 'A'),
      annotationFor(text, '【1:2†source】', 'https://www.ria.ee/a', 'A'),
    ];

    const { content, context } = formatAgenticCitations(text, annotations);

    expect(content).toContain('[doc1]');
    expect(content).toContain('[doc2]');
    expect(context.citations).toHaveLength(2);
  });

  it('never leaks a raw marker even when no annotations are provided', () => {
    const { content, context } = formatAgenticCitations(RIA_TEXT, []);
    expect(content).not.toMatch(/【|】/);
    expect(context).toEqual({});
  });

  it('strips a marker whose annotation has an invalid span instead of leaving it raw', () => {
    const text = 'See A【1:1†source】.';
    const annotations = [
      { type: 'url_citation', url: 'https://www.ria.ee/a', title: 'A', start_index: -1, end_index: 5 },
    ];

    const { content, context } = formatAgenticCitations(text, annotations);

    expect(content).not.toMatch(/【|】/);
    expect(context).toEqual({});
  });

  it('ignores annotations that are not valid http(s) url_citations', () => {
    const text = 'See A【1:1†source】.';
    const annotations = [
      { ...annotationFor(text, '【1:1†source】', 'not-a-url', 'A') },
      { ...annotationFor(text, '【1:1†source】', 'https://ok', 'A'), type: 'file_citation' },
    ];

    const { content, context } = formatAgenticCitations(text, annotations);

    expect(content).not.toMatch(/【|】/);
    expect(context).toEqual({});
  });

  it('handles empty text', () => {
    expect(formatAgenticCitations('', [])).toEqual({ content: '', context: {} });
    expect(formatAgenticCitations(undefined as unknown as string, undefined)).toEqual({ content: '', context: {} });
  });
});

describe('search index url filtering', () => {
  it('discards citations whose URL ends with .search.windows.net/', () => {
    const text = 'See A【1:1†source】 and B【1:2†source】.';
    const annotations = [
      annotationFor(text, '【1:1†source】', 'https://myservice.search.windows.net/', 'Index'),
      annotationFor(text, '【1:2†source】', 'https://www.ria.ee/b', 'B'),
    ];

    const { content, context } = formatAgenticCitations(text, annotations);

    expect(content).not.toMatch(/【|】/);
    expect(context.citations).toHaveLength(1);
    expect(context.citations[0].filepath).toBe('https://www.ria.ee/b');
  });

  it('excludes search index URLs from mapAnnotationsToCitations', () => {
    const annotations = [annotationFor('x', 'x', 'https://myservice.search.windows.net/', 'Index'), ...ANNOTATIONS];

    const citations = mapAnnotationsToCitations(annotations);

    expect(citations.map((c: { filepath: string }) => c.filepath)).not.toContain(
      'https://myservice.search.windows.net/',
    );
    expect(citations).toHaveLength(3);
  });
});

describe('hasAzureAiSearchTool', () => {
  it('returns true when the response tools include azure_ai_search', () => {
    expect(hasAzureAiSearchTool({ tools: [{ type: 'azure_ai_search', azure_ai_search: {} }] })).toBe(true);
  });

  it('returns false when the tools do not include azure_ai_search', () => {
    expect(hasAzureAiSearchTool({ tools: [{ type: 'file_search' }] })).toBe(false);
    expect(hasAzureAiSearchTool({ tools: [] })).toBe(false);
    expect(hasAzureAiSearchTool({})).toBe(false);
    expect(hasAzureAiSearchTool(undefined)).toBe(false);
  });
});

describe('mapAnnotationsToCitations', () => {
  it('maps and sorts annotations by their position in the text', () => {
    const shuffled = [ANNOTATIONS[2], ANNOTATIONS[0], ANNOTATIONS[1]];
    const citations = mapAnnotationsToCitations(shuffled);
    expect(citations.map((c: { filepath: string }) => c.filepath)).toEqual([
      'https://www.ria.ee/a',
      'https://www.ria.ee/b',
      'https://www.ria.ee/c',
    ]);
  });

  it('returns an empty array for no annotations', () => {
    expect(mapAnnotationsToCitations([])).toEqual([]);
    expect(mapAnnotationsToCitations(undefined)).toEqual([]);
  });
});

describe('streaming citation buffering', () => {
  it('withholds a marker until its closing bracket arrives, split across deltas', () => {
    const state = createAgenticStreamState();
    let emitted = '';

    emitted += consumeAgenticStreamDelta(state, 'Riigi Infosüsteemi Amet ');
    emitted += consumeAgenticStreamDelta(state, '【6:2');
    expect(emitted).not.toMatch(/【|】/);

    emitted += consumeAgenticStreamDelta(state, '†source】 on riiklik');

    expect(emitted).toBe('Riigi Infosüsteemi Amet [doc1] on riiklik');
    expect(emitted).not.toMatch(/【|】/);
  });

  it('assigns increasing doc numbers in order of appearance across multiple markers', () => {
    const state = createAgenticStreamState();
    let emitted = '';

    emitted += consumeAgenticStreamDelta(state, 'A【1:1†source】 and B【1:2†source】 done');

    expect(emitted).toBe('A[doc1] and B[doc2] done');
  });

  it('drops a trailing marker that never closes when the stream ends', () => {
    const state = createAgenticStreamState();
    let emitted = '';

    emitted += consumeAgenticStreamDelta(state, 'Some text 【6:2');
    const flushed = flushAgenticStreamBuffer(state);

    expect(emitted).toBe('Some text ');
    expect(flushed).toBe('');
    expect(emitted + flushed).not.toMatch(/【|】/);
  });

  it('flushes remaining safe text once the stream ends cleanly', () => {
    const state = createAgenticStreamState();
    consumeAgenticStreamDelta(state, 'no markers here');
    expect(flushAgenticStreamBuffer(state)).toBe('');
  });
});
