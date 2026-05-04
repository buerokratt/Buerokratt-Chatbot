export interface BotConfig {
  isBotActive: string;
  isBurokrattActive: string;
  isCsaNameVisible: string;
  isCsaTitleVisible: string;
  isEditChatVisible: string;
  instantlyOpenChatWidget: string;
  showSubTitle: string;
  subTitle: string;
  responseWaitingTime: string;
  responseProcessingNotice: string;
}

export interface BotConfigResponse {
  response: BotConfig;
}
