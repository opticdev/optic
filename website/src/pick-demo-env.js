export function buildDemoUrl(path) {
  const hostname = window.location.hostname.split('.');
  if (hostname.length <= 1) {
    hostname.join('.');
  } else {
    hostname.slice(-2).join('.');
  }

  return `https://demo.${hostname}${path}`;
}
