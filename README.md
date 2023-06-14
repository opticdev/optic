# Optic ![GitHub Repo stars](https://img.shields.io/github/stars/opticdev/optic?style=social) ![GitHub contributors](https://img.shields.io/github/contributors-anon/opticdev/optic?style=social) ![npm](https://img.shields.io/npm/dm/@useoptic/openapi-io?style=social) ![license](https://img.shields.io/github/license/opticdev/optic?style=social)
---

Optic helps you ship a better API by making OpenAPI easy to use. Prevent breaking changes, publish accurate documentation and improve your the design of your API. 

**Install**
```bash
npm install -g @useoptic/optic
```

### Prevent breaking changes using `optic diff`
Optic can detect breaking changes between any two versions of an OpenAPI specification. Reference the versions using Git tags and branch names:

**Compares the HEAD to the `main` branch
```
optic diff openapi.yml --base main --check
```
**Compares two branches by name
```
optic diff feature/example:openapi.yml develop:main --check
```





### License
Optic is MIT Licensed 

### Telemetry
Optic collects telemetry which is used to help understand how to improve the product. For example, this usage data helps to debug issues and to prioritize features and improvements based on usage. The usage of our telemetry data falls under our [privacy policy](https://www.useoptic.com/privacy-policy). While this information does help us build a great product, we understand that not everyone wants to share their usage data. If you would like to disable telemetry you can add an environment variable that will opt out of sending usage data:

`OPTIC_TELEMETRY_LEVEL=off` - disables telemetry (both usage, and error reporting)
`OPTIC_TELEMETRY_LEVEL=error` - disables telemetry (only usage data is sent)
