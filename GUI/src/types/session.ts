export interface Session {
  readonly id: number;
  key: string;
  value: string;
  deleted: boolean;
  created: Date | string;
}
