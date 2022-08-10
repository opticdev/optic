## Optic `oas` cli

Intall `oas` as part of installing `optic`:

```bash
npm install -g @useoptic/optic
```

## Easily adopt OpenAPI

Create new and update existing OpenAPI specifications straight from your services' traffic. Optic makes it easy to adopt OpenAPI in a day, without changing how you work.

### Tracking changes with Optic:

Show Optic real API traffic using the `oas capture` commands. Traffic can come from your development environment, tests, or the browser.

```bash
oas capture --proxy localhost:3000 traffic.har
```

Captured traffic is like working copy in Git. Use `oas status` to see the difference between how your OpenAPI specification says your API works, and how it actually works.

```bash
oas openapi.yaml status --har traffic.har
```

<img src="https://user-images.githubusercontent.com/857549/183688912-f8c8c486-01f0-40d6-832d-a2895bead18e.png" width="400" />

Run `oas add` and `oas update` to update the spec. Optic precision patches your OpenAPI file with the same additions, updates, and removals you would manually write. This is faster and much less error-prone than writing OpenAPI by hand.

```bash
oas openapi.yaml add --har traffic.har  GET /lists
```

<img src="https://user-images.githubusercontent.com/857549/183689051-7599a5d1-8098-4613-981b-cd463951b492.png" width="400" />

```bash
oas openapi.yaml update --har traffic.har
```

<img src="https://user-images.githubusercontent.com/857549/183689232-878d6a7b-557f-4f74-a6d2-84258531e18b.png" width="400" />

> ### A collaborator, not a generator
>
> Using `oas` to update your spec is like working with a collaborator. It helps you write all the boilerplate OpenAPI and keep your spec in sync with the actual API's behavior.
>
> ✅ **Never overwrites changes developers make to the same OpenAPI file**
>
> ✅ **Respects $refs across multiple files**
>
> ✅ **Improves accuracy of your specification**
>
> ✅ **Speeds up your team**

[Read Adopting OpenAPI documentation](https://www.useoptic.com/docs/track-changes)
