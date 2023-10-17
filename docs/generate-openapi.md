# Generate OpenAPI from tests
![GitHub Repo stars](https://img.shields.io/github/stars/opticdev/optic?style=social) ![GitHub contributors](https://img.shields.io/github/contributors-anon/opticdev/optic?style=social) ![npm](https://img.shields.io/npm/dm/@useoptic/openapi-io?style=social) ![license](https://img.shields.io/github/license/opticdev/optic?style=social)


API tests contain a lot of unused information about how your API behaves. Optic leverages that existing test traffic to keep an OpenAPI specification accurate. The `capture` command starts a local proxy and runs your API tests through it. When new endpoints are observed, Optic generates a new OpenAPI operation and adds it to your spec. When existing API behavior changes, Optic updates the spec to match the current API behavior.

**Connect your tests, get accurate docs!**

https://github.com/opticdev/optic/assets/5900338/d4e740b8-7ee2-4451-aee5-3ec062d5162b


## Install
```bash
npm install -g @useoptic/optic
```

## Quick Start

You can quickly kick the tires with our example API. 

```bash
git clone https://github.com/opticdev/bookstore-example.git
cd bookstore-example
optic capture openapi.yml
```

## Integrating Optic with your project

**1. Connect your tests.** Tell Optic how to run your tests in the `optic.yml` config file.

```yaml
# optic.yml
capture:
  openapi.yml:
    server:
      # the URL where you app will be listening. this is where Optic's
      # proxy will forward requests.
      url: http://localhost:8080
    requests:
      run:
        # the command that runs your tests
        command: yarn run test
```

**2. Configure your tests to send traffic to the Optic CLI.**

Update your test runner to send traffic through Optic's proxy. Optic injects an environment variable, `OPTIC_PROXY`, into the env of `requests.run.command` that contains the URL where the proxy is listening.

```typescript
// in your test fixture
const baseUrl = process.env.OPTIC_PROXY || process.env.API_BASE_URL || 'http://localhost:8080'
...

// send test traffic through the local proxy when it is running
fetch(`${baseUrl}/...`)
```

[Full documentation for configuring captures can be found here](https://www.useoptic.com/docs/capturing-traffic)

**3. Run your tests with Optic.**
```
> optic capture openapi.yml

Running tests 'yarn run test'...22 requests captured

5 requests did not match a documented path (5 total requests).

Run 'optic capture openapi.yml --update interactive' to add new endpoints
```

Optic detected 5 undocumented endpoints in the traffic. Let's document them next by passing the `--update` flag. 

**4. Document your API endpoints.**

```
optic capture openapi.yml --update interactive
```

Optic infers the paths in your API based on the traffic. It is pretty good at it, but if you need to override its inference you can. The more paths you add, the better the inference gets. 

![alt](https://i.imgur.com/KKNMxsD.jpg)

As you answer the prompts, OpenAPI operations will begin to appear in your OpenAPI specification. The schemas are inferred from the traffic:

![alt](https://i.imgur.com/PK702Zp.jpg)

> **Optic generates:** 
> - OpenAPI 3.0 or 3.1 (depending on the version you set).
> - New `schema.components` when documenting new endpoints.
> - Reuses existing `schema.components`.

**5. Update your documentation.**

APIs change Optic helps you keep up with those changes. Unlike most OpenAPI generators, you can run Optic as many times as you want. It will verify that your API keeps working as documented and patch the specification when it is out-of-date. 

```
optic capture openapi.yml
```
![alt](https://i.imgur.com/kDYij8e.jpg)

Cool! When an undocumented change is detected, Optic will bring it to your attention (and exit 1). In this case, a response property called `location` has been added. To resolve it, you could manually update the schema, or run `--update` to save time:

```
optic capture openapi.yml --update
```

![alt](https://i.imgur.com/UeaKSW7.jpg)

> Optic updates your OpenAPI in the correct spot. It works with shared components and even specs broken into multiple files.

---

## Use Cases
1. Quickly document an existing internal API.
1. Catch unplanned/accidental API changes in CI and prevent them from shipping.
1. Fix inaccuracies in an existing OpenAPI document.

## Advanced Usage

### Preserve manual changes 
Most OpenAPI generators overwrite manual changes. Optic preserves manual schema changes, including changes to the description, summary, or other metadata fields.

For example, If Optic detects the type of `avatar_url` is changed to `string | null`, it will patch the value of `type` without touching the `description`:
```yaml
avatar_url:
  description: the URL of our user's avatar.
  type: string
```

```diff
avatar_url:
  description: the URL of our user's avatar.
-  type: string 
+  type: 
+   - string
+   - "null"   
```

### Ignore certain paths
Some requests will not be part of your API, e.g., static assets like images, CSS, or Javascript files. This is often the case for single-page applications, so Optic offers first-class support for ignoring paths. Under the hood, we use [minimatch](https://github.com/isaacs/minimatch) to support glob expressions.

```yaml
openapi: 3.1.0
x-optic-path-ignore:
  - "**/*.+(ico|png|jpeg|jpg|gif)"
  - "/healthcheck"
```

### Set a base path
If your API operations share a common base path (e.g., `/api/v1`) you can include that path into the `.servers` section of your OpenAPI specification. This will cause Optic to ignore any traffic not matching the base path, and generate paths relative to the base path (i.e., `/users` rather than `/api/users`).
```yaml
openapi: 3.1.0
servers:
  - url: http://localhost:3030/api/v1
    description: Local Development 
  - url: http://api.example.com/api/v1
    description: Production 
```

### `$ref` and splitting OpenAPI definition across multiple files 
Optic fully supports [`$ref`](https://swagger.io/docs/specification/using-ref/). 

This lets you reuse schemas within a file: 
```yaml
type: array
items: 
  $ref: "#/components/schemas/TodoArray"
```
And even between files: 
```yaml
type: array
items: 
  $ref: "./components/schemas/Todo#ReadTodoModel"
```

Optic will keep generating and patching your OpenAPI specification in the correct places. 

### Bring your existing OpenAPI specification 
Optic works with your valid, existing OpenAPI specification 3.0 and 3.1 files. Teams that write their OpenAPI specifications by hand and work "design-first" use Optic to verify that new API endpoints are built to spec and existing ones aren't changed.

---

### Resources

- [Read our full documentation here](https://www.useoptic.com/docs)
- [Join us on Discord](https://discord.com/invite/t9hADkuYjP)

License MIT
