# Standard rulesets

Optic includes the following rulesets:

- breaking changes (enforces breaking changes)
- naming (enforces casing conventions)
- examples (requires examples to be provided and for them to match the schemas)
- spectral oas (run spectral rules with Optic lifecycles)

Run these locally using `optic` cli or in [optic cloud](https://app.useoptic.com) which integrates with github and gitlab.

## Breaking Changes Rules

Turn on breaking changes by adding the breaking-changes into your `optic.dev.yml` file

```yml
ruleset:
  - breaking-changes
```

You can also exclude certain operations in breaking changes by exempting operations with a certain extension. E.g.

```yml
ruleset:
  - breaking-changes:
      exclude_operations_with_extension: x-draft # if an operation has the extension x-draft, optic will not check for breaking changes
```

```yml
paths:
  /api/users:
    get:
      x-draft: true # this endpoint will not be checked for breaking changes
      ...
```

The rules that are enforced are:

- prevent operation removal
- prevent adding new required query, cookie or header parameters
- prevent changing query, cookie, or header parameter optional -> required
- prevent changing query, cookie, path or header parameter types
- prevent adding required request body property
- prevent changing request body property optional -> required
- prevent changing request body property types
- prevent removing a response body property
- prevent changing response body property required -> optional
- prevent changing response body property types
- prevent removing a response status code

## Naming Changes

Turn on naming enforcement to ensure your OpenAPI spec is has consistent naming conventions

The configuration options are:

```yml
ruleset:
  - naming:
      required_on: always # also available are 'added' or addedOrChanged
      requestHeaders: camelCase #also available are Capital-Param-Case, param-case PascalCase and snake_case
      queryParameters: camelCase
      responseHeaders: camelCase
      cookieParameters: camelCase
      properties: camelCase
      pathComponents: camelCase
```

## Require Examples Ruleset

Require an example to be present in your schemas, and ensure that they match the schema object

The configuration options are:

```yml
ruleset:
  - examples:
      required_on: always # also available are 'added' or addedOrChanged
      require_request_examples: true # default is false
      require_response_examples: true # default is false
      require_parameter_examples: true # default is false
```
