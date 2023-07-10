export const isParameterObject = (
  value: any
): value is { name: string; in: string } =>
  typeof value === 'object' &&
  !Array.isArray(value) &&
  value !== null &&
  'name' in value &&
  'in' in value;

export const getParameterIdentity = <T extends { name: string; in: string }>(
  obj: T
): string => `name${obj.name}:in${obj.in}`;
