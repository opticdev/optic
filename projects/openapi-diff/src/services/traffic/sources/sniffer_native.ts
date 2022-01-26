import stream from 'stream';

import {
  PcapSession,
  TCPTracker,
  TCPSession,
  createSession,
  decode,
} from 'pcap';
import { HTTPParser, HTTPParserJS } from 'http-parser-js';
import zlib from 'zlib';

import { TrafficSource } from '../types';
import { OpticHttpInteraction } from '../traffic/optic-http-interaction';

export type SnifferNativeConfig = {
  interface: string;
  port: number;
};

export class SnifferNativeSource extends TrafficSource {
  private pcapSession: PcapSession;
  private tracker: any;
  private sessions: typeof TCPSession;

  constructor(private config: SnifferNativeConfig) {
    super();

    this.sessions = {};

    // See the track_packetIPv6 implementation for more details on how we use
    // this.
    this.tracker = new TCPTracker();
    this.tracker.track_packet = track_packetIPv6.bind(this.tracker);

    this.tracker.on('session', async (session: any) => {
      //console.log("session");
      // Initialise a Simulation, passing a callback to emit HTTPInteractions
      // when they are complete.
      // Note: This is a "lightweight" operation since we need to wire up the
      // session's events quickly to avoid missing data
      session.sim = new Simulation(this.emitTraffic.bind(this));
      let endPromise = this.wireSession(session, session.sim);
      // Replay the session as it happens, "simulating" it.
      this.simulateSession(session, endPromise);
    });
  }

  start(): Promise<void> {
    //console.log("start");

    let options = { filter: `tcp and port ${this.config.port}` };
    this.pcapSession = createSession(this.config.interface, options);

    // listen for packets, decode them, and feed TCP to the tracker. The tracker
    // then emits TCPSessions.
    this.pcapSession.on('packet', (raw_packet: any) => {
      //console.log("saw packet");
      var packet = decode.packet(raw_packet);
      this.tracker.track_packet(packet);
    });

    return Promise.resolve(undefined);
  }

  stop(): Promise<void> {
    //console.log("stop");
    this.pcapSession.close();

    return Promise.resolve(undefined);
  }

  // Wire up the session to store both the client connection and the backend's
  // client data in the Simulation
  wireSession(session: typeof TCPSession, sim: Simulation): Promise<void> {
    session.track_id = `${session.src}->${session.dst}`;
    this.sessions[session.track_id] = session;

    //console.log(`Simulating session ${this.sessionCount}: ${session.track_id}`);

    //console.log(`Wiring up session`);
    session.on('start', async (session: any) => {
      //console.log("Start of TCP session between " + session.src + " and " + session.dst);
    });

    session.on('data send', (session: any, data: any) => {
      //console.error('data send');
      //console.log("data send: " + data);

      // We need to copy because the internal buffer is re-used.
      let copy = Uint8Array.prototype.slice.call(data);
      sim.storeRequestBytes(copy);
    });

    session.on('data recv', (session: any, data: any) => {
      //console.error('data recv');
      //console.log("data recv`: " + data);

      // We need to copy because the internal buffer is re-used.
      let copy = Uint8Array.prototype.slice.call(data);
      sim.storeResponseBytes(copy);
    });

    //console.log(`session ${session.track_id} wired`);
    return new Promise<void>((resolve, reject) => {
      session
        .on('error', (e: any) => {
          let msg = `Error while wiring up simulation: ${e}`;
          console.error(msg);
          reject(msg);
        })
        .on('end', (session: any) => {
          //console.log(`End of TCP session between ${session.src} and ${session.dst}`);
          resolve(null);
        });
    });
  }

  // Replay stored sesssion data, attaching a callback to end once the simulation ends.
  // Note: The Simulation has a callback to emit a traffic event when we have a
  // full request/response pair at construction.
  async simulateSession(
    session: typeof TCPSession,
    sessionEndPromise: Promise<void>
  ) {
    try {
      await session.sim.run(sessionEndPromise);
      await sessionEndPromise;
      delete this.sessions[session.track_id];
    } catch (e: any) {
      console.error(`Error in simulation: ${e}\n${e.stack}`);
    }
  }
}

// Simulate/replay captured traffic through a proxy instance.
// This runs the data sent by the client and the data returned by the server
// through separate http-parser-js instances. Pipelined requests will trigger
// separate emitTraffic callbacks as soon as the request/response pairs are
// complete. While .run is called, the parsers parse as soon as data is written
// to the requestStream or responseStream.
// Note: The timing between request and response streams isn't retained and it
// is assumed that requests and responses pair up in order. This may become an
// issue with trailers or if we ever handle HTTP push protocols (like spdy or
// HTTP2).
class Simulation {
  // The global counter for simulations, so that they have a unique number in
  // sessionNumber
  static simCount = 0;

  // A unique identifier for the Simulation. Used for debug
  private simNumber: number;

  // Bytes sent by the client to the server in the session. This can be multiple
  // requests and it is piped so that the parser is always reading. This allows
  // us to emitTraffic as each request/response pair is complete and not at the
  // end of a long multi-request session.
  private requestStream: stream.Duplex;

  // Bytes returned by the server to the client's requests
  private responseStream: stream.Duplex;

  // An http-parser-js instance configured to parse requests
  private request_parser: HTTPParserJS;

  // An http-parser-js instance configured to parse responses
  private response_parser: HTTPParserJS;

  // parsed HTTP requests stored in the order they were sent
  private requests: HTTPRequest[];

  // parsed HTTP responses stored in the order they were sent
  private responses: HTTPResponse[];

  // The next index to emit from .requests and .responses
  // Note: We assume requests and responses pair up in order
  private nextEmittedIdx: number;

  // The callback to emit a completed request/response pair as an
  // HTTPInteraction
  private emitTraffic: { (interaction: any): void };

  constructor(emitTraffic: { (interaction: any): void }) {
    this.simNumber = ++Simulation.simCount;
    //console.log(`Simulation ${this.simNumber} constructing`)

    this.request_parser = new HTTPParser(HTTPParser.REQUEST);
    this.response_parser = new HTTPParser(HTTPParser.RESPONSE);

    this.requestStream = new stream.PassThrough();
    this.requestStream.on('error', function (e) {
      console.error(`Error in requestStream: ${e}`);
    });

    this.responseStream = new stream.PassThrough();
    this.responseStream.on('error', function (e) {
      console.error(`Error in responseStream: ${e}`);
    });

    this.requests = [];
    this.responses = [];
    this.nextEmittedIdx = 0;
    this.emitTraffic = emitTraffic;

    // Initialize the first entries in the .requests and .responses arrays
    this.newRequest();
    this.newResponse();

    this.prepareSimulation();
  }

  // prepareSimulation connects request/response parser callbacks to functions
  // on Simulations (http-parser-js doesn't do events but direct functions on
  // itself).
  public async prepareSimulation() {
    let self = this;
    this.request_parser.onHeaders = function (headers, url) {
      self.on_req_headers(headers, url);
    };
    this.request_parser.onHeadersComplete = function (info): number {
      self.on_req_headers_complete(info);
      return 0; // FIXME: this return is skipBody in http-parser-js
    };
    this.request_parser.onBody = function (buf, start, len) {
      self.on_req_body(buf, start, len);
    };
    this.request_parser.onMessageComplete = function () {
      //console.log(`HTTP request complete`);
      self.on_req_complete();
    };
    this.response_parser.onHeaders = function (headers) {
      self.on_res_headers(headers);
    };
    this.response_parser.onHeadersComplete = function (info): number {
      self.on_res_headers_complete(info);
      return 0; // FIXME: this return is skipBody in http-parser-js
    };
    this.response_parser.onBody = function (buf, start, len) {
      self.on_res_body(buf, start, len);
    };
    this.response_parser.onMessageComplete = function () {
      //console.log(`HTTP response complete`);
      self.on_res_complete();
    };
  }

  // run replays traffic stored with `storeRequestBytes` and `storeResponseBytes`
  // Note: It is important to only pipe requestStream to requestConn after the
  // proxy and backend server are both setup. i.e. Don't pipe in the connect
  // callback for requestConn.
  // Note: Assumes setupSimulation has already been called to put data into
  // .request/responseStream
  public async run(sessionEndPromise: Promise<void>) {
    this.requestStream.on('data', (chunk: any) => {
      this.request_parser.execute(chunk);
    });
    this.responseStream.on('data', (chunk: any) => {
      this.response_parser.execute(chunk);
    });

    let requestEndPromise = new Promise((resolve, reject) => {
      this.requestStream.once('finish', () => {
        this.requestStream.removeAllListeners();
        resolve(null);
      });
      this.requestStream.once('error', (e) => {
        this.requestStream.removeAllListeners();

        let msg = `Error in requestStream ${e}`;
        console.error(msg);
        reject(msg);
      });
    });

    let responseEndPromise = new Promise((resolve, reject) => {
      this.responseStream.once('finish', () => {
        this.responseStream.removeAllListeners();

        // Note: We have this special handling that forces a final interaction
        // to emit if it is pending. This can happen if we stopped writing
        // response data due to backpressure or if the connection we sniff
        // behaves funny and the parser doesn't think the HTTP message has ended
        // (this seems to happen when testing with `ab`).
        let idx = this.nextEmittedIdx;
        let request = this.requests[idx];
        let response = this.responses[idx];
        if (idx == 0 && request.method && response.status_code) {
          this.emitHTTPPair();
        }

        resolve(null);
      });
      this.responseStream.once('error', (e) => {
        this.responseStream.removeAllListeners();

        let msg = `Error in responseStream ${e}`;
        console.error(msg);
        reject(msg);
      });
    });

    //console.log('starting session wait')
    await Promise.allSettled([
      sessionEndPromise.finally(this.endSimulation.bind(this)),
      requestEndPromise.catch((reason: any) => {
        console.error(
          `Error while waiting for request data processing to end: ${reason}`
        );
      }),
      responseEndPromise.catch((reason: any) => {
        console.error(
          `Error while waiting for response data processing to end: ${reason}`
        );
      }),
    ]);
    //console.log('ended session wait')
  }

  // endSimulation reflects that we should begin shutting down. This doesn't
  // stop processing, however. That is left for the `finish` stream callbacks.
  // This call closes the streams to trigger any final processing.
 public async endSimulation() {
    this.requestStream.end();
    this.responseStream.end();
  }

  public async emitHTTPPair() {
    let idx = this.nextEmittedIdx++;
    //console.log(`emitting req/resp pair ${idx}`);

    let request = this.requests[idx];
    let requestBody = request.getBody();
    let response = this.responses[idx];
    let responseBody = response.getBody();

    //console.log(`req headers ${JSON.stringify(request.headers)}`);
    //console.log(`resp headers ${JSON.stringify(response.headers)}`);

    //console.log(`HTTP Request\n${JSON.stringify(request)}`);
    //console.log(`HTTP Request Body\n${request.getBody()}`);
    //console.log(`HTTP Response\n${JSON.stringify(response)}`);
    //console.log(`HTTP Response Body\n${responseBody}`);

    // Split up the reported `req.url`
    let path, query;
    try {
      let host = request.get_header('host');
      let url = new URL(request.url, `http://${host}`);
      path = url.pathname;
      query = url.search.slice(1); // strip leading `?`
    } finally {
    }

    let reqContentType = request.get_header('content-type'),
      reqBody = undefined;
    if (reqContentType) {
      try {
        JSON.parse(requestBody.toString());
        reqBody = requestBody.toString();
      } catch {}
    }

    let resContentType = response.get_header('content-type'),
      resBody = undefined;
    try {
      // Check that this is a JSON string
      JSON.parse(responseBody.toString());
      resBody = responseBody.toString();
      //console.log(`Response body is JSON`);
      //console.log(`response: ${resBody}`);
    } catch (e) {
      resContentType = undefined; // We rely on this to indicate empty bodies
    }

    let interaction: OpticHttpInteraction;
    try {
      // Success! emit an interaction
      interaction = new OpticHttpInteraction({
        request: {
          method: request.method,
          path: path,
          query: { asText: query },
          body: {
            contentType: reqContentType,
            value: { asJsonString: reqBody },
          },
        },
        response: {
          statusCode: response.status_code.toString(),
          body: {
            contentType: resContentType,
            value: { asJsonString: resBody },
          },
        },
      });
    } catch (e) {
      console.error(`Error constructing HTTPInteraction ${e}`);
    }

    try {
      //console.log(`emitTraffic ${idx}: ${JSON.stringify(interaction)}`);
      this.emitTraffic(interaction);
    } catch (e) {
      console.error(
        `Error emitting HTTPInteraction ${e}\n${JSON.stringify(interaction)}`
      );
    }
  }

  // storeRequestBytes retains data seen from the client to the server in the
  // session. This can be multiple HTTP requests.
  // Note: No copy is made. If the buffer is re-used then copy it before passing
  // it in.
  public async storeRequestBytes(data: Uint8Array) {
    this.requestStream.write(data);
  }

  // getRequest returns a reference to the latest request object. This is the
  // next to be emitted and may be incomplete until then.
  private getRequest(): HTTPRequest {
    return this.requests[this.requests.length - 1];
  }

  // newRequest creates a new latest HTTPRequest object. It is assumed that the
  // previous latest has been emitted already.
  private newRequest(): HTTPRequest {
    this.requests.push(new HTTPRequest());
    return this.getRequest();
  }

  // storeResponseBytes retains data seen from the server to the client in the
  // session. This can be multiple HTTP responses.
  // Note: No copy is made. If the buffer is re-used then copy it before passing
  // it in.
  public async storeResponseBytes(data: Uint8Array) {
    // This happens with IPv6 because?
    if (data.length == 0) {
      return;
    }

    this.responseStream.write(data);
    //console.log(`storeResponseBytes end`);
  }

  // getResponse returns a reference to the latest response object. This is the
  // next to be emitted and may be incomplete until then.
  private getResponse(): HTTPResponse {
    return this.responses[this.responses.length - 1];
  }

  // newResponsee creates a new latest HTTPResponse object. It is assumed that
  // the previous latest has been emitted already.
  private newResponse(): HTTPResponse {
    this.responses.push(new HTTPResponse());
    return this.getResponse();
  }

  private on_req_headers(headers: any, url: any) {
    let request = this.getRequest();
    request.headers = (request.headers || []).concat(headers);
    request.url += url;
  }

  private on_req_headers_complete(info: any) {
    //console.log(`on_req_headers_complete`);

    let request = this.getRequest();

    request.method = info.method;
    request.url = info.url || request.url;
    request.http_version = info.versionMajor + '.' + info.versionMinor;

    var headers = info.headers || request.headers;
    for (var i = 0; i < headers.length; i += 2) {
      request.headers[headers[i]] = headers[i + 1];
    }
  }

  private on_req_body(buf: Buffer, start: number, len: number) {
    let request = this.getRequest();
    request.body_len += len;
    request.storeBodyBytes(buf.slice(start, start + len));
  }

  private on_req_complete() {
    //console.log(`http request complete`);
    this.newRequest();
  }

  private on_res_headers(headers: any) {
    let response = this.getResponse();

    response.headers = (response.headers || []).concat(headers);
  }

  private on_res_headers_complete(info: any) {
    //console.log(`http response headers complete`);

    let response = this.getResponse();

    response.status_code = info.statusCode;
    response.http_version = info.versionMajor + '.' + info.versionMinor;

    var headers = info.headers || response.headers;
    for (var i = 0; i < headers.length; i += 2) {
      response.headers[headers[i]] = headers[i + 1];
    }
  }

  private on_res_body(buf: any, start: any, len: any) {
    let response = this.getResponse();

    response.body_len += len;
    response.storeBodyBytes(buf.slice(start, start + len));
    //this.response.body.write(buf.slice(start, start + len));
  }

  private on_res_complete() {
    //console.log(`http response complete`);
    this.newResponse();

    this.emitHTTPPair();
  }
}

// Util functions

async function waitFor(millis: number) {
  return await new Promise((resolve) => {
    setTimeout(resolve, millis);
  });
}

// The pcap library doesn't handle IPv6, or didn't at some point. The TCPTracker
// class still doesn't but it is trivial to fix that.
function track_packetIPv6(this: any, packet: any) {
  var ip, tcp, src, dst, key, session;

  // This check is changed from https://github.com/node-pcap/node_pcap/blob/master/tcp_tracker.js#L15
  // It now processes IPv4 or IPv6.
  // NOTE: The upstream check uses the types in the package but those are not
  // exported. We mimic this by checking the decoderName set on the objects.
  if (
    packet.payload.payload.payload.decoderName === 'tcp' &&
    (packet.payload.payload.decoderName === 'ipv4' ||
      packet.payload.payload.decoderName === 'ipv6')
  ) {
    ip = packet.payload.payload;
    tcp = ip.payload;
    src = ip.saddr + ':' + tcp.sport;
    dst = ip.daddr + ':' + tcp.dport;

    if (src < dst) {
      key = src + '-' + dst;
    } else {
      key = dst + '-' + src;
    }

    var is_new = false;
    session = this.sessions[key];
    if (!session) {
      is_new = true;
      session = new TCPSession();
      this.sessions[key] = session;
    }

    session.track(packet);

    // need to track at least one packet before we emit this new session, otherwise nothing
    // will be initialized.
    if (is_new) {
      this.emit('session', session);
    }
  }
  // silently ignore any non IPv4 TCP packets
  // user should filter these out with their pcap filter, but oh well.
}

// HTTP Request/Response Util classes

class HTTPBase {
  public http_version: any;

  // Note: This field is first used to accumulate headers are they are seen, and
  // then restructured as a map once the headers are complete
  public headers: any;

  public body_len: any;
  private body: stream.Duplex;

  constructor() {
    this.http_version = null;
    this.headers = {};
    this.body_len = 0;
    this.body = new stream.PassThrough();
  }

  public storeBodyBytes(data: Buffer) {
    //console.log(`body: ${data}`);
    this.body.write(data);
  }

  public getBody(): Buffer {
    return this.unpack_body(this.headers, this.body);
  }

  public get_header(header_name: string): string {
    //console.log(`get_header: ${header_name}`);
    for (let [hdr, value] of Object.entries(this.headers)) {
      //console.log(`looking at ${hdr}: ${value}`)
      if (hdr.toLowerCase() === header_name.toLowerCase()) {
        //console.log(`match ${hdr}: ${value}`)
        return value as string;
      }
    }
    return null;
  }

  private unpack_body(headers: string[], body_stream: stream.Readable): Buffer {
    //console.log('unpack body')

    // find a Content-Encoding header and setup a decoders
    let decoders: { (data: Buffer): Buffer }[] = [];
    let hdr = this.get_header('Content-Encoding') || '';
    hdr.split(',').forEach((encoding) => {
      let decoder: { (_: Buffer): Buffer };
      switch (encoding) {
        case 'gzip':
          decoder = zlib.gunzipSync;
          break;
        case 'compress':
          decoder = zlib.unzipSync;
          break;
        case 'deflate':
          decoder = zlib.inflateSync;
          break;
        case 'br':
          decoder = zlib.brotliDecompressSync;
          break;
      }
      // The order in the header is the order the encoders were applied, we
      // need to use the opposite order for the decoders
      if (decoder) {
        decoders.unshift(decoder);
      }
    });

    // read the body into a Buffer, then apply each decoder, if any.
    let byte_len = body_stream.readableLength;
    let buf: Buffer = body_stream.read(byte_len);
    decoders.forEach((decoder) => {
      buf = decoder(buf);
    });

    return buf;
  }
}

class HTTPRequest extends HTTPBase {
  public url: any;
  public method: any;

  constructor() {
    super();
    this.url = null;
    this.method = null;
  }
}

class HTTPResponse extends HTTPBase {
  public status_code: any;

  constructor() {
    super();
    this.status_code = null;
  }
}
