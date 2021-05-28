import React from 'react';
import { IUndocumentedUrl } from '<src>/pages/diffs/contexts/SharedDiffState';

export enum CheckboxState {
  Checked,
  NotChecked,
  Indeterminate,
}

export const useCheckboxState = (
  visibleUrls: IUndocumentedUrl[],
  selectedUrls: Set<string>,
  setSelectedUrls: React.Dispatch<React.SetStateAction<Set<string>>>
) => {
  const checkboxState = visibleUrls.every((url) =>
    selectedUrls.has(url.path + url.method)
  )
    ? CheckboxState.Checked
    : visibleUrls.every((url) => !selectedUrls.has(url.path + url.method))
    ? CheckboxState.NotChecked
    : CheckboxState.Indeterminate;

  const toggleSelectAllCheckbox = () => {
    setSelectedUrls((previousState) => {
      const newState = new Set(previousState);
      for (const { path, method } of visibleUrls) {
        if (checkboxState === CheckboxState.NotChecked) {
          newState.add(path + method);
        } else {
          newState.delete(path + method);
        }
      }

      return newState;
    });
  };

  return {
    checkboxState,
    toggleSelectAllCheckbox,
  };
};
