export interface ChatAnalysisConfig {
  readonly chatAnalysisEnabled: boolean;
  readonly chatAnalysisTheme: string;
  readonly chatAnalysisBykResponseQuality: string;
  readonly chatAnalysisFollowUpAction: string;
  readonly domainUuid?: string[];
}

export interface ChatAnalysisConfigResponse {
  readonly response: ChatAnalysisConfig;
}
