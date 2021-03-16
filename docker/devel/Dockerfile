FROM 513974440343.dkr.ecr.us-east-1.amazonaws.com/nodejs-base:latest

RUN apk --no-cache add \
    bash curl wget jq git openssh-client \
    # linux build deps
    musl-dev gcc \
    # windows build deps
    mingw-w64-gcc

RUN sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin

USER appuser

# rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH=/home/appuser/.cargo/bin:$PATH

# .profile isn't sourced if you exec a shell, so we copy to .bashrc
RUN cp $HOME/.profile $HOME/.bashrc

# hack for,
# https://github.com/EverlastingBugstopper/binary-install/issues/3
# once wasm-pack updates to a more recent binary-install package we
# should be able to drop this.
RUN mkdir -p $HOME/.config/wasm-pack-nodejs/bin
