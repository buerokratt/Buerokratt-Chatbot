export interface SkmConfig {
  range: string;
  documents: string;
  systemMessage: string;
  maxTokens: string;
  indexName: string;
  queryType: string;
  semanticConfiguration: string;
  inScope: string;
  useAgentic: string;
  azureAgentName: string;
  azureAgentType: string;
  domainUUID?: string[];
}

export interface SkmConfigResponse {
  response: SkmConfig;
}
