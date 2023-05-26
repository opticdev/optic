![Optic Logo](https://www.useoptic.com/logo.svg)

# Quick Reference

Maintained by:
[The Optic team](https://github.com/opticdev/optic)

Where to file issues:
[github.com/useoptic/optic/issues](https://github.com/opticdev/optic/issues)

# What is Optic?

Optic makes it easy to Track and Review all your API changes before they get released. Start working API-first and ship better APIs, faster.

# How to use this image

This image is a thin wrapper around the Optic CLI. It supports the same functions and commands as the [NPM package](https://www.npmjs.com/package/@useoptic/optic). For commands that interact with your files locally, you'll need to mount your Git repo to the container.

For example, to run `optic diff` your command would look something like this:

```
docker run --rm -it \
  --volume=$HOME/code/optic-test:/repo \
  --workdir /repo \
  docker.io/useoptic/optic:latest \
  diff ./petstore.yml
```
