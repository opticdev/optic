const cwd = process.cwd();
console.log({cwd});
const workspacePrefixes = require('../../package.json').workspaces.map(x => `${cwd}/${x}`);
console.log({workspacePrefixes});
module.exports = function (path, stat) {
  const workspaceRoot = `${cwd}/workspaces`;
  if (!path.startsWith(workspaceRoot)) {
    return false;
  }
  if (path === workspaceRoot) {
    return true;
  }
  for (const workspacePrefix of workspacePrefixes) {
    if (path.startsWith(workspacePrefix)) {
      if (path === workspacePrefix) {
        return true;
      }
      const rest = path.substring(workspacePrefix.length);
      if (rest.startsWith('/src')) {
        return true;
      } else {
        return false;
      }
    }
  }
  return false;
};