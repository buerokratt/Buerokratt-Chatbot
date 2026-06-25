export interface AnonymizerConfig {
  entities: string;
  anonymizerSelectedApproach: string;
  anonymizerSelectedEntities: string;
  anonymizerAllowlist: string;
  anonymizerDenylist: string;
  isAnonymizationBeforeLlm: boolean;
  isAnonymizationBeforeGlobalClassifier: boolean;
  recordConversationsAnonymously: boolean;
  domainUUID?: string[];
}

export interface AnonymizerConfigResponse {
  response: AnonymizerConfig;
}
