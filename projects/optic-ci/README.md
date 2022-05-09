## Optic CI

Installation

```bash
npm install -D @useoptic/optic-ci
```

```bash
yarn add -D @useoptic/optic-ci
```

`optic-ci` reads config from the folder it's run from - this is used to configure the changelog, and rules. By signing up for the beta you can get an OPTIC_TOKEN which will allow you to visualize changes between APIs and the rules that your team has defined. 

```javascript
// optic.config.js
module.exports = {
  token: process.env.OPTIC_TOKEN,
  gitProvider: {
   token: process.env.GITHUB_TOKEN,
  },
}
```

## Standard rulesets

Optic comes bundled with standard rulesets ([details here](../standard-rulesets/README.md)). You can install this by running:

```
npm install -D @useoptic/standard-rulesets
```

```
yarn add -D @useoptic/standard-rulesets
```

### Catch breaking changes between versions

Turn on breaking changes detection between every API change.

```javascript
const { BreakingChangesRuleset } = require('@useoptic/standard-rulesets');

module.exports = {
  // optic.config.js
  ...
  rules: [
    new BreakingChangesRuleset()
  ],
}
```

### Apply your team's naming checks

Turn on breaking changes detection between every API change.

```javascript
const { NamingChangesRuleset } = require('@useoptic/standard-rulesets');

module.exports = {
  // optic.config.js
  ...
  rules: [
    new NamingChangesRuleset({
      applies: 'always', // also available: 'added' | 'addedOrChanged'
      options: { // valid formats are: 'camelCase' | 'Capital-Param-Case' | 'param-case' | 'PascalCase' | 'snake_case'
        properties: 'camelCase',
        queryParameters: 'camelCase',
        requestHeaders: 'camelCase',
        responseHeaders: 'camelCase',
      }
    })
  ],
}
```

### Join the beta!

We're exploring how to make writing OpenAPI, writing optic rules and standardizing APIs easy for everyone - join our beta and let us help you:
- Drive adoption of OpenAPI in your team
- Write custom rules and checks specific to your team's standards

You can join by signing up on our [website](https://www.useoptic.com/).
