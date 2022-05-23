# OperationRule

Creates an OperationRule. An OperationRule allows you to write assertions around Operations in your API Specification.

```javascript
new OperationRule({
  name: 'prevent operation removal',
  rule: (operationAssertions) => {
    operationAssertions.removed('not remove operation', () => {
      throw new RuleError({
        message: 'cannot remove an operation',
      });
    });
  },
});
```

`new OperationRule(options)`

The following table describes the options object.

| property | description                                                                                                                                                                                               | required | type                                                                       |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------- |
| name     | the name of the rule                                                                                                                                                                                      | yes      | `string`                                                                   |
| matches  | A function used to determine when this Rule should be applied. Return true to indicate this Rule should run.                                                                                              | no       | `(operation: Operation, ruleContext: RuleContext) => boolean`                  |
| docsLink | A link to the documentation for this ruleset. This will be used to show the user on a rule error. If there is a more specific docsLink (e.g. on a nested Rule), the more specific docsLink will be shown) | no       | `string`                                                                   |
| rule     | A function to define assertions for a specification.                                                                                                                                                      | yes      | `(operationAssertions: OperationAssertions, ruleContext: RuleContext) => void` |

## matches

`matches` is invoked with an `Operation` and `RuleContext` objects. The [`Operation` object](./DataShapes.md#operation) corresponds to the `Operation` that this rule would run on. The [RuleContext object](./DataShapes.md#rulecontext) contains details about the location, and any [custom context](./Reference.md#custom-context). Return a boolean to indicate whether this rule should be run on the `Operation` provided.

Example:

```javascript
const has201StatusCode = new OperationRule({
  name: 'Has 201 status codes',
  // only matches post operations
  matches: (operation, ruleContext) => operation.method === 'post',
  rule: (operationAssertions) => {
    operationAssertions.requirement.hasResponses([{ statusCode: '201' }]);
  },
});
```

## operationAssertions

operationAssertions is used to define operation rules. There are [4 lifecycle triggers](./Reference.md#assertions) for registering rules which defines when they are triggered. A rule can be defined by passing in a condition (`string`), and an assertion, which is a function that receives an [`Operation` object](./DataShapes.md#operation). Throwing a `RuleError` represents a failure, RuleError [details below](./Reference.md#rule-error).

`operationAssertions[lifecycle](condition, assertion)`

```javascript
new OperationRule({
  ...,
  rule: (operationAssertions) => {
    // lifecycle rules that are available are added, changed, requirement and removed
    operationAssertions.added('contain summary', (operation) => {
      if (!operation.value.summary) {
        throw new RuleError({
          message: 'operations must contain a summary',
        });
      }
    });
  },
});
```

operationAssertion also includes a number of common helper functions. These are invoked by defining a lifecycle trigger, and then the helper function. e.g. `operationAssertions[lifecycle].helperFunction()`.

The helper functions that are included are:

- hasQueryParameterMatching
- hasPathParameterMatching
- hasHeaderParameterMatching
- hasCookieParameterMatching
- hasRequests
- hasResponses
- matches
- matchesOneOf

All of these helper functions can be inverted by prefixing with `.not`.

e.g. `operationAssertions.added.not.hasRequests([{contentType: 'application/json'}])`

### hasQueryParameterMatching

`operationAssertions[lifecycle].hasQueryParameterMatching(parameter)`

Looks for a query parameter in the operation that has a partial match with parameter. Passes if a partial match is found, fails if a partial match is not found. For more details about the matches helper - [see here](./Reference.md#matcher-helpers)

```javascript
new OperationRule({
  ...,
  rule: (operationAssertions) => {
    operationAssertions.added.hasQueryParameterMatching({
      name: 'version'
    });
    // This will match a query parameter with the shape `{ name: 'version' }`
    // query parameters with more keys will still be matched
  },
});
```

### hasPathParameterMatching

`operationAssertions[lifecycle].hasPathParameterMatching(parameter)`

Looks for a path parameter in the operation that has a partial match with parameter. Passes if a partial match is found, fails if a partial match is not found. For more details about the matches helper - [see here](./Reference.md#matcher-helpers)

```javascript
new OperationRule({
  ...,
  rule: (operationAssertions) => {
    operationAssertions.added.hasPathParameterMatching({
      name: 'userId'
    });
    // This will match a path parameter with the shape `{ name: 'userId' }`
    // path parameters with more keys will still be matched
  },
});
```

### hasHeaderParameterMatching

`operationAssertions[lifecycle].hasHeaderParameterMatching(parameter)`

Looks for a header parameter in the operation that has a partial match with parameter. Passes if a partial match is found, fails if a partial match is not found. For more details about the matches helper - [see here](./Reference.md#matcher-helpers)

```javascript
new OperationRule({
  ...,
  rule: (operationAssertions) => {
    operationAssertions.added.hasHeaderParameterMatching({
      name: 'X-Authorization'
    });
    // This will match a header parameter with the shape `{ name: 'X-Authorization' }`
    // header parameters with more keys will still be matched
  },
});
```

### hasCookieParameterMatching

`operationAssertions[lifecycle].hasCookieParameterMatching(parameter)`

Looks for a cookie parameter in the operation that has a partial match with parameter. Passes if a partial match is found, fails if a partial match is not found. For more details about the matches helper - [see here](./Reference.md#matcher-helpers)

```javascript
new OperationRule({
  ...,
  rule: (operationAssertions) => {
    operationAssertions.added.hasCookieParameterMatching({
      name: 'version'
    });
    // This will match a cookie parameter with the shape `{ name: 'version' }`
    // cookie parameters with more keys will still be matched
  },
});
```

### hasRequests

`operationAssertions[lifecycle].hasRequests(requests)`

Looks for an array of requests with a content type in the operation. A request has the following shape: `{ contentType: string }`

```javascript
new OperationRule({
  ...,
  rule: (operationAssertions) => {
    // asserts that the operation has both 'application/json' and 'application/xml' request bodies
    operationAssertions.added.hasRequests([{
      contentType: 'application/json'
    }, {
      contentType: 'application/xml'
    }]);
  },
});
```

### hasResponses

`operationAssertions[lifecycle].hasResponses(requests)`

Looks for an array of responses with a content type in the operation. A response has the following shape: `{ contentType?: string, statusCode: string }' where `contentType` is optional. If content type is not specified, only the status code will be considered when searching for the request.

```javascript
new OperationRule({
  ...,
  rule: (operationAssertions) => {
    // asserts that the operation has the following responses:
    // - response 200 with content 'application/json'
    // - response 400
    operationAssertions.added.hasResponses([{
      contentType: 'application/json',
      statusCode: '200'
    }, {
      statusCode: '400'
    }]);
  },
});
```

### matches

`operationAssertions[lifecycle].matches(shape)`

Expects the operation to match a shape. The default behavior is to do a partial match. For more details about the matches helper - [see here](./Reference.md#matcher-helpers)

```javascript
import { Matchers } from '@useoptic/rulesets-base';

new OperationRule({
  ...,
  rule: (operationAssertions) => {
    operationAssertions.added.matches({
      description: Matchers.string
    });
  },
});
```

### matchesOneOf

`operationAssertions[lifecycle].matches(shape)`

Expects the operation to match one of an array of shapes. The default behavior is to do a partial match. For more details about the matches helper - [see here](./Reference.md#matcher-helpers)

```javascript
import { Matchers } from '@useoptic/rulesets-base';

new OperationRule({
  ...,
  rule: (operationAssertions) => {
    operationAssertions.added.matches([
      { description: Matchers.string },
      { summary: Matchers.string },
    ]);
  },
});
```

## operationAssertions.queryParameter

operationAssertions.queryParameter is used to define query parameter rules. There are [4 lifecycle triggers](./Reference.md#assertions) for registering rules which defines when they are triggered. A rule can be defined by passing in a condition (`string`), and an assertion, which is a function that receives an [`QueryParameter` object](./DataShapes.md#queryparameter--pathparameter--headerparameter--cookieparameter). Throwing a `RuleError` represents a failure, RuleError [details below](./Reference.md#rule-error).

`operationAssertions.queryParameter[lifecycle](condition, assertion)`

```javascript
new OperationRule({
  ...,
  rule: (operationAssertions) => {
    // lifecycle rules that are available are added, changed, requirement and removed
    operationAssertions.queryParameter.added('not add required query parameter', (queryParameter) => {
      if (queryParameter.value.required) {
        throw new RuleError({
          message: 'cannot add a required query parameter',
        });
      }
    });
  },
});
```

## operationAssertions.pathParameter

operationAssertions.pathParameter is used to define path parameter rules. There are [4 lifecycle triggers](./Reference.md#assertions) for registering rules which defines when they are triggered. A rule can be defined by passing in a condition (`string`), and an assertion, which is a function that receives an [`PathParameter` object](./DataShapes.md#queryparameter--pathparameter--headerparameter--cookieparameter). Throwing a `RuleError` represents a failure, RuleError [details below](./Reference.md#rule-error).

`operationAssertions.pathParameter[lifecycle](condition, assertion)`

```javascript
new OperationRule({
  ...,
  rule: (operationAssertions) => {
    // lifecycle rules that are available are added, changed, requirement and removed
    operationAssertions.pathParameter.requirement('be snake_case', (pathParameter) => {
      if (!isSnakeCase(pathParameter.value.name)) {
        throw new RuleError({
          message: 'path parameter must be snake case',
        });
      }
    });
  },
});
```

## operationAssertions.headerParameter

operationAssertions.headerParameter is used to define header parameter rules. There are [4 lifecycle triggers](./Reference.md#assertions) for registering rules which defines when they are triggered. A rule can be defined by passing in a condition (`string`), and an assertion, which is a function that receives an [`HeaderParameter` object](./DataShapes.md#queryparameter--pathparameter--headerparameter--cookieparameter). Throwing a `RuleError` represents a failure, RuleError [details below](./Reference.md#rule-error).

`operationAssertions.headerParameter[lifecycle](condition, assertion)`

```javascript
new OperationRule({
  ...,
  rule: (operationAssertions) => {
    // lifecycle rules that are available are added, changed, requirement and removed
    operationAssertions.headerParameter.added('not add required header parameter', (headerParameter) => {
      if (headerParameter.value.required) {
        throw new RuleError({
          message: 'cannot add a required header parameter',
        });
      }
    });
  },
});
```

## operationAssertions.cookieParameter

operationAssertions.cookieParameter is used to define cookie parameter rules. There are [4 lifecycle triggers](./Reference.md#assertions) for registering rules which defines when they are triggered. A rule can be defined by passing in a condition (`string`), and an assertion, which is a function that receives an [`CookieParameter` object](./DataShapes.md#queryparameter--pathparameter--headerparameter--cookieparameter). Throwing a `RuleError` represents a failure, RuleError [details below](./Reference.md#rule-error).

`operationAssertions.cookieParameter[lifecycle](condition, assertion)`

```javascript
new OperationRule({
  ...,
  rule: (operationAssertions) => {
    // lifecycle rules that are available are added, changed, requirement and removed
    operationAssertions.cookieParameter.added('not add required cookie parameter', (cookieParameter) => {
      if (cookieParameter.value.required) {
        throw new RuleError({
          message: 'cannot add a required cookie parameter',
        });
      }
    });
  },
});
```
