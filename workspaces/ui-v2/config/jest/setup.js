const { Crypto } = require('@peculiar/webcrypto');
//@GOTCHA when running our OpticEngine wasm build for Node (as opposed to for Browser) in Jest, Jest's jsdom does not provide a crypto implementation
const crypto = new Crypto();
global.crypto = crypto;
