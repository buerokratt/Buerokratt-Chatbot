const SEARCH_CALL_OUTPUT_TYPE = 'azure_ai_search_call_output';
const CHUNK_ID_PATTERN = /^[0-9a-f]+_(.+?)_chunks_\d+$/;
const DOCUMENT_ID_PATTERN = /^(arvaArticle|service|eventService)-[A-Za-z0-9-]+$/;

function trimTrailing(value, character) {
  let end = value.length;
  while (end > 0 && value[end - 1] === character) end--;
  return value.slice(0, end);
}

function sanitizeForLog(value) {
  return String(value).replace(/[\n\r]/g, ' ');
}

function normalizeUrl(rawUrl) {
  if (typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  let normalized;
  try {
    const url = new URL(trimmed);
    url.hash = '';
    normalized = url.toString();
  } catch {
    normalized = trimmed.split('#')[0];
  }

  return trimTrailing(normalized, '/');
}

function parseDocumentId(document) {
  const chunkMatch = typeof document?.id === 'string' ? CHUNK_ID_PATTERN.exec(document.id) : null;
  const candidate = chunkMatch ? chunkMatch[1] : (document?.content ?? '').split('\n')[1];
  const documentId = trimTrailing((candidate ?? '').trim(), '_');
  return DOCUMENT_ID_PATTERN.test(documentId) ? documentId : null;
}

function parseSearchDocuments(outputItem) {
  try {
    const parsed = typeof outputItem.output === 'string' ? JSON.parse(outputItem.output) : outputItem.output;
    return Array.isArray(parsed?.documents) ? parsed.documents : [];
  } catch (error) {
    console.warn(
      `Skipping ${SEARCH_CALL_OUTPUT_TYPE} item ${sanitizeForLog(outputItem.id ?? '')}: invalid JSON (${sanitizeForLog(error.message)})`,
    );
    return [];
  }
}

function extractSearchResources(response) {
  const outputItems = Array.isArray(response?.output) ? response.output : [];
  const resources = [];
  const seen = new Set();

  for (const item of outputItems) {
    if (item?.type !== SEARCH_CALL_OUTPUT_TYPE) continue;

    for (const document of parseSearchDocuments(item)) {
      const id = parseDocumentId(document);
      const url = normalizeUrl(document?.url);
      if (!id || !url) continue;

      const pairKey = `${id}\n${url}`;
      if (seen.has(pairKey)) continue;
      seen.add(pairKey);
      resources.push({ id, url });
    }
  }

  return resources;
}

function findCitationKey(citation, resources) {
  const citationUrl = normalizeUrl(citation?.filepath || citation?.url);
  const matches = citationUrl ? resources.filter((resource) => resource.url === citationUrl) : [];

  if (matches.length === 0) {
    console.warn(`No source document ID found for citation URL: ${sanitizeForLog(citationUrl)}`);
    return null;
  }
  if (matches.length > 1) {
    console.warn(
      `Multiple source document IDs found for citation URL ${sanitizeForLog(citationUrl)}: ${matches
        .map((match) => match.id)
        .join(', ')}; using ${matches[0].id}`,
    );
  }
  return matches[0].id;
}

function enrichCitations(citations, resources) {
  if (!Array.isArray(citations)) return citations;
  return citations.map((citation) => ({ ...citation, key: findCitationKey(citation, resources) }));
}

function addCitationDocumentIds(context, response) {
  if (!Array.isArray(context?.citations) || context.citations.length === 0) return context;

  try {
    return { ...context, citations: enrichCitations(context.citations, extractSearchResources(response)) };
  } catch (error) {
    console.error('Failed to add source document IDs to citations:', sanitizeForLog(error?.message ?? error));
    return context;
  }
}

module.exports = {
  normalizeUrl,
  extractSearchResources,
  enrichCitations,
  addCitationDocumentIds,
};
