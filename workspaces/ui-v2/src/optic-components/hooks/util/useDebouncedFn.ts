import { useMemo } from 'react';
import debounce from 'lodash.debounce';

export const useDebouncedFn = <T extends (...args: any) => any>(
  fn: T,
  ms: number
) => {
  return useMemo(() => debounce(fn, ms), [fn, ms]);
};
