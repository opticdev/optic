// @ts-ignore
import * as domain from '../domain.js';
import {IHttpInteraction, IArbitraryData} from '../domain-types/optic-types';

describe('Optic Domain', function () {
  describe('diffing', function () {
    console.log(domain);
    it('should detect a diff and be able to fix it by an interpretation', function () {
      console.log(domain.com.useoptic.diff);
      const {contexts, diff, JsonHelper} = domain.com.useoptic;
      const {helpers} = diff;
      const {RfcServiceJSFacade} = contexts.rfc;
      const rfcServiceFacade = RfcServiceJSFacade();
      const eventStore = rfcServiceFacade.makeEventStore();
      const rfcId = 'test';

      const specJson = '[]';
      eventStore.bulkAdd(rfcId, specJson);

      const rfcService = rfcServiceFacade.makeRfcService(eventStore);
      const rfcState = rfcService.currentState(rfcId);
      console.log(rfcService);
      console.log(rfcState);
      const interaction: IHttpInteraction = {
        uuid: 'iii',
        request: {
          headers: {
            asShapeHashBytes: null,
            asJsonString: null,
            asText: null
          },
          method: 'GET',
          body: {
            contentType: null,
            value: {
              asShapeHashBytes: null,
              asJsonString: JSON.stringify({k: 'v'}),
              asText: null
            },
          },
          host: 'api.mydomain.com',
          path: '/v1/pets',
          query: {
            asShapeHashBytes: null,
            asJsonString: null,
            asText: null
          }
        },
        response: {
          statusCode: 200,
          headers: {
            asShapeHashBytes: null,
            asJsonString: null,
            asText: null
          },
          body: {
            contentType: null,
            value: {
              asShapeHashBytes: null,
              asJsonString: null,
              asText: null
            }
          }
        },
        tags: []
      };
      const jsonHelper = JsonHelper();
      const interactions = [jsonHelper.fromInteraction(interaction), jsonHelper.fromInteraction(interaction), jsonHelper.fromInteraction(interaction)];
      const diffResults = helpers.DiffHelpers().groupByDiffs(rfcState, jsonHelper.jsArrayToSeq(interactions));
      console.log(diffResults);
      debugger
    });
  });
});
