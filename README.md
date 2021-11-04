# Governance Tools POC


## Quick start
We use [`Task`](https://taskfile.dev) to run tasks. Install `Task`.
```
$ task postpull
```
which runs tasks from [`Taskfile.yml`](Taskfile.yml)



## Project Structure
This is a yarn v2 workspace (https://yarnpkg.com/features/workspaces)

Please read the docs for [`yarn workspaces foreach`](https://yarnpkg.com/cli/workspaces/foreach) to see the different options you have available, for example, only running against changed workspaces.

We are using the following plugins which you can see in the [`.yarnrc.yml`](.yarnrc.yml)
- `yarn plugin import workspace-tools` (enables helpers like `yarn workspaces foreach -ptvA run build`) https://yarnpkg.com/cli/workspaces/foreach
- `yarn plugin import typescript` (automatically adds `@types/$x` when you use `yarn workspace $workspacePackage add $x`) https://yarnpkg.com/api/modules/plugin_typescript.html
- `yarn plugin import version` (lets you bump the version of workspace projects) https://yarnpkg.com/cli/version/ (if you run into issues, `rm .yarn/versions/*` and try again)


## Developer Workflow

In one terminal:
```
$ npm install -g serve
$ serve ./projects/openapi-utilities/inputs/openapi3/private/snyk/org-id-versions/all-dates --cors -p 5000
```
In another terminal:
```
$ cd projects/developer-ui
$ yarn start
```

When the ui opens, choose a file with the suffix ".flattened-without-sourcemap.json" or choose any flattened yaml/json file (i.e. with no internal or external refs). It will open by default in both panes. Then you can make changes to the right pane, and click the "update content" button and it will re-compute and re-render the changelog. 