# This container can be attached to various docker networks to sniff traffic and
# create the OpenAPI spec.
# There are 3 environment values, set with -e for docker run to customize with:
#   SNIFF_PORT: The port to sniff. This is the internal port of the container,
#       not the host-side value (e.g. 80 for a --expose 8000:80).
#   SNIFF_INTERFACE: The interface to sniff. In containers, this is almost
#       always eth0.
#   OPTIC_OPENAPI_PATH: The in-container path for the OpenAPI spec. The
#      directory that contains this needs to be mounted with a --mount.
#
# Example:
#   docker run -it -e SNIFF_PORT=80 -e SNIFF_INTERFACE=any \
#     --network=container:4dd7916f077e \
#     --mount type=bind,source=`pwd`,target=/out \
#     baseline:latest
#
# where --network=container:4dd7916f077e uses the container ID from docker ps

# This image builds the npm pcap binding, and includes all the compile dependencies
FROM node:14-alpine as build

RUN apk --no-cache --update upgrade && \
    apk add --no-cache curl ca-certificates \
        python3 build-base make gcc g++ musl-dev libpcap-dev

# install dumb-init in the build stage to keep the next stage clean
ENV DUMB_INIT_CHECKSUM=e874b55f3279ca41415d290c512a7ba9d08f98041b28ae7c2acb19a545f1c4df \
    DUMB_INIT_URL=https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64

RUN curl -LOs "${DUMB_INIT_URL}" && \
    echo "${DUMB_INIT_CHECKSUM}  dumb-init_1.2.5_x86_64" | sha256sum -c - && \
    mv dumb-init_1.2.5_x86_64 /usr/local/bin/dumb-init && \
    chmod +x /usr/local/bin/dumb-init

ENV NODE_ENV=production
# --unsafe-perm is needed because we are installing as root. Without it, we get a
#   #5 23.78 gyp WARN EACCES current user ("nobody") does not have permission to access the dev dir "/root/.cache/node-gyp/14.18.1"
# error. When running as user node we get 
#   #6 20.47 npm ERR! Error: EACCES: permission denied, symlink '../lib/node_modules/@useoptic/openapi-diff/build/cli/index.js' -> '/usr/local/bin/optic'
RUN npm install -g @useoptic/openapi-diff --unsafe-perm

# This is the released image. It should stay as small as possible.
FROM node:14-alpine

RUN apk add --no-cache libpcap

ENV NODE_ENV=production
# --unsafe-perm is needed because we are installing as root. Without it, we get a
#   #5 23.78 gyp WARN EACCES current user ("nobody") does not have permission to access the dev dir "/root/.cache/node-gyp/14.18.1"
# error. When running as user node we get 
#   #6 20.47 npm ERR! Error: EACCES: permission denied, symlink '../lib/node_modules/@useoptic/openapi-diff/build/cli/index.js' -> '/usr/local/bin/optic'
# --ignore-scripts suppresses the pcap package C++ build, which relies on all
# the extra stuff we installed in the build image. We copy over the built
# node_modules directory.
RUN npm install -g @useoptic/openapi-diff --unsafe-perm --ignore-scripts
COPY --from=build /usr/local/lib/node_modules/@useoptic/openapi-diff/node_modules/pcap /usr/local/lib/node_modules/@useoptic/openapi-diff/node_modules/pcap

COPY --from=build /usr/local/bin/dumb-init /usr/local/bin/

# The user is already root in this image, but it's worth highlighting that
# sniffing is a privileged behaviour. Outside a container, you would need to be
# root, have CAP_NET_RAW and CAP_NET_ADMIN, or CAP_SYS_ADMIN (CAP_BPF on kernel
# 5.8+) to do this.
# See https://man7.org/linux/man-pages/man7/capabilities.7.html for some
# background (this may vary based on distro).
USER root
ENV SNIFF_PORT=80
ENV SNIFF_INTERFACE=eth0
ENV OPTIC_OPENAPI_PATH=/out/optic.openapi.yaml
ENTRYPOINT ["dumb-init", "--"]
CMD ["/bin/sh", "-c", "exec optic baseline --sniff-port ${SNIFF_PORT} --sniff-interface ${SNIFF_INTERFACE} ${OPTIC_OPENAPI_PATH}"]