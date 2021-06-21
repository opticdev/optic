const { encodeShapeHash, decodeShapeHash } = require('./protobuf-support');

export function jsonToShapeHash(_data: any): any {
  const jsTypeString = Object.prototype.toString.call(_data);
  if (jsTypeString === '[object Array]') {
    return ShapeHash(
      PrimitiveTypes.ARRAY,
      [],
      _data.map((item: any) => jsonToShapeHash(item))
    );
  } else if (jsTypeString === '[object Object]') {
    const fields: { key: string; hash: any }[] = Object.entries(_data).map(
      (i: any) => {
        const key = i[0] as string;
        const value = i[1] as any;
        return {
          key,
          hash: jsonToShapeHash(value),
        };
      }
    );

    return ShapeHash(PrimitiveTypes.OBJECT, fields, [], []);
  } else if (jsTypeString === '[object Number]') {
    return ShapeHash(PrimitiveTypes.NUMBER);
  } else if (jsTypeString === '[object String]') {
    return ShapeHash(PrimitiveTypes.STRING);
  } else if (jsTypeString === '[object Null]') {
    return ShapeHash(PrimitiveTypes.NULL);
  } else if (jsTypeString === '[object Boolean]') {
    return ShapeHash(PrimitiveTypes.BOOLEAN);
  } else {
    throw new Error('Unknown type! ' + jsTypeString);
  }
}

export function toBytes(json: any) {
  const hashMessage = jsonToShapeHash(json);
  return encodeShapeHash(hashMessage);
}

function toHash(json: any): string {
  return bufferToHex(toBytes(json));
}

function bufferToHex(buffer: any) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const PrimitiveTypes = {
  OBJECT: 0,
  ARRAY: 1,
  STRING: 2,
  NUMBER: 3,
  BOOLEAN: 4,
  NULL: 5,
};

const types = {
  OBJECT: 'OBJECT',
  ARRAY: 'ARRAY',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  NULL: 'NULL',
};

export function toJsonExample(hash: string): any {
  const decoded = decodeShapeHash(Buffer.from(hash, 'base64'));
  return toJson(decoded);
}

function toJson(item: any) {
  switch (item.type) {
    case types.OBJECT:
      const newObj: Record<string, any> = {};
      if (item.hasOwnProperty('fields')) {
        item.fields.forEach(({ key, hash }: any) => {
          newObj[key] = toJson(hash);
        });
      }
      return newObj;
    case types.ARRAY:
      if (item.hasOwnProperty('items')) {
        return [...item.items.map(toJson)];
      } else {
        return [];
      }
    case types.STRING:
      return 'string';
    case types.NUMBER:
      return 1;
    case types.BOOLEAN:
      return true;
    case types.NULL:
      return null;
  }
}

function ShapeHash(
  type: number,
  fields: { key: string; hash: any }[] = [],
  items = [],
  rules = []
) {
  return { type, fields, items, rules };
}
