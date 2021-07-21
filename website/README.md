# Website

This website is built using [Docusaurus 2](https://v2.docusaurus.io/), a modern static website generator.

## Installation

```console
yarn install
```

## Local Development

```console
yarn start
```

This command starts a local development server and open up a browser window. Most changes are reflected live without having to restart the server.

## Build

```console
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

The website builds and deploys with GitHub Actions. The following scenarios should trigger deployments,

### Deploy to _staging_
1. Pushes received on a PR,
    1. Opened against the 'develop' branch, and
    1. The pushes contain modifications to `website/**` files

### Deploy to _production_
Modifications to `website/**` files are merged into the 'develop' or 'release' branches.

See [.github/workflows/website.yml](.github/workflows/website.yml) for all the details.
