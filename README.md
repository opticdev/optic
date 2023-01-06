![GitHub Repo stars](https://img.shields.io/github/stars/opticdev/optic?style=social) ![GitHub contributors](https://img.shields.io/github/contributors-anon/opticdev/optic?style=social) ![npm](https://img.shields.io/npm/dm/@useoptic/openapi-io?style=social)

# Optic helps you ship a great API

**Shipping an API is easy** -- the REST is hard. We built Optic because every developer/team should be able to get the benefits of OpenAPI, without all the time/effort/costs. 

[**📋 Documentation for all your APIs**](#document-your-existing-apis-in-minutes)    ← *write your API promises down*

[**🛑 Prevent breaking changes from shipping**](#prevent-breaking-changes-with-api-diffs)  ← *keep your promises*

[**✅ Verify your API is working-as-designed (the OpenAPI and implimentation are in sync)**](#verify-your-api-is-working-as-designed)    ← *make sure the API works as-designed*

[**🎨 Build a consistent API that follows your team's standards**](#build-a-consistent-api-that-follows-your-teams-standards)  ← *raise the quality of your API*

## Document your existing APIs in minutes 
Use real API traffic to write your initial OpenAPI specification and correctly patch the spec whenever an API changes. 

1. Use the CLI to magicly capture traffic `optic oas capture https://api.github.com` OR provide a HAR (HTTP Archive format). 
2. Then run `optic oas verify` to see a list of "Undocumented" endpoints. Optic is your API version control tool, like git for APIs. "Undocumented" endpoints are "Untracked" files in git. 
3. Add operations one at a time or pass `--document all`

**[Read Full Documentation](https://www.useoptic.com/docs/document-existing-api)**


https://user-images.githubusercontent.com/5900338/210244068-22540288-1f6d-46a7-a2e9-5b3d19a00f31.mp4

**[Read Full Documentation](https://www.useoptic.com/docs/document-existing-api)**

## Prevent breaking changes with API diffs

Breaking changes ruin your API consumer's days. Optic prevents breaking changes from reaching production with `diff` -- an accurate and robust OpenAPI diff tool that is built to work within Git workflows, and has full support for OpenAPI 3.0 3.1 and `$ref`, and complex types like `oneOf/allOf/anyOf`. 

```bash
optic diff openapi.yaml --base main --check
```

**[Read Full Documentation](https://www.useoptic.com/docs/diff-openapi)**

https://user-images.githubusercontent.com/5900338/211033179-86d5021f-17d1-4391-afc9-77689aa5882f.mp4

**[Read Full Documentation](https://www.useoptic.com/docs/diff-openapi)**


## Verify your API is working-as-designed

## Build a consistent API that follows your team's standards
