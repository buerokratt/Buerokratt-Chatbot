export interface GreetingsMessage {
  est: string;
  isActive: boolean;
  domainUUID?: string[];
}

export interface GreetingsMessageResponse {
  response: GreetingsMessage;
}
