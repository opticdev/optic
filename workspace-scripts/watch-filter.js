const cwd = process.cwd();
const workspacePrefixes = require('../package.json').workspaces.map(x => `/${x}`);
console.log({cwd, workspacePrefixes});
module.exports = function (path, stat) {
  if (path === `${cwd}/package.json`) {
    return true;
  }
  const workspaceRoot = `${cwd}/workspaces`;
  if (!path.startsWith(workspaceRoot)) {
    return false;
  }
  if (path.length === workspaceRoot.length) {
    return true;
  }
  const subPath = path.substring(cwd.length);
  if (
    [
      '/workspaces/config',
    ].some(x => subPath.startsWith(x))
  ) {
    return true;
  }

  for (const workspacePrefix of workspacePrefixes) {
    if (subPath.startsWith(workspacePrefix)) {
      if (subPath.length === workspacePrefix.length) {
        return true;
      }
      const rest = subPath.substring(workspacePrefix.length);
      if (
        [
          '/src',
          '/package.json',
          '/tsconfig.json'
        ].some(x => rest.startsWith(x))
      ) {
        return true;
      } else {
        return false;
      }
    }
  }
  return false;
};