import { describe, expect, it } from 'vitest';

const { extractIntentJson } = require('./intentDetection.js');

describe('extractIntentJson', () => {
  it('returns valid intent json', () => {
    const result = extractIntentJson('{"intent":"weather","entities":{"city":"Tallinn"}}');
    expect(JSON.parse(result)).toEqual({ intent: 'weather', entities: { city: 'Tallinn' } });
  });

  it('extracts json wrapped in a markdown code fence', () => {
    const result = extractIntentJson('```json\n{"intent":"OOD"}\n```');
    expect(JSON.parse(result).intent).toBe('OOD');
  });

  it('extracts json surrounded by text', () => {
    const result = extractIntentJson('Here is the result: {"intent":"weather"} done');
    expect(JSON.parse(result).intent).toBe('weather');
  });

  it.each([
    ["I'm sorry, but i cannot assist with that request."],
    ['Palun vabandust, aga kahjuks ei saa ma sellele päringule vastata.'],
    ['{"intent":"weather"'],
    ['{intent: weather}'],
    ['{"entities":{}}'],
    ['{"intent":""}'],
    ['{"intent":123}'],
    ['["weather"]'],
    [''],
    [undefined],
    [null],
  ])('returns empty string for %j', (input) => {
    expect(extractIntentJson(input)).toBe('');
  });

  it('drops non-object entities', () => {
    const result = extractIntentJson('{"intent":"weather","entities":"city"}');
    expect(JSON.parse(result)).toEqual({ intent: 'weather' });
  });
});
