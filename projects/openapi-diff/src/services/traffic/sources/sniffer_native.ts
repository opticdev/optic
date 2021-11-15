import http from "http";
import { AddressInfo } from 'net';
import net from "net";
import { unlink } from "fs/promises";
import stream from "stream";

import { PcapSession, TCPTracker, TCPSession, createSession, decode } from "pcap";
import express from 'express';
import { createProxyMiddleware, RequestHandler, responseInterceptor } from 'http-proxy-middleware';
import { parseStatusLine } from "http-string-parser";

import { TrafficSource } from "../types";
import { OpticHttpInteraction } from "../traffic/optic-http-interaction";

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
    this.tracker = new TCPTracker();

    this.tracker.on('session', async (session: any) => {
      //console.log("session");
      // Initialise a Simulation
      // Note: This is a "lightweight" operation since we need to wire up the
      // session's events quickly to avoid missing data
      session.sim = new Simulation();
      let endPromise = this.wireSession(session, session.sim);
      // Replay the session as it happens, "simulating" it.
      this.simulateSession(session, endPromise);
    });
  }


  start(): Promise<void> {
    //console.log("start");

    let options = { filter: `tcp and port ${this.config.port}` }
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
    return new Promise<void>((resolve) => {
      session.on('end', (session: any) => {
        //console.log("End of TCP session between " + session.src + " and " + session.dst);
        resolve();
      })
    });
  }

  // Replay stored sesssion data and pass the Simulation a callback to emit a
  // traffic event when we have a full request/response pair
  async simulateSession(session: typeof TCPSession, sessionEndPromise: Promise<void>) {
    await session.sim.prepareSimulation(this.emitTraffic.bind(this));
    await session.sim.run();
    await session.sim.finalize(sessionEndPromise);

    //console.log(`Closing session ${session.track_id}`);
    await session.sim.close();
    delete this.sessions[session.track_id];
  }
}

// Simulate/replay captured traffic through a proxy instance.
// The flow is:
//  client connection -> proxy request handler -> backend connection -> proxy response handler
// Where 'client connection' a literal replay of the bytes seen from a client
// (the 'data send' pcap event) and 'backend connection is a literal replay of
// the bytes seen in a response (the 'data recv' pcap event).
// Both replay connections are hand-rolled TCP connections.
//
// Note: http-proxy-middleware splits pipelined requests when dispatching to the
// backend. This is annoying, as it means we need to split the response bytes by
// looking for HTTP response message starts.
class Simulation {
  static simCount = 0;

  private sessionNumber: number;

  // Bytes for replay on the client connection, requestConn.
  private requestStream: stream.Duplex;

  // Byte streams for each backend response. We split when we see a new response
  // (marked with a HTTP/1.1 start). This happens with pipelined requests and we
  // expect the number of streams to match the number of requests in a session.
  private responseStreams: stream.PassThrough[];

  // handles to the proxy and backend server

  private backendServer: net.Server;
  private proxy: RequestHandler;
  private proxyListener: http.Server;

  // Unix socket for the client connection (proxy listens on this, raw TCP connection made by us)
  private requestSock: net.Socket;
  // Unix socket for the backend (proxy connects to this, raw TCP server by us)
  private requestConn: net.Socket;
  // The client socket on connect, backend data is sent on this.
  //
  // Note: http-middleware-proxy splits pipelined requests. There will be
  // multiple responseConn instances in those scenarios.
  //private responseConnArr: net.Socket[];

  // proxiedRequestsIdx & backendRequestsIdx are used to coordinate connections
  // from the proxy to the backend server.
  // They are independent since the order of operations is not fixed, and we may
  // begin handling backend responses before all requests have passed through
  // the proxy.
  private proxiedRequestsIdx: number;
  private backendRequestsIdx: number;

  // allStreams is all the streams we create for this simulation. We use it in
  // .close() to ensure that we don't shutdown before in-flight requests are
  // handled.
  public allStreams: stream.PassThrough;



  constructor(){
    this.sessionNumber = ++Simulation.simCount;

    this.requestStream = new stream.PassThrough();

    this.responseStreams = [];
    this.proxiedRequestsIdx = -1;
    this.backendRequestsIdx = -1;

    this.allStreams = new stream.PassThrough({ objectMode: true });
    this.allStreams.push(this.requestStream);
  }

  // storeRequestBytes retains data for replay on requestConn.
  // Note: No copy is made. If the buffer is re-used then copy it before passing
  // it in.
  public async storeRequestBytes(data: Uint8Array) {
      this.requestStream.write(data);
  }

  // storeResponseBytes retains data for replay on responseConn. It splits on a
  // new HTTP/1.1 response start, resulting in a number of internal buffer
  // arrays.
  // Note: No copy is made. If the buffer is re-used then copy it before passing
  // it in.
  public async storeResponseBytes(data: Uint8Array) {
    // parseStatusLine is implemented with an anchored regex, internally.
    // It won't parse unless we split lines. We take the first 100 bytes
    // to avoid large response bodies
    const respline = parseStatusLine(data.slice(0, 100).toString().split(/\r?\n/, 1)[0]);
    //console.log(`storeResponseBytes respline: ${JSON.stringify(respline)}`);

    let idx = this.proxiedRequestsIdx;

    // Start a new array of Buffers for a new HTTP response.
    // Note: The first ever data will call newReponseStream via
    // getResponseStream below, but it is likely that the first bytes are the
    // start of a HTTP response anyway. idx must be consistent between the two, however.
    if (respline.protocol && respline.protocol.startsWith("HTTP/1.1") &&
        respline.statusCode && respline.statusMessage) {
      idx = ++this.proxiedRequestsIdx;
      //console.log(`storeResponseBytes need new curr len ${this.proxiedRequestsIdx} respline ${JSON.stringify(respline)}`);

      // Allow processing the previous response, if there is one
      if (this.proxiedRequestsIdx > 1) {
        //console.log(`storeResponseBytes done with ${this.proxiedRequestsIdx}`);
        this.resolveResponseStream(this.proxiedRequestsIdx - 1);
      }
    }

    this.getResponseStream(this.proxiedRequestsIdx).write(data);
    //console.log(`storeResponseBytes end`);
  }

  // prepareSimulation starts up the servers and connections we use to replay a session.
  // Note: This is a slow operation and should not execute before setting up the
  // session's callbacks to avoid missing traffic.
  public async prepareSimulation(emitTraffic: any) {
    const socketBackendPath = `simulated_session_${this.sessionNumber}_backend.sock`
    const socketFrontendPath = `simulated_session_${this.sessionNumber}_frontend.sock`

    await this.startBackendServer(socketBackendPath);

    // setup proxy
    let onProxyReq = (proxyReq: http.ClientRequest, req: http.IncomingMessage, res: http.ServerResponse): void => {
      //console.log(`onProxyReq`);
      //console.log(`onProxyReq: ${req.url}`);
    };
    let onProxyRes = responseInterceptor(async (responseBuffer: Buffer, proxyRes: http.IncomingMessage, req: http.IncomingMessage, res: http.ServerResponse) =>  {
      //console.log(`onProxyRes`);
      //console.log(`onProxyRes req headers ${req.headers.toString()}`);
      //console.log(`onProxyRes res headers ${JSON.stringify(proxyRes.headers)}`);

      // Split up the reported `req.url`
      let path, query;
      try {
        let url = new URL(req.url, `http://${req.headers.host}`);
        path = url.pathname;
        query = url.search.slice(1); // strip leading `?`
      } finally {}

      let contentType = proxyRes.headers["content-type"],
          response = undefined;
      try {
        // Check that this is a JSON string
        JSON.parse(responseBuffer.toString());
        response = responseBuffer.toString(); 
        //console.log(`OnProxyRes response is JSON`);
        //console.log(`response: ${response}`);
      } catch (e) {
        contentType = undefined; // We rely on this to indicate empty bodies
      }

      // Success! emit an interaction
      let interaction = new OpticHttpInteraction({
        request: {
          method: req.method,
          path: path,
          query: { asText: query }
        },
        response: {
          statusCode: res.statusCode.toString(),
          body: {
            contentType: contentType,
            value: { asJsonString: response}
          }
        }
      });
      //console.log(`proxy emitTraffic: ${JSON.stringify(interaction)}`);
      emitTraffic(interaction);

      return responseBuffer;
    })

    this.proxy = createProxyMiddleware({
      selfHandleResponse: true, // Needed by `responseInterceptor`
      target: { socketPath: socketBackendPath, host: "", port: 0 },
      onProxyReq: onProxyReq,
      onProxyRes: onProxyRes,
      logLevel: 'error',
    });

    // start a server, cleaning up any leftover sockets
    await unlink(socketFrontendPath).catch(() => {});
    const proxyApp = express().use(this.proxy);
    this.proxyListener = proxyApp.listen(socketFrontendPath);
    await new Promise((resolve) => {
      this.proxyListener.on('listening', resolve);
    });
    //console.log(`ProxyApp ready`);

    await this.startFrontendServer(socketFrontendPath);
  }

  // startTCPConnections intializes two unix sockets for replays.
  // These are raw TCP connections because the pcap data is sent on them as-is.
  // This is particularly relevant for compressed response bodies where we
  // cannot introspect anything.
  private async startBackendServer(socketBackendPath: string) {
    // open backend response replay socket, cleanup leftover unix sockets from before
    // TODO: We may need to wait on the request to be sent before we stream the response
    await new Promise<void>((resolve) => {
    unlink(socketBackendPath).catch(() => {} )
    .finally(async () => {
      this.backendServer = net.createServer(async (c) => {
        let idx = ++this.backendRequestsIdx;
        //console.log(`new backend connection ${idx}`);
        let responseStream = this.getResponseStream(idx);

        //responseStream.on('data', (data) => {
        //  console.log(`wrting backend ${idx}`);
        //  //console.log(`writing backend ${idx} data: ${data}`);
        //});
        //c.on('data', (data) => { console.log(`backend connection ${idx} data read: ${data}`);});
        //c.on('end', () => { console.log(`backend connection ${idx} end`)});
        //c.on('close', () => { console.log(`backend connection ${idx} close`)});

        responseStream.pipe(c);
      })
      .on('error', (err: any) => {
        console.log(`backend server error ${err}`);
        throw err;
      })
    })
    .then(async () => {
        //console.log(`wiring listen event`);
        this.backendServer.on('listening', () => {
          //console.log(`Backend ready`);
          resolve();
        });
        this.backendServer.listen(socketBackendPath, 1024*1024);
      });
    });

  }

  private async startFrontendServer(socketFrontendPath: string) {
    // Open frontend request replay socket, cleanup leftover unix sockets from before
    return new Promise<void>((resolve) => {
      this.requestSock = new net.Socket();
      this.requestConn = this.requestSock.connect(socketFrontendPath)
        .on('connect', () => {
          //console.log('requestConn connect event');
          resolve();
        })
        .on('error', (err) => {
          //console.log(`requestConn error: ${err}`);
          throw err;
        });
    });
    //console.log(`requestConn ready ${JSON.stringify(sim.requestConn.address())}`);
  }

  // run replays traffic stored with `storeRequestBytes` and `storeResponseBytes`
  // Note: Only run this on completed sessions
  // Note: Assumes setupSimulation has already been called.
  public async run() {
    //console.log(`Flushing session ${session.track_id}`);
    this.requestStream.pipe(this.requestConn);
    await this.requestStream;

  }

  public async finalize(sessionEndPromise: Promise<void>) {
    await sessionEndPromise;
    //console.log('session ended')
    if (this.responseStreams.length >= 1) {
      //console.log(`clearing last response stream`);
      let idx = this.responseStreams.length - 1;
      this.resolveResponseStream(idx);
    }
  }

  public async close() {
    //console.log(`simulation close pre all responseStreams`);
    for await (const s of this.allStreams) { await s; }

    this.responseStreams.forEach(async (s, idx) => {
      await new Promise(resolve => { s.on('close', resolve) } );
      //console.log(`simulation close await responseStreams[${idx}] returned`);
    });
    //console.log(`simulation close post all responseStreams`);

    this.proxyListener.close();
    this.backendServer.close();
    //for (let c of await this.responseConnArr) { c.destroy(); }
  }

  private newResponseStream(): stream.Duplex {
      this.responseStreams.push(new stream.PassThrough());
      let idx = this.responseStreams.length - 1;
      //console.log(`newReponseStream: idx ${idx} maxIdx ${this.responseStreams.length - 1}`);
      this.allStreams.push(this.responseStreams[idx]);
      return this.responseStreams[idx];
  }

  private getResponseStream(idx: number): stream.Duplex {
    //console.log(`getResponseStream: idx ${idx} maxIdx ${this.responseStreams.length - 1}`);
    // Add a new one if needed
    if (idx > this.responseStreams.length - 1) {
      return this.newResponseStream();
    }
    return this.responseStreams[idx];
  }

  private resolveResponseStream(idx: number): stream.Duplex {
    //console.log(`resolveResponseStream: idx ${idx} maxIdx ${this.responseStreams.length - 1}`);
    let ret = this.getResponseStream(idx) as stream.PassThrough;
    // TODO: Do we need a final implementation here?
    ret.push(null);
    return ret;
  }
}

// Util functions

async function waitFor(millis: number) {
  return await new Promise((resolve) => {
    setTimeout(resolve, millis);
  });
}

function getAddrString(addr: AddressInfo | string): string {
  let addr_string: string = (typeof addr == 'string') ? addr :
    (addr.family == "IPv6") ?
      `http://[${addr.address}]:${addr.port}` :
      `http://${addr.address}:${addr.port}`;

  return addr_string;
}