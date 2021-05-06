const protobuf = require('protobufjs');
const path = require('path');

const ShapeHashProto = (() => {
  const root = protobuf.loadSync(path.resolve(__dirname, 'shapehash.proto'));
  return root.lookupType('optic_shape_hash.ShapeDescriptor');
})();

export const encodeShapeHash = (payload: any) => {
  const message = ShapeHashProto.create(payload);
  return ShapeHashProto.encode(message).finish();
};

export const decodeShapeHash = (payload: any) => {
  return ShapeHashProto.decode(payload).toJSON();
};
