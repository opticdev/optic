# optic - Containerized Optic

## Build

`task -l | grep docker` for build tasks and descriptions

## Run

Mount the desired repo to `/repo` and ensure you set the workdir accordingly. For example to run a diff,

```
➜ docker run --rm --volume=$HOME/code/optic-test:/repo --workdir /repo -it docker.io/useoptic/doptic:local optic diff ./petstore.yml
```

## Publishing

See `task docker:build:release --summary` for details.
