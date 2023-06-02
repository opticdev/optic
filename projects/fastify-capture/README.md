# Fastify capture
Capture your Fastify test traffic to `.har` HTTP archive files.


## Installation
```
yarn add @useoptic/fastify-capture
npm install @useoptic/fastify-capture
```


## Setup
``` Typescript
// app.ts

import { fastifyCapture } form '@useoptic/fastify-capture'

const app = Fastify({...})

if (env === 'test') {
  app.addHook('onSend', fastifyCapture({
    harOutputDir: 'har-capture'
  }));
}
```

## Usage
Use the captured `har` files to generate test coverage from your OpenAPI specifications with the `optic` CLI 🪄

Learn more about this in [Optic documentation](https://www.useoptic.com/docs).
