export type ServiceErrorType = "AxiosError" | "GeneralError";

export interface ServiceError {
  type: ServiceErrorType;
  context: string;
  message: string;
  status?: number;
  method?: string;
  url?: string;
  data?: unknown;
  stack?: string;
}
