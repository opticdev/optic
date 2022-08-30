FROM docker.io/library/node:lts-alpine

ARG OPTIC_CLI_VERSION=latest

RUN apk add git
RUN echo "optic-docker" > /etc/machine-id
RUN npm install -g @useoptic/optic --tag=$OPTIC_CLI_VERSION

ENTRYPOINT ["/usr/local/bin/optic"]
