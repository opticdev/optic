export function buildDemoUrl(path) {
  const host = window.location.hostname.includes('useoptic.com')
    ? 'demo.useoptic.com'
    : 'demo.o3c.info';
  const url = `https://${host}${path}`;
  console.log(url);
  return url;
}
