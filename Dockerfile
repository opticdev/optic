FROM docker.io/library/node:lts-alpine

ARG OPTIC_CLI_VERSION=latest

RUN apk add git
RUN echo "optic-docker" > /etc/machine-id
RUN mkdir -p /usr/local/sbin && ln -s /usr/local/bin/node /usr/local/sbin/node
RUN npm install -g @useoptic/optic@$OPTIC_CLI_VERSION

ENTRYPOINT ["/usr/local/bin/optic"]
