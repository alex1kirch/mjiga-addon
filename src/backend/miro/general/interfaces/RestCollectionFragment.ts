export default interface RestCollectionFragment<T extends any = any> {
  type: 'list';
  limit: number;
  offset: number;
  size: number;
  prevLink: string | null;
  nextLink: string | null;
  data: T[];
}
