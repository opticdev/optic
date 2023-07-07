export const casing = [
  'snake_case',
  'camelCase',
  'Capital-Param-Case',
  'param-case',
  'PascalCase',
] as const;

export const appliesWhen = ['added', 'addedOrChanged', 'always'] as const;

export type NamingConfig = {
  requestHeaders?: (typeof casing)[number];
  queryParameters?: (typeof casing)[number];
  responseHeaders?: (typeof casing)[number];
  cookieParameters?: (typeof casing)[number];
  pathComponents?: (typeof casing)[number];
  properties?: (typeof casing)[number];
};
