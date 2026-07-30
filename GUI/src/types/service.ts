export interface Service {
  id?: string;
  serviceId?: string;
  name: string;
  description?: string;
  type?: 'POST' | 'GET';
  state?: 'active' | 'inactive' | 'draft' | 'ready';
  updatedAt?: string;
}
