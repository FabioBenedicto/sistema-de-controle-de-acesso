export interface IPaginated<T> {
  data: T[];
  perPage: number;
  total: number;
}
