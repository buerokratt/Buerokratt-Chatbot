export interface SkmConfig {
  range: string;
  documents: string;
  systemMessage: string;
  maxTokens: string;
  indexName: string;
  queryType: string;
  semanticConfiguration: string;
  inScope: string;
  domainUUID?: string[];
}

export interface SkmConfigResponse {
  response: SkmConfig;
}
