import { useCallback, useState } from 'react';

export const useStateWithSideEffect = <T>({
  initialValue,
  sideEffect,
}: {
  initialValue: T;
  sideEffect: (newValue: T) => void;
}) => {
  const [value, setValue] = useState<T>(initialValue);

  return {
    value,
    setValue: useCallback(
      (value: T) => {
        sideEffect(value);
        setValue(value);
      },
      [sideEffect]
    ),
  };
};
