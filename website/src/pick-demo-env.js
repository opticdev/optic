export function buildDemoUrl(path) {
  return window.location.hostname.split('.').slice(1).join('.');
}
