## Optic CI

Optic CI helps you review OpenAPI specs and enforce API standards. Sign up on [app.useoptic.com](https://app.useoptic.com) to get a token and get started.

## Setup in CI

### GitHub Actions

Optic comes with a GitHub Action for easy setup and configuration. The Optic GitHub Action can be configured in your `.github/workflows/optic.yml` file. An example snippet is listed below.

```yml
name: Optic

on: [pull_request]

jobs:
  optic-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: optic run
        uses: opticdev/github-action@v1
        with:
          token: ${{ secrets.OPTIC_TOKEN }} # You will need to connect up your secret here
          base: ${{ github.event.pull_request.base.ref }}
```
