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
  azureClientId: string;
  azureClientSecret: string;
  azureAgenticMaxOutputTokens: string;
  domainUUID?: string[];
  azureClientSecretSet?: string;
}

export interface SkmConfigResponse {
  response: SkmConfig;
}
