openapi-diff provides a simple way to generate an OpenAPI spec from captured
traffic. It sniffs network traffic to generate the spec but does not store the
data itself.

## Docker Container Usage

The simplest use-case is to attach to a running docker container and observe its
traffic. After [Building the container image](#Building-the-container-image), run:

```
docker run -it -e SNIFF_PORT=80 -e SNIFF_INTERFACE=any \
  --network=container:4dd7916f077e \
  --mount type=bind,source=`pwd`,target=/out \
  optic-baseline:local
```

where --network=container:4dd7916f077e uses the container ID from `docker ps` of
the target container.

There are 3 environment values, set with -e on the `docker run` command:

- `SNIFF_PORT`: The port to sniff. This is the internal port of the container,
not the host-side value (e.g. 80 for a --expose 8000:80).
    
- `SNIFF_INTERFACE`: The interface to sniff. In containers, this is almost
always eth0.

- `OPTIC_OPENAPI_PATH`: The in-container path for the OpenAPI spec. The
directory that contains this needs to be mounted with `--mount`.

### Attaching and Detaching from a running container

You can start the container with the `-d/--detach` option so that it continues
running in the background without a terminal attached. It is also possible to
detach from a container with CTRL-P CTRL-Q.

Attach to a detached container with

```
docker attach <id of container from docker ps>
```

where the container ID is the first column of the `docker ps` output.

## NPM Package Usage

The package install provides an optic CLI tool with the baseline command. 

```
optic baseline /path/to/openapi/file
```

This can be further configured with

`--sniff-port`: The port on which to sniff. The default is `80`.

`--sniff-interface`: The interface to sniff. This can be `any` for all
interfaces. The default is `eth0`.

### Install

The simplest way to install is from the release package:

```
npm install -g @useoptic/openapi-diff
```

## Developer Usage

If you wish to develop against the code here or simply run it directly from
source. Clone the repository and at the repository root run

```
task postpull
```

This will install all needed dependencies within npm. It will not install
libpcap!

### `libpcap`

optic baseline uses `libpcap` to capture traffic, similar to tools such as
tcpdump and wireshark. This library is provided at the system level and must be
installed manually. The npm pcap package will compile against the development
version of libpcap. This can be a different package than the production
`libpcap` in some cases.

- __MacOS__: `libpcap` is installed by default.
- __Ubuntu/Debian Linux__: `apt install libpcap-dev` will install the correct bindings.
- __Alpine Linux__: `apk add libpcap-dev` will install the correct bindings.

Note: Refer to the Dockerfile for an example of repackaging to use only the
production `libpcap`.

### Running the development clone

The source is in typescript, which needs to be compiled to javascript. You can
build directly with

```
yarn build
```

Alternatively, you can use ts-node to more simply invoke the code:

```
sudo ts-node src/cli/index.ts baseline openapi.yaml --sniff-port 3001 --sniff-interface lo0
```

## Building the container image

Run `task openapi-diff:docker:build` to build a container. The task will build a container image `optic-baseline` with tag `local`. You can also manually build the container without using task with `docker build optic-baseline:local .`

## Tests

### Manual Test

To test against a development build or to check that things are working as
expected, use the `httpbin` container image as an echo server and run the
baseline container.

```
$ docker run -d  -p 127.0.0.1:8000:80 kennethreitz/httpbin
5ffd48c7f1549aba47314f149be392510ed8dbba833d138ee20cc9a75b24dc50

$ docker ps
CONTAINER ID   IMAGE                  COMMAND                  CREATED         STATUS         PORTS                    NAMES
5ffd48c7f154   kennethreitz/httpbin   "gunicorn -b 0.0.0.0…"   4 seconds ago   Up 3 seconds   127.0.0.1:8000->80/tcp   strange_curie

 docker run -it -e SNIFF_PORT=80  --network=container:5ffd48c7f154 --mount type=bind,source=`pwd`,target=/out public.ecr.aws/optic/baseline:latest public.ecr.aws/optic/baseline
↪ reading specification from out/optic.openapi.yaml
   Diff   GET /get                                                                             200 response
```
You will see the `Diff GET` line if you issue a request with `curl 127.0.0.1:8000/get`. An `optic.openapi.yaml` is created in the local directory.


### Automated Tests

Coming Soon! You can run the (failing) tests with

```
sudo yarn dev:test
```

Root is required for sniffing.
