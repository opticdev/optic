FROM alpine:latest

ARG OPTIC_CLI_VERSION=latest

RUN apk --no-cache add git curl
RUN echo "optic-docker" > /etc/machine-id
RUN sh -c "$(curl -s --location https://install.useoptic.com/install.sh)" -- $OPTIC_CLI_VERSION /usr/local/bin

ENTRYPOINT ["/usr/local/bin/optic"]
