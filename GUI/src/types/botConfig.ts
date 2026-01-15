export interface BotConfig {
  isBotActive: string;
  isBurokrattActive: string;
  isCsaNameVisible: string;
  isCsaTitleVisible: string;
  isEditChatVisible: string;
  instantlyOpenChatWidget: string;
}

export interface BotConfigResponse {
  response: BotConfig;
}
