import { Duplex, Readable, Transform, TransformCallback } from 'stream';
import { AsyncTools } from '@useoptic/diff-engine-wasm';

async function main() {
  interface WrappedThing {
    trackingId: string;
    item: any;
  }

  const bus = new Readable({
    objectMode: true,
  });

  const streamToString = new Transform({
    writableObjectMode: true,
    readableObjectMode: false,
    transform(chunk: any, encoding: string, callback: TransformCallback) {
      callback(null, JSON.stringify(chunk));
    },
  });

  /*
size <number> Number of bytes to read asynchronously
This function MUST NOT be called by application code directly. It should be implemented by child classes, and called by the internal Readable class methods only.

All Readable stream implementations must provide an implementation of the readable._read() method to fetch data from the underlying resource.

When readable._read() is called, if data is available from the resource, the implementation should begin pushing that data into the read queue using the this.push(dataChunk) method. _read() should continue reading from the resource and pushing data until readable.push() returns false. Only when _read() is called again after it has stopped should it resume pushing additional data onto the queue.

Once the readable._read() method has been called, it will not be called again until more data is pushed through the readable.push() method. Empty data such as empty buffers and strings will not cause readable._read() to be called.

The size argument is advisory. For implementations where a "read" is a single operation that returns data can use the size argument to determine how much data to fetch. Other implementations may ignore this argument and simply provide data whenever it becomes available. There is no need to "wait" until size bytes are available before calling stream.push(chunk).

The readable._read() method is prefixed with an underscore because it is internal to the class that defines it, and should never be called directly by user programs.
 */
  // here do the forking, and then fromReadable for each fork
  const fork = bus;
  fork.pipe(streamToString).pipe(process.stdout);
  // const eventStream = AsyncTools.fromReadable<WrappedThing>(fork);
  // for await (const item of eventStream()) {
  //   console.log(item);
  // }
  // before writing to bus, add a listener for trackingId (axax has first/find operator, and stop listening after or something)

  bus.push({
    trackingId: 'xyz',
    item: 'dev',
  });
  bus.push({
    trackingId: 'abc',
    item: 'jaap',
  });
  bus.push(null);
}

main();
