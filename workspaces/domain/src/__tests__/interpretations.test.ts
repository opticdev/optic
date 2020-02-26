// @ts-ignore
import * as domain from '../domain.js';
import {IHttpInteraction} from '../domain-types/optic-types';

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
          headers: [],
          method: 'GET',
          body: {
            asJsonString: JSON.stringify({k: 'v'}),
            asText: null
          },
          host: 'api.mydomain.com',
          path: '/v1/pets',
          queryString: ''
        },
        response: {
          statusCode: 200,
          headers: [],
          body: {
            asJsonString: null,
            asText: null
          }
        },
        omitted: []
      };
      const jsonHelper = JsonHelper();
      const interactions = [jsonHelper.fromInteraction(interaction), jsonHelper.fromInteraction(interaction), jsonHelper.fromInteraction(interaction)];
      const diffResults = helpers.DiffHelpers().groupByDiffs(rfcState, jsonHelper.jsArrayToSeq(interactions));
      console.log(diffResults);
      debugger
    });
  });
});
