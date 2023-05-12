export interface Service {
  id: string;
  name: string;
  type: 'POST' | 'GET';
  state?: 'active' | 'inactive' | 'draft';
}
