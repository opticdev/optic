import * as pathToRegexp from 'path-to-regexp';

export interface IIgnoreRunnablePredicate {
  methods: string[];
  path: string;
  regex: RegExp;

  shouldIgnore(method: string, url: string): boolean;
}

export interface IIgnoreRunnable {
  rules: IIgnoreRunnablePredicate[];

  shouldIgnore(method: string, url: string): boolean;
}

export function parseIgnore(ignores: string[]): IIgnoreRunnable {
  const rules = ignores.map(parseRule).filter(notEmpty);
  return {
    rules,
    //expects uppercase methods
    shouldIgnore: (method: string, url: string) => {
      return !!rules.find((i) => i.shouldIgnore(method, url));
    },
  };
}

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export const allowedMethods = [
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'DELETE',
  'CONNECT',
  'OPTIONS',
  'TRACE',
  'PATCH',
];

export function parseRule(
  userInput: string
): IIgnoreRunnablePredicate | undefined {
  const array = userInput.split(/[ ,]+/);
  if (array.length === 0 || userInput.length === 0) {
    return;
  }

  let methods: string[] = [];

  const pathInput = array.splice(array.length - 1)[0];
  const methodArray = array;

  if (methodArray.length === 0) {
    methods = allowedMethods;
  } else {
    methods = methodArray
      .map((i) => i.toUpperCase())
      .filter((i) => allowedMethods.includes(i));
  }
  const regex = pathToRegexp(pathInput);
  const shouldIgnore = (method: string, url: string) =>
    methods.includes(method) && regex.exec(url) !== null;

  return {
    methods,
    path: pathInput,
    regex,
    shouldIgnore,
  };
}
