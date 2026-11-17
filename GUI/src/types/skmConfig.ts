export interface SkmConfig {
  azureAgentName: string;
  azureAgentType: string;
  azureClientId: string;
  azureClientSecret: string;
  azureAgenticMaxOutputTokens: string;
  azureAgenticUseStructuredInputs: string;
  domainUUID?: string[];
  azureClientIdIsSet?: string;
  azureClientSecretIsSet?: string;
}

export interface SkmConfigResponse {
  response: SkmConfig;
}
