import { developerDebugLogger } from './index';
import { opticTaskToProps, trackAndSpawn } from './analytics-shared';

export function OpticException(e: Error, m: string) {
    const message: string = m || '';
    const stack = (new Error()).stack;
    const error: Error = e || '';

    developerDebugLogger(`Exception: ${message}`);
    developerDebugLogger(`Exceptioni Details: ${error.stack}`);

    trackAndSpawn('Exception in (some task?)', {
        message: message,
        exception: error,
        stackTrace: error.stack,
      });

}

OpticException.prototype = Object.create(Error.prototype);
OpticException.prototype.name = "OpticException";
OpticException.prototype.constructor = OpticException;