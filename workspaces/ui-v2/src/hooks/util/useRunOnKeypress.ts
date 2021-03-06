import { KeyboardEvent, useCallback } from 'react';

export const useRunOnKeypress = <T extends (...args: any) => any>(
  fn: T,
  options: {
    keys?: Set<string>;
    inputTagNames?: Set<string>;
  } = {}
) => {
  return useCallback(
    (e: KeyboardEvent) => {
      const { keys, inputTagNames } = options;
      // use upper case to handle case insensitivities
      const upperCaseTags =
        inputTagNames &&
        new Set([...inputTagNames].map((tag) => tag.toUpperCase()));
      const upperCaseKeys =
        keys && new Set([...keys].map((key) => key.toUpperCase()));

      const keyPressValid = upperCaseKeys
        ? upperCaseKeys.has(e.key.toUpperCase())
        : true;
      const elementTagValid = upperCaseTags
        ? e.target instanceof Element
          ? upperCaseTags.has(e.target.tagName.toUpperCase())
          : false
        : true;

      if (keyPressValid && elementTagValid) {
        fn(e);
      }
    },
    [fn, options]
  );
};
