export type GreetingType = 'message' | 'service';

export interface GreetingsMessage {
  est: string;
  isActive: boolean;
  type: GreetingType;
  serviceId: string;
  serviceName: string;
  domainUUID?: string[];
}

export interface GreetingsMessageResponse {
  response: GreetingsMessage;
}
