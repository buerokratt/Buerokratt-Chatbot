export interface ChatAnalysisConfig {
  chatAnalysisEnabled: boolean;
  chatAnalysisTheme: string;
  chatAnalysisBykResponseQuality: string;
  chatAnalysisFollowUpAction: string;
  domainUUID?: string[];
}

export interface ChatAnalysisConfigResponse {
  response: ChatAnalysisConfig;
}
