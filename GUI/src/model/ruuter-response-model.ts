export interface RuuterResponse {
  data: Record<string, unknown> | null;
  error: string | null;
}

export interface CustomJwtExtendResponse {
  data: {
    custom_jwt_extend: string;
  };
  error: null;
}
