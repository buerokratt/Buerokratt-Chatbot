function tryParseObject(text) {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function extractIntentJson(text) {
  if (typeof text !== 'string') return '';

  const trimmed = text.trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end <= start) return '';

  const parsed = tryParseObject(trimmed) ?? tryParseObject(trimmed.slice(start, end + 1));
  if (!parsed || typeof parsed.intent !== 'string' || !parsed.intent.trim()) return '';

  const entities =
    parsed.entities && typeof parsed.entities === 'object' && !Array.isArray(parsed.entities)
      ? parsed.entities
      : undefined;

  return JSON.stringify({ ...parsed, intent: parsed.intent.trim(), entities });
}

module.exports = {
  extractIntentJson,
};
