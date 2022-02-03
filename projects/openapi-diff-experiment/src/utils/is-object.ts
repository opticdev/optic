export function isObject(val: any) {
  if (typeof val === 'object' && !Array.isArray(val) && val !== null) {
    return true;
  } else {
    return false;
  }
}
