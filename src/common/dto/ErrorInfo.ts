import { ErrorCode } from '../enums';

export default interface ErrorInfo {
  code: ErrorCode;
  message: string;
}
