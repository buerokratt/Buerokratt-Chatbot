const MARKER_OPEN = '【';
const MARKER_CLOSE = '】';

function replaceCompleteMarkers(text, onMatch) {
  let result = '';
  let cursor = 0;

  while (cursor < text.length) {
    const openIndex = text.indexOf(MARKER_OPEN, cursor);
    if (openIndex === -1) {
      result += text.slice(cursor);
      return { result, remainder: '' };
    }

    const closeIndex = text.indexOf(MARKER_CLOSE, openIndex + 1);
    if (closeIndex === -1) {
      result += text.slice(cursor, openIndex);
      return { result, remainder: text.slice(openIndex) };
    }

    result += text.slice(cursor, openIndex);
    result += onMatch();
    cursor = closeIndex + 1;
  }

  return { result, remainder: '' };
}

function isValidHttpUrl(candidate) {
  try {
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const SEARCH_INDEX_URL_SUFFIX = '.search.windows.net/';

function isSearchIndexUrl(candidate) {
  return typeof candidate === 'string' && candidate.endsWith(SEARCH_INDEX_URL_SUFFIX);
}

function hasAzureAiSearchTool(response) {
  return Array.isArray(response?.tools) && response.tools.some((tool) => tool?.type === 'azure_ai_search');
}

function extractMessageTextPart(fullResponse) {
  const messageOutput = fullResponse?.output?.find((item) => item.type === 'message');
  const content = messageOutput?.content;
  if (!Array.isArray(content)) return undefined;
  return content.find((part) => part.type === 'output_text') ?? content[0];
}

function toCitation(annotation) {
  return { url: '', title: annotation.title || '', filepath: annotation.url };
}

function sortedValidAnnotations(annotations) {
  return (annotations || [])
    .filter(
      (annotation) =>
        annotation?.type === 'url_citation' && isValidHttpUrl(annotation.url) && !isSearchIndexUrl(annotation.url),
    )
    .sort((a, b) => (a.start_index ?? 0) - (b.start_index ?? 0));
}

function mapAnnotationsToCitations(annotations) {
  return sortedValidAnnotations(annotations).map(toCitation);
}

function formatAgenticCitations(text, annotations) {
  const rawText = text || '';
  const citations = [];
  let content = '';
  let cursor = 0;

  for (const annotation of sortedValidAnnotations(annotations)) {
    const { start_index: start, end_index: end } = annotation;
    const isValidSpan = Number.isInteger(start) && Number.isInteger(end) && start >= cursor && end <= rawText.length && start < end;
    if (!isValidSpan) continue;

    content += rawText.slice(cursor, start);
    citations.push(toCitation(annotation));
    content += `[doc${citations.length}]`;
    cursor = end;
  }

  content += rawText.slice(cursor);
  content = replaceCompleteMarkers(content, () => '').result;

  return { content, context: citations.length > 0 ? { citations } : {} };
}

function createAgenticStreamState() {
  return { buffer: '', docCount: 0 };
}

function consumeAgenticStreamDelta(state, delta) {
  state.buffer += delta || '';

  const { result, remainder } = replaceCompleteMarkers(state.buffer, () => `[doc${++state.docCount}]`);
  state.buffer = remainder;
  return result;
}

function flushAgenticStreamBuffer(state) {
  state.buffer = '';
  return '';
}

module.exports = {
  extractMessageTextPart,
  formatAgenticCitations,
  mapAnnotationsToCitations,
  createAgenticStreamState,
  consumeAgenticStreamDelta,
  flushAgenticStreamBuffer,
  hasAzureAiSearchTool,
};
