export interface Establishment {
  clientId: string;
  name: string;
  authenticationCertificate: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface EstablishmentsResponse {
  response: {
    items: Establishment[];
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
