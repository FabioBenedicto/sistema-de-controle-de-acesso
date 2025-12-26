export interface IMqttResponse<T = any> {
  status: 'ok' | 'error';
  message: string;
  data?: T;
  timestamp?: string;
}
