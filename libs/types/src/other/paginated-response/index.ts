export interface IPaginatedResponse<T> {
  paginatedResults: T[];
  totalCount: number;
  nextPage?: number;
}
