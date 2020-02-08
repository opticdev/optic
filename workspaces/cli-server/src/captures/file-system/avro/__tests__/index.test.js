const avro = require('avsc');

const schema = require('@useoptic/domain/build/domain-types/avro-schemas/capture.json');
const serdes = avro.Type.forSchema(schema);

describe('loading and saving samples to fs', function () {
  it('should save and load with no items', async function (done) {
    const original = {
      groupingIdentifiers: {
        agentGroupId: 'agent-group-id',
        agentId: 'agent-id',
        batchId: 'batch-id',
        captureId: 'capture-id'
      },
      batchItems: []
    };
    const serialized = serdes.toBuffer(original);
    const deserialized = serdes.fromBuffer(serialized);
    expect(original).toEqual(deserialized);
    done();
  });
  it('should save and load with items with bodies', async function (done) {
    const original = {
      groupingIdentifiers: {
        agentGroupId: 'agent-group-id',
        agentId: 'agent-id',
        batchId: 'batch-id',
        captureId: 'capture-id'
      },
      batchItems: [
        {
          uuid: 'ddd',
          omitted: [],
          request: {
            headers: [],
            host: 'hhh',
            method: 'mmm',
            path: '/ppp',
            queryString: '',
            body: {
              asJsonString: '{}',
              asText: null
            }
          },
          response: {
            headers: [],
            statusCode: 200,
            body: {
              asJsonString: null,
              asText: 'ttt'
            }
          }
        }
      ]
    };
    const serialized = serdes.toBuffer(original);
    const deserialized = serdes.fromBuffer(serialized);
    expect(original).toEqual(deserialized);
    done();
  });
});
