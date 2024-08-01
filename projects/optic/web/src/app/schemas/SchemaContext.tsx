import React, { type PropsWithChildren, useState } from 'react';
import { od, or, type InternalSpecSchema } from '../utils';

const SchemaContext = React.createContext<{
  polymorphicChoices: Map<string, number>;
  setPolymorphicChoices: React.Dispatch<
    React.SetStateAction<Map<string, number>>
  >;
} | null>(null);

export const SchemaContextProvider = ({ children }: PropsWithChildren) => {
  const [polymorphicChoices, setPolymorphicChoices] = useState<
    Map<string, number>
  >(new Map());
  return (
    <SchemaContext.Provider
      value={{ polymorphicChoices, setPolymorphicChoices }}
    >
      {children}
    </SchemaContext.Provider>
  );
};

export const useSchemaContext = () => {
  const value = React.useContext(SchemaContext);
  if (!value) {
    throw new Error('SchemaContext could not be found');
  }
  return value;
};

export const op = Symbol.for('optic_path');

export type WithOpticPath<T extends object | undefined> = T & {
  [op]: string;
};

export const addOpticPath = <T extends object>(
  after: T,
  currentPath: string
): WithOpticPath<T> => {
  const obj = after as any;
  obj[op] = currentPath;

  const stack: [string, any][] = [...Object.entries(obj)];

  while (stack.length) {
    const [key, value] = stack.pop()!;
    const nextPath = currentPath + `/${key}`;

    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        stack.push([`${nextPath}/${i}`, v]);
      });
    } else if (value !== null && typeof value === 'object') {
      addOpticPath(value, nextPath);
    }
  }

  return obj;
};

export function getDefaultPolymorphicIndex(
  path: string,
  schemas: InternalSpecSchema[],
  choices: Map<string, number>
): number {
  let polymorphicIndex = choices.get(path);
  // Select the index with errors
  if (polymorphicIndex === undefined) {
    const idx = schemas.findIndex(
      (s) => (s[or]?.length ?? 0) > 0 || s[od]?.hasNestedChanges
    );
    polymorphicIndex = idx === -1 ? 0 : idx;
  }

  return polymorphicIndex;
}
