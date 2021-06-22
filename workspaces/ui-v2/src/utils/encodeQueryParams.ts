export function encodeQueryParams(params: Record<string, string>): String {
  return Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
}
