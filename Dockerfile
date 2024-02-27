# Doing the intial installation of Optic and Spectral separately
# saves a bit of space in the final image--Probably due to temp
# file creation.
FROM alpine:latest as dl
ARG OPTIC_CLI_VERSION=latest
RUN apk --no-cache add curl
# install Optic
RUN set -e; sh -c "$(curl -s --location https://install.useoptic.com/install.sh)" -- $OPTIC_CLI_VERSION /usr/local/bin
# install Spectral
RUN curl -L https://raw.github.com/stoplightio/spectral/master/scripts/install.sh | sh

FROM alpine:latest
ENV INSTALLATION_METHOD="docker"
RUN addgroup -S optic && \
    adduser -S optic -G optic && \
    apk --no-cache add git curl && \
    echo "optic-docker" > /etc/machine-id

COPY --from=dl /usr/local/bin/optic /usr/local/bin/
COPY --from=dl /usr/local/bin/spectral /usr/local/bin/

USER optic
ENTRYPOINT ["/usr/local/bin/optic"]
