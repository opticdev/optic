# Developer Setup

The Optic project is written in Rust, Typescript (which is transpiled to ECMAScript) and ECMAScript. Dependencies are managed with Yarn Workspaces, and the NodeJS portions are split into subprojects for organization. Workspaces make it easier to contribute to a component of the Optic project, and we welcome participation

Any IDE you use that supports the languages in which you're working is fine. There are plenty of options, and we won't go into details on IDEs. For reference, we use a variety of tools across the Optic team: IntelliJ IDEA, Visual Studio Code, and Sublime for examples. You should already have Git installed, and you may need to install Yarn and Task as well depending on how you are set up.

This guide will let you know what to expect when contributing to Optic, and how to get started in general.

## Before You Get Started

Please read our contributor guidelines in `Contributing.md`. This will help you identify what contributions are the most valuable, and how to get them submitted. Doing this now will save time later when submitting code for review.

It's a good idea to have a design in place beforehand. It doesn't have to be fancy, especially for contributions that are smaller in scope. What is the goal of the contribution? What behaviors do you expect, where can bad data slip in, and how will they be addressed?

## Resources

- [Optic repository](https://github.com/opticdev/optic)
- [IntelliJ IDEA](https://www.jetbrains.com/idea/) or your development environment of choice.
- [Rustup](https://www.rust-lang.org/tools/install) for Rust.
- [NVM](https://github.com/nvm-sh/nvm) for managing Node.js versions
- [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable) for managing dependencies.
- [Task](https://taskfile.dev/) for running tasks.
- [Git](https://git-scm.com/) to manage the code repository.

## Setup

If you're using an IDE (like IntelliJ), some of these steps may be handled by your tool. For example, installing dependencies is common behavior from a language-aware IDE. You may want to open your IDE after cloning the Optic project and walk through it. If you don't have that capability, or want to install everything by hand, the instructions below should work.

- Clone the [Optic repository](https://github.com/opticdev/optic) to your development environment with Git.
- If necessary, install Yarn and Task. You can not use NPM; we are using Yarn workspaces. On MacOS, this can be done via Homebrew `brew install yarn`. Otherwise, check out the **Resources** section for more information.
- Navigate to the Optic repository. You should be on the `develop` branch by default.
- Navigate to the project root, and run `task`. This provides aliases for managing the development lifecycle of Optic. Note, this must be run for every terminal instance, and you may find it convenient to add this to your `.profile` or equivalent so future terminal invocations will be ready to go.
- Install dependencies and build the code with `task workspaces:build`. Yarn will install dependencies for all of the workspaces present in the project.

## Environment Variables
Each workspace may rely on environment variables. You can create a `.env` file in the project root and it will be exposed automatically as `OPTIC_DEBUG_ENV_FILE` when you run `source sourceme.sh`, which most of the workspaces will look for automatically, OR you can run `optic_export_env $OPTIC_DEBUG_ENV_FILE` to export all the variables from the .env file into your shell. 


## Yarn workspaces
Each workspace should have a package.json file with a name field like `@useoptic/cli`. To run package.json scripts for one particular workspace, run e.g. `yarn workspace @useoptic/cli ws:build`

## Validate Setup to Contribute to Optic's User Interface

- Navigate to a workspace to validate it can be built. For example, try `workspaces/ui-v2`.
- Run `yarn start:local` to start the workspace. For the UI, this should automatically launch a browser instance to view the started server. Your browser will land on the splash page at [http://localhost:3000](http://localhost:3000).
- Validate you can load a mocked test route from one of the example sessions under `public/example-sessions` such as [http://localhost:3000/examples/diff-use-cases-with-events](http://localhost:3000/examples/diff-use-cases-with-events).

## Validate Setup to contribute to Optic’s Local CLI

- You may want to navigate to the project root and run `source sourceme.sh` to ensure you have the local development aliases created. 
  - It creates `apidev` and `uidev`, which takes the place of `api` against your local development build.
  - If you are iterating on the UI and `api` CLI, use `uidev`, which expects the UI to be started on port 3000 and proxy api requests to the `cli-server`; otherwise use `apidev` 
  ```
  terminal 1:
  $ cd workspaces/ui-v2
  $ yarn start:local
  
  terminal 2:
  $ source sourceme.sh
  $ uidev start
  ```
- Determine a visible change to make to the workspace. For example, when `api start` is run in a directory without an `optic.yml` file, you'll get an error message telling you the project is not found.
- Confirm the current behavior of the code by running the `apidev` command (in this case, `apidev start`).
- Run `task workspaces:build --watch` to watch and rebuild your workspace as you make changes.
- Navigate to the target workspace, and make a visible change.
    - For example, in `workspaces/cli-shared/src/index.ts`, you can change the start failure messages.
    - Search for "*No Optic project found in this directory.*" which is the start of the error message you get when no `optic.yml` file is present.
    - Make a small change to the string, such as "***Success!*** *No Optic project found in this directory.*"
- Re-run the `apidev` command to verify the change is made (in this case, `apidev start`).

## Validate Setup to contribute to Optic's Rust Domain codebase

- After installing cargo with [rustup](https://rustup.rs/) you should be able to get `cargo test` working from inside `workspaces/diff-engine`
- `cargo doc --document-private-items --open` will generate and open the Rust type and function documentation for the project
- For an IDE we recommend [Visual Studio Code](https://code.visualstudio.com/) with the rust-analyzer [extension](https://marketplace.visualstudio.com/items?itemName=matklad.rust-analyzer) 
- If you have `lldb` [debugging](https://marketplace.visualstudio.com/items?itemName=vadimcn.vscode-lldb) is straightforward to setup in Visual Studio Code
- For a repl [evcxr](https://github.com/google/evcxr) can be used by interactively adding a dependency with `:dep optic_diff_engine = {path = "/your-full-path/optic/workspaces/diff-engine"}`

## Troubleshooting and Additional Notes
- Do not run `yarn install` from anywhere except the project root. If you have done this remove all the `node_modules` directories, or do a fresh clone.
- Assure you have a proper build already set up:
    - Navigate to the project root. 
    - Re-run `task workspaces:clean`
    - Re-run `task workspaces:build`
    - Re-run `source sourceme.sh`
- If you run into further problems, please let us know the tools you are using, and the errors you are seeing, for reference. While we can't support every environment, it can be helpful to know where problems exist. In the mean time...

### Additional Notes

Every environment is different, and if you're using other tooling, that adds additional variables. Here's a few notes to consider:

- If using IntelliJ or an IDE that indexes your local files, mark the `build` directory in each workspace project as excluded from search. This prevents hits on build artifacts from polluting your search results, which can add noise and contribute to confusion.
- If you're using your own IDE, check if it supports Yarn workspaces. Not all tools support Yarn workspaces, and some features like "jump to definition" may not behave as expected.
