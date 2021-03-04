## Usability testing checklist

The goal of the usability testing checklist is to not only look for correct behavior, but to walk through the user experience regularly. Much is already/will be automated, which is great for compliance. The actual use of the software should be evaluated routinely as well, to make sure the user has a good experience. It is broken into two parts: the "[Happy Path](#happy-path-testing)" which addresses the core features to document and update a specification, and "[Additional usability testing](#additional-usability-testing)" to cover other features which are important but not part of the core documentation flow.

## "Happy Path" testing

Optic assures that every change is planned, discussed, and documented before it can be released. That means that every change must be observed, and as such, there is a core "happy path" that must always be fully functional in releases:

- `api init` must register and successfully start a project.
- A baseline specification must be built from sample traffic.
- The specification must be updated by changes in observed traffic.
- The documentation in the Optic Dashboard must be up to date after behavior changes are committed.
- Committing the specification to the project Git repository should be a sensible process.

There are other paths to test, and our goal is to have everything work as expected, but the "happy path" MUST always work as it is a critical path to reliable specifications. The following test plan should be run on release. Optional steps are noted, with conditions, where appropriate.

### Pre-Flight

- [ ] If installing from NPM, `npm info @useoptic/cli` to check the latest version. Make sure it has the expected version/beta version listed to confirm deployment. Otherwise, follow the pre-release protocol provided separately.
- [ ] Install your latest package globally from the relevant source (NPM/Yarn if live, package install if pre-release build.
- [ ] Run `api --version` to check your build and Node environment (min. Node v12).
- [ ] Run `api daemon:stop` to make sure no other sessions are running.
- - [ ] Pick a model project. This must have multiple endpoints to document, and must be runnable by both a Start command and with a Proxy integration. It should have tests available to cover the endpoints to make testing easy and repeatable.
- [ ] Change directory to the root of the project.
- [ ] Remove any existing Optic setup  `rm -rf optic.yml .optic`.
- [ ] `git init` your project. If it is already a git repo, you can optionally make sure it is clean (other than removing the optic files, above), stage any changes necessary, and commit this state. This will make committing specification chaange tests easier.

### Initialize a repository

- [ ] Run `api init`
	- [ ] Enter `no`: Expect an error `Optic must be initialized in your API's root directory. Change your working directory and then run api init again`
- [ ] Run `api init` for **Start Command**
	- [ ] Enter `yes`
	- [ ] Enter an API name
	- [ ] Optic should launch a browser window to `http://localhost:34444/apis/1/setup`
- [ ] On the `/apis/1/setup` page, set up a "Start Command" integration:
	- [ ] For your project, select the appropriate framework. The optic.yml file should populate with a suggestion
	- [ ] Add an incorrect command (`"false"` works on POSIX-y systems).
	- [ ] Run `api check start`: Expect:
		- [ ] a command line error, does not start a long-running process.
		- [ ] a browser error, red highlighting on command and tool tips when hovering over **Resolve Issue** text.
	- [ ] Resolve issue by entering a valid start command.
	- [ ] Occupy the inboundUrl port (default 4000). `nc -kl 4000` should bind netcat.
	- [ ] Run `api check start`: Expect:
		- [ ] A command line error, Optic is not able to start its proxy
		- [ ] UI errors update: command now passes/in green, inboundUrl is highlighted red and a tool tip shows up when hovering over the **Resolve Issue** text.
	- [ ] Resolve issue by unbinding the inboundUrl port.
	- [ ] Run `api check start`: Expect checks to pass, page to suggest running `api start`
- [ ] On the `/apis/1/setup` page, set up a **Proxy** configuration --or-- skip to **Generate API baseline documentation**
	- [ ] Select the **Proxy** integration. The optic.yml file should update the start configuration with targetUrl and inboundUrl parameters
	- [ ] Run `api check start` without starting the service to test: Expect:
		- [ ] a command line error after tiemout, is not resolvable.
		- [ ] a browser error, red highlighting on targetUrl and tool tips when hovering over **Resolve Issue** text.
	- [ ] Resolve issue by entering a valid start command.
	- [ ] Occupy the inboundUrl port (default 4000). `nc -kl 4000` should bind netcat. *Note* if this was tested successfully earlier, this can be skipped.
	- [ ] Run `api check start`: Expect:
		- [ ] A command line error, Optic is not able to start its proxy
		- [ ] UI errors update: command now passes/in green, inboundUrl is highlighted red and a tool tip shows up when hovering over the **Resolve Issue** text.
	- [ ] Resolve issue by unbinding the inboundUrl port.
	- [ ] Set targetUrl to the URL of the service under test. (*e.g.* http://localhost:5000)
	- [ ] Start the service to test and run `api check start`: Expect checks to pass, page to suggest running `api start`.

### Generate API baseline documentation (starting at setup page).


- [ ] Run `api start` to start the project under test.
- [ ] Send 5 requests to the application through Optic: Expect the counter to show 5/5 requests sent, and a link to "start documenting". Clicking this should take you to the review page.
	- [ ] One request must be to a default ignored endpoint (a root HEAD/OPTIONS request, or one to an asset (*e.g.* .html, .css) will work). The latest default rules are in `.optic/ignore`.
	- [ ] One request must be to an endpoint that will be ignored, but is not ignored by the default rules. This lets us test the ignore feature.
- [ ] The review page shows traffic for the endpoints under observation: Expect the request to the default ignored endpoint should not show up here.
- [ ] Add endpoints to your specification.
	- [ ] Check to document, then use the ignore button to ignore an endpoint: Expect the endpoint disappears from the review list, and will not be documented (*Note* there is a checklist item later).
	- [ ] Check all remaining endpoints: Expect the "Undocuemtend Endpoints Detected" message on the left to show a circle filling up (including the ignored endpoint) and a green checkbox to appear once all endpoints are checked.
	- [ ] Click **Document (x) Endpoints**, describe your changes, and click **Apply**: Expect the auto-learn process to proceed. Once complete, you are redirected to the documentation and the changes are noted in a modal dialog.


### Review the API baseline documentation

*Note* Always check that the documentation is updated, and that ignored endpoints don't show up in documentation. If no changes have been made to the documentation page itself, the annotation tests may be skipped.

- [ ] Dismiss the modal dialog.
- [ ] All documented endpoints should show up in the documentation.
- [ ] The ignored endpoint should **not** show up in the documentation.
- [ ] Review the full documentation for one endpoint. The Request and Response bodies should be correct.
- [ ] Annotate an endpoint.
	- [ ] Add a brief description for **what does this endpoint do?**.
	- [ ] Add a **detailed description** (2-3 sample sentences).
	- [ ] Add a **request body description**.
	- [ ] Add a **{{status code}} response description}}** for a response.
	- [ ] Pick a field to annotate by clicking the **add a field description** icon when hovering over a field.
	- [ ] Refresh the page: Expect all fields are properly documented.
- [ ] Return to the documentation page by clicking the **Documentation** button in the left-hand navbar: Expect the documented API endpoint to show the **what does this endpoint do?**, **detailed description** text.

### Review and approve some behavior diffs

- [ ] Generate traffic to provide a difference from existing documented behavior of the API.
- [ ] Re-send traffic that matches the documented specification.
- [ ] Navigate to the Review page (triangle "diff" icon): Expect changes to show up and no new undocumented routes.
- [ ] Click through the options under the Accept button: Expect the behavior can be overridden.
- [ ] Ignore one change. A later step checks to make sure this isn't documented.
- [ ] Accept all changes: Expect a commit modal to appear.
- [ ] Commit the changes: Expect Optic to redirect you to the documentation page.
- [ ] Review the documentation: Expect
	- [ ] Behavior changes are properly documented.
	- [ ] Detail added to endpoint under **Review the API baseline documentation** is still present.
	- [ ] The ignored diff is not documented.

### Commit specification changes to the project

- [ ] Terminate the Optic session with `ctrl+c`.
- [ ] Run `git status --untracked-files .`: Expect:
	- [ ] `.gitignore`, `ignore`, `api/specification.json` are present under the `.optic` folder.
	- [ ] `optic.yml` is present at the project root.
	- [ ] No other .optic files should be reported by git status (such as `captures`).
	- *Note* Any API project files modified by tests (such as test databases) may show up. You can ignore these for test purposes.
- [ ] `git add .optic optic.yml` the Optic files to git staging.
- [ ] Test complete, `git reset` will unstage all changes.

## Additional usability testing

These tests assume that the [Happy Path tests](#happy-path-testing) have already been run. If you haven't done that yet, they're expected on every release: finish them first.

### Run tests

This requires an automated test suite to run, such as a Newman script.

- [ ] Set up a test task `start-tests` in `optic.yml`. Example:

	```
	  start-tests:
	    command:  newman run <collection> --environment <environment>
	    useTask:  start
	```
- [ ] Run `api check start-tests`. This should pass, and will help troubleshoot any errors in the task definition.
- [ ] Run `api run start-tests --collect-coverage`: Expect
	- [ ] The tests run successfully (if not, verify that your tests run without Optic).
	- [ ] After completing tests, an API Coverage Report is generated.
	- [ ] The coverage report accurately represents your test suite

### Check API Status

At this point, all observed traffic should be documented. The status of the project should be clean, with no undocumented URLs or differences in behavior observed by Optic. If that is not the case, the observations will need to be resovled/ignored in the Optic review dashboard.

- [ ] Run `api status --pre-commit && echo $?`: Expect
	- No diffs observed for existing endpoints.
	- No undocumented URLs observed. 
	- `0` is echoed to the terminal (successful program exit)
- [ ] Run `api start` to bring up the project.
- [ ] Send new traffic to the project: either modify an existing endpoint, or send traffic to a new endpoint. _Note_ this traffic will show up in the Optic review dashboard. Do not ignore/document/approve it.
- [ ] Stop the process with `ctrl+c`.
- [ ] Run `api status --pre-commit && echo $?`: Expect
	- Diffs and undocumented URLs are reported as observed.
	- `1` is echoed to the terminal (API status is "dirty" and requires review)
- [ ] Run `api status --review` and document/accept observed differences.

### Run a Script

Scripts allow for users to export an OpenAPI specification to another system. For usability, we're testing to make sure that dependencies are respected and a specificaiton is generated that can be consumed by a command.

- [ ] Set up a Script definition in `optic.yml`. Under dependencies, it should check for both a program that exists and one that doesn't. It should perform a trivial task under `install`, and `command` should either also be trivial or dump out the specification file that is generated for verification. Example:

```
scripts:
  test-script:
    command: cat .optic/generated/openapi.json
    dependsOn:
      - "true"
      - notaprog
    install: echo "Installing pre-requisites..."
```

- [ ] Run `api scripts test-script`: Expect failure for missing dependency, and instructions to re-run with `--install` flag.
- [ ] Run `api scripts test-script --install`: Expect
	- [ ] The missing dependency is detected and reported.
	- [ ] Install command runs successfully.
	- [ ] OpenAPI files are generated.
	- [ ] The command (in the example above, outputting the generated specification) runs.
- [ ] If verifying a specification was generated wasn't part of the test script, check that `.optic/generated/openapi.(json|yaml)` contains a specification.

## Testing structures

There are several project topologies we want to target in testing. We should always cover **Recommended**, as that's the mode we suggest folks start with when setting up Optic. Others should be validated for "happy path" behavior regularly, or when code changes indicate a potential behavior difference in starting these projects:

- **Recommended** A project running on localhost, using a `command` configuration to start.
- **Local proxy** A project running on localhost, using `targetUrl` against a local target and `inboundUrl` to set up a proxy.
- **Remote proxy** A project running on localhost, using `targetUrl` against a remote target and `inboundUrl` to set up a proxy.

In addition, we have several environments where we would like to validate Optic's behavior:

- **MacOS (default)** Most of our users are here right now, and it's our primary development platform. Most testing will happen here, particularly release testing unless a release specifically targets issues on another platform. We test x86_64, though aarch64 (the M1 ARMs) should also work.
- **Windows** We support Windows 10 for developer workstations. Keep in mind that Git Bash will allow POSIX-style command invocation (for example, passing environment variables before running an application) but _all_ spawned processes (such as those given by start commands in optic.yml) will be invoked by the Windows Command shell and must follow its conventions. An alternative is to use something like `[cross-env](https://www.npmjs.com/package/cross-env)` to abstract the differences.
- **"Linux"** This is a broad brush to paint, though generally, we expect that any recent Linux distribution running a recent kernel on x86_64, should work with Optic. 

Need another platform or architecture? [Let us know](https://github.com/opticdev/optic/issues/new?title=Environment%20Request:) what you'd like to see.

And of course, we support multiple browsers. Testing should rotate through:

- **Chrome** is the most commonly used workstation browser today. We should have good coverage of Chrome.
- **Firefox** is in the top three most commonly used workstation browser that we support, and should also have some test coverage.
- **Safari** is in the top three, though until recently we didn't support it because it caused complications during setup. This suppressed user engagement with Safari, pushing it down our list. That shouldn't be the case any longer, and we can test and bring this into rotation. It may need to move above Firefox eventually.

