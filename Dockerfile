FROM alpine:latest
ARG OPTIC_CLI_VERSION=latest
ENV INSTALLATION_METHOD="docker"
RUN addgroup -S optic && \
    adduser -S optic -G optic && \
    apk --no-cache add git curl && \
    echo "optic-docker" > /etc/machine-id
RUN set -e; sh -c "$(curl -s --location https://install.useoptic.com/install.sh)" -- $OPTIC_CLI_VERSION /usr/local/bin

USER optic
ENTRYPOINT ["/usr/local/bin/optic"]
