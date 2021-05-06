const protobuf = require('protobufjs');

const definition = {
  nested: {
    optic_shape_hash: {
      nested: {
        FieldDescriptor: {
          fields: {
            key: {
              type: 'string',
              id: 1,
            },
            hash: {
              type: 'ShapeDescriptor',
              id: 2,
            },
          },
        },
        ShapeDescriptor: {
          fields: {
            type: {
              type: 'PrimitiveType',
              id: 1,
            },
            fields: {
              rule: 'repeated',
              type: 'FieldDescriptor',
              id: 2,
            },
            items: {
              rule: 'repeated',
              type: 'ShapeDescriptor',
              id: 3,
            },
            rules: {
              rule: 'repeated',
              type: 'string',
              id: 4,
            },
          },
          nested: {
            PrimitiveType: {
              values: {
                OBJECT: 0,
                ARRAY: 1,
                STRING: 2,
                NUMBER: 3,
                BOOLEAN: 4,
                NULL: 5,
              },
            },
          },
        },
      },
    },
  },
};

const ShapeHashProto = (() => {
  const root = protobuf.Root.fromJSON(definition);
  return root.lookupType('optic_shape_hash.ShapeDescriptor');
})();

export const encodeShapeHash = (payload: any) => {
  const message = ShapeHashProto.create(payload);
  return ShapeHashProto.encode(message).finish();
};

export const decodeShapeHash = (payload: any) => {
  return ShapeHashProto.decode(payload).toJSON();
};
