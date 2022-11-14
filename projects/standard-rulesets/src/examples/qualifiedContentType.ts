import MIMEType from 'whatwg-mimetype';

export function qualifiedContentType(contentType: string): boolean {
  let parsedType = contentType && MIMEType.parse(contentType);
  if (parsedType) {
    if (
      parsedType.essence === 'application/json' ||
      parsedType.essence === 'application/xml' ||
      parsedType.essence === 'text/json' ||
      parsedType.essence === 'text/plain' ||
      parsedType.subtype.endsWith('+json') ||
      parsedType.subtype.endsWith('+xml')
    ) {
      return true;
    }
  }

  return false;
}
