# Optic domain building blocks for Typescript and Javascript

While the most core of Optic's business logic lives as part of the Optic Engine, this package provides the tools to work with the engine's inputs and outputs in Typescript and Javascript. It provides common building blocks like:

- **Typescript types (e.g. `IHttpInteraction`)** to remain concise about the single inputs and ouputs provided by the Optic Engine.
- **Collection streams / stream operators (e.g. `DiffResults`)** for consistent handling of multiple inputs or outputs (streams, arrays, maps, etc.) in Optic specific ways (e.g. `DiffResults.normalize`).
- **Async toolbelt**, based on [axax](https://github.com/jamiemccrindle/axax#readme), providing generic operators for working with collections (streams, arrays, etc.).

## Usage

All types are exposed on the root import, allowing:

```ts
import { IHttpInteraction } from '@useoptic/optic-domain';

// alternatively, to get all interfaces
import { Types } from '@useoptic/optic-domain';

// Types.IHttpInteraction
```

All stream operators are exposed per type of stream on the root import, allowing:

```ts
import { DiffResults } from '@useoptic/optic-domain';

const normalizedDiffs = DiffResults.normalize();

// alternatively, to get all streams
import { Streams } from '@useoptic/optic-domain';

// Streams.DiffResults
```

The Async toolbelt, re-exporting [all of Axax's API](https://github.com/jamiemccrindle/axax/blob/master/docs/API.md) and implementing some more operators on top, can be used through:

```ts
import { AsyncTools } from '@useoptic/optic-domain';

// Hot tip: renaming the import to AT can make the use of many operators shorter,
// while also easier to spot!
import { AsyncTools as AT } from '@useoptic/optic-domain';
```
