import { toBytes } from '../json-to-shape-hash';
import { decodeShapeHash } from '../protobuf-support';

const example = {
  glossary: {
    title: 'example glossary',
    GlossDiv: {
      title: 'S',
      GlossList: {
        GlossEntry: {
          ID: null,
          SortAs: 'SGML',
          GlossTerm: 'Standard Generalized Markup Language',
          Acronym: 'SGML',
          Abbrev: 'ISO 8879:1986',
          GlossDef: {
            para:
              'A meta-markup language, used to create markup languages such as DocBook.',
            GlossSeeAlso: ['GML', 'XML'],
          },
          GlossSee: 'markup',
        },
      },
    },
  },
};

test('can shape hash a json object', async () => {
  expect(toBytes(example)).toMatchSnapshot();
  expect(toBytes(example).toString('base64')).toMatchSnapshot();
});

test('can decode the hash', async () => {
  expect(decodeShapeHash(toBytes(example))).toMatchSnapshot();
});

test('shape hashes of string are secure', async () => {
  expect(toBytes('123,456,789')).toMatchSnapshot();
});
