const json = ['application/json', 'application/vnd.api+json'];
export function qualifyJsonDiffer(contentType: string) {
  return json.includes(contentType);
}
