export interface GreetingsMessage {
  est: string;
  isActive: string;
  domainUUID?: string[];
}

export interface GreetingsMessageResponse {
  response: GreetingsMessage;
}
