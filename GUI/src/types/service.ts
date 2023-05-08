export interface Service {
  url: string;
  name: string;
  type: 'POST' | 'GET';
  status?: 'active' | 'inactive';
}
