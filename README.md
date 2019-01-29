# Optic -- API Automation for the Modern Team
Optic documents any REST API automatically using a proxy server. When you run your project's tests through the Optic CLI it stands in the middle of your test process and mock API server. It collects every Request/Response pair and merges them into an accurate API Spec. 

The only requirement is that you've written good tests with ample coverage of the API. 

Instead of making you manually document the API, or asking you to add messy annotations all over your code, Optic uses the tests you've (hopefully) already written to learn the API Spec. We believe the only API Spec that matters is one based on real behavior learned at runtime. 

Optic takes 15 minutes to setup and works with any tech stack and once configured you:
- Get accurate API Specs, that are always up to date
- Never have to write another API Spec manually
- The benefits of self-documenting frameworks, w/o migrating to one

Quick Start: 

1. Sign up for an Optic account (optional, but recommended) 
1. Install the Optic CLI
```bash
npm install optic-cli -g
```

2. Add an `optic.yml` file to your API repository. Read more about the [structure of this file here](https://github.com/opticdev/optic/blob/master/docs/using/project-setup.md)
```yaml
name: My API        # The name of the API as it appears on the Optic Dashboard

test: npm run test  # The test command Optic uses to run your tests
host: localhost     # The host of your mock API server
port: 3005          # The port of your mock API server

paths:
  - /users
  - /users/login
  - /users/:userId/followers
```

3. Configure your tests to use the Optic proxy when the `optic-watching` environment variable is present. [Explained in detail here](https://github.com/opticdev/optic/blob/master/docs/using/testing-guidelines.md)

4. Run `optic spec` to run tests and view the API Spec. You can also [publish the API Specs to Optic's website] and share it with your team (https://github.com/opticdev/optic/blob/master/docs/using/publishing-snapshots.md).


## Full Documentation
Setup: 
- [Installing Optic](https://github.com/opticdev/optic/blob/master/docs/setup/install.md)
- [Adding APIs on Optic's Website](https://github.com/opticdev/optic/blob/master/docs/setup/creating-projects.md)

Generating Documentation: 
- [Project Setup](https://github.com/opticdev/optic/blob/master/docs/using/project-setup.md)
- [Testing Guidelines](https://github.com/opticdev/optic/blob/master/docs/using/testing-guidelines.md)
- [Publishing Snapshots](https://github.com/opticdev/optic/blob/master/docs/using/publishing-snapshots.md)
- [Configuring API Authentication](https://github.com/opticdev/optic/blob/master/docs/using/authentication.md)

## License 
MIT 

## About 
Optic (YC S18) is on a mission to automate routine programming so developers can focus fully on the work that matters most. We've been open source since day 1 and are committed to always supporting an open source + free-forever version of Optic. In order to honor that commitment we are a business and we do [charge teams for advanced collaboration features](useoptic.com/pricing). Our core technology is open source so you are of course welcome to implement such features on your own, but we hope you'll come give ours a try first :) 
