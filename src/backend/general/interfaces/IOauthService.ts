export default interface IOauthService<T> {
  auth(...args: any[]): string;
  exchange(...args: any[]): Promise<T>;
}
