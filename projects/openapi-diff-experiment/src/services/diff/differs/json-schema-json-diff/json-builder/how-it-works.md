## Why a streaming JSON schema builder?

In previous versions of Optic, we had to collect every example of a JSON body (sometimes observed in the range of 10^2 to 10^4) pieces of sampled traffic in order to guarantee that we saw and documented every possible variant

- did we mark every optional fields optional
- did we find the nullables
- did we find polymorphism? In objects? In array items?

Our previous implementation required a full set traffic at the time of computing the new schema, so we either...

- kept it in memory (expensive)
- saved it to disk (big and slow)
- or shipped it to s3 (lots of network both ways)

And since we had a lot of traffic, things got slow, really slow and performance mattered a lot more -- processing 1 GB of example JSON to compute a schema is a different problem than processing one schema at a time, at the point of capture.

### Changing the shape of the problem

Instead of needing all the traffic captured to become available to the same process for leaning (a clear computational bottleneck), imagine a streaming json builder that:

- had an initial schema
- compared each new example it saw with that schema
- take any diffs -> computed patches, and selected only the patch that "extends" the schema
- apply patch -> updates the initial schema
- ...waits for next example

Imagine a schema, and it's example

| Current Schema                                                                       | Example          |
| ------------------------------------------------------------------------------------ | ---------------- |
| {}                                                                                   | {}               |
| {type: object}                                                                       | {hello: "world"} |
| {type: object, required: ["hello"], properties:{hello: type:{string}}}               | {age: 25}        |
| {type: object, required: [], properties:{hello: {type:string}, age: {type: number}}} |                  |

### Benefits

- Streamable, and no memory / file / network bottlenecks. Keep the schema in memory, and stream the examples through it
- Can find all the polymorphic variants incrementally
- (subtle one) the old way required its own logic to build a schema from scratch and test to make sure the schema we built did not produce diffs with the traffic it was built from.
  - This approach reuses the knowledge, logic and capabilities of the diff/patching system
  - We "know it works" because it goes until it runs out of diffs.

### Tradeoffs

- Is only as good as the diff engine.
- Needs some guards against infinite loops. You could imagine it picking the patch to remove a field, then add it again, then remove it again. Only certain kinds of patches are valid for this use case, and if they don't apply properly you can end up in a loop.
