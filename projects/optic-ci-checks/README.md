## Optic CI packaged with standard rules

Install
```bash
npm install -g @useoptic/optic-ci
```
```bash
yarn global add @useoptic/optic-ci
```

### Catch breaking changes between versions:

**Comparing files:**

`optic-ci` always takes two versions of your OpenAPI specification. If you are working in Git compare across branches:

```bash
optic-ci compare --from main:openapi.yaml --to feature/xyz:openapi.yaml
```

When you are just trying to learn how `optic-ci` works, copy your OpenAPI file and run compare on each:

```bash
optic-ci compare --from openapi-v1.yaml --to openapi-v2.yaml
```

Give it a try! Make a required response property optional or add a required query parameter! There are many ways to break and API. 

### Apply your team's naming checks 

`optic-ci` ships with the ability to enforce standard naming rules. Add the `x-optic-naming-checks` extension to the root of your OpenAPI to tell Optic about your team's casing strategy: 

Options: `camcelCase` `PascalCase` `snake_case` or `param-case`. 

Optic understands that if you suddenly turn on naming rules for a legacy API, it will fail on a lot of existing surface area. This is not helpful because changing those names is a breaking change. 

We suggest users also set `applyNamingRules: whenAdded` so that these rules only fail if improperly named surface area is added to the API (ie it governs new endpoints, fields, headers, etc but not old ones). If you want it to fail everywhere (not suggested), you can set it to `always`.  

```yaml
x-optic-naming-checks:
  responseProperties: camelCase
  requestProperties: camelCase
  queryParameters: snake_case
  requestHeaders: param-case
  responseHeaders: param-case
  applyNamingRules: whenAdded

```

Give it a try -- add a name that does not follow the standard!

### Want to write your own rules? 


### Join the beta! 

Do you like `optic-ci`? It solves this problem well because people just like you joined our Beta, connected with us on Slack and started helping us learn really fast. Join our beta to work directly with Optic's team to help us make OpenAPI and API-first easy for teams to adopt!

