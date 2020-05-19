import { debug } from 'debug';
import { setLogger } from '@useoptic/domain';

setLogger(() => {});

export const developerDebugLogger = debug('optic-debug');
export const userDebugLogger = debug('optic');
