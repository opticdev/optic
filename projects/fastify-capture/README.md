# Fastify capture
Capture your Fastify test traffic to `.har` HTTP archive files.


## Installation
```
yarn add @useoptic/fastify-capture
npm install @useoptic/fastify-capture
```


## Setup
``` Typescript
import { fastifyCapture } form '@useoptic/fastify-capture'

if (env === 'test') {
  fastify.addHook('onSend', fastifyCapture({
    harOutputDir: 'har-capture'
  }));
}
```

## Usage
The `optic` CLI uses the captured `.har` files to measure how much of your OpenAPI specification is covered by your tests 🪄

Learn more about capture and coverage in [Optic's documentation](https://www.useoptic.com/docs).
