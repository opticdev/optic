/// <reference types="node" />
import { Readable, Writable, Duplex, Transform, DuplexOptions } from 'stream';
import Chain from 'stream-chain';
type StreamItem = Stream | TransformFunction;

declare module 'stream-chain' {
  // declare namespace Chain {
  //   interface ChainOptions extends DuplexOptions {
  //     skipEvents?: boolean;
  //   }

  function final<V>(value?: V): Chain;
  // }
}
