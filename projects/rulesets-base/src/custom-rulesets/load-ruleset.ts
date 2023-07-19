// Handle ESM and CJS modules
export function loadRuleset(path: string) {
  const mod = require(path);
  return mod && mod.__esModule ? mod : { default: mod };
}
