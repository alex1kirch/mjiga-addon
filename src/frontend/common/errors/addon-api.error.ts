import ErrorInfo from '../../../common/dto/ErrorInfo';
import { ErrorCode } from '../../../common/enums';

export default class AddonApiError extends Error {
  constructor(
    public readonly errorInfo: ErrorInfo = {
      code: ErrorCode.UNKNOWN_ERROR,
      message: 'Something went wrong.',
    },
  ) {
    super(errorInfo.message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'AddonApiError';
  }
}
