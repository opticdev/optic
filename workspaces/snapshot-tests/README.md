# Automatic Snapshot Tests
## What is this?
Data in Optic goes through many layers of transformation. For examples:
- Commands yield Events
- Projections consume Events
- Aggregates consume Events
- Diffs consume Aggregates and Interactions
- Reports consume Aggregates and Interactions
- DiffDescriptions consume Diffs and Interactions
- DiffInterpretations consume Diffs and Interactions

Commands, Events, and Interactions are the root input of this dependency hierarchy. Each of these transformations is pure, so we should be able to take a set of inputs and run it through the pipeline and the outputs should never change. 

This project encapsulates organizing all the inputs we care about and snapshots of the expected outputs, and code to run Optic's code against the inputs and compare the results against the snapshots.

## How do I add more scenarios?
The inputs to the system are Events and Interactions. Events are JSON arrays. Interactions are JSON arrays. You can get them from dumping the UI state or hitting the Local CLI daemon's API.

Once you have a file of Events and a file of Interactions, choose a distinct name `MY_UNIVERSE` to represent each one

Create subdirectories `inputs/events/MY_UNIVERSE` and `inputs/interactions/MY_UNIVERSE`


## How do I run the tests? 
```
$ yarn install
$ yarn run ws:build
$ yarn run ws:test
```

## How do I add more tests?
TBD
