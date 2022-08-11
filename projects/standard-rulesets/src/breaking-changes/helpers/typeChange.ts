import { OpenApi3SchemaFact } from '@useoptic/openapi-utilities';
export function didTypeChange(
  beforeType: OpenApi3SchemaFact['type'],
  afterType: OpenApi3SchemaFact['type']
): boolean {
  const before = typeToSet(beforeType);
  const after = typeToSet(afterType);

  if (before.size !== after.size) return true;
  for (let a of before) if (!after.has(a)) return true;
  return false;
}

function typeToSet(type: OpenApi3SchemaFact['type']): Set<string> {
  if (Array.isArray(type)) {
    return new Set(...type);
  } else if (typeof type === 'string') {
    return new Set([type]);
  } else {
    return new Set([]);
  }
}
