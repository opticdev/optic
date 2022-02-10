import queryString, { ParsedQuery } from 'query-string';

// eventually this will need to be multi-stage, respecting the other parser
// https://swagger.io/docs/specification/serialization/

export function parseQueryStringToMap(
  query: string
): ParsedQuery<string | boolean | number> {
  return queryString.parse(query, {
    arrayFormat: 'none',
    parseNumbers: true,
    parseBooleans: true,
  });
}
