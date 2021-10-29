# Governance Tools POC

## Project Structure
This is a yarn v2 workspace (https://yarnpkg.com/features/workspaces)

We are using the following plugins which you can see in the [`.yarnrc.yml`](.yarnrc.yml)
- `yarn plugin import workspace-tools` (enables helpers like `yarn workspaces foreach -pt run build`) https://yarnpkg.com/cli/workspaces/foreach
- `yarn plugin import typescript` (automatically adds `@types/$x` when you use `yarn workspace $workspacePackage add $x`) https://yarnpkg.com/api/modules/plugin_typescript.html



