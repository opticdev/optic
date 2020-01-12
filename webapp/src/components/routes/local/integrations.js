import React from 'react';
import {NetworkUtilities, SpecService} from '../../../services/SpecService';

export class IntegrationsSpecService extends SpecService {
  constructor(name) {
    super();
    this.name = name;
    this.encodedName = encodeURIComponent(name);
  }

  listEvents() {
    return NetworkUtilities.getJsonAsText(`/cli-api/integrations/${this.encodedName}/events`);
  }

  saveEvents(eventStore, rfcId) {
    const serializedEvents = eventStore.serializeEvents(rfcId);
    return NetworkUtilities.putJson(`/cli-api/integrations/${this.encodedName}/events`, serializedEvents);
  }

  saveExample(interaction, requestId) {
    return NetworkUtilities.postJson(`/cli-api/integrations/${this.encodedName}/example-requests/${requestId}`, JSON.stringify(interaction));
  }

  listExamples(requestId) {
    return NetworkUtilities.getJson(`/cli-api/integrations/${this.encodedName}/example-requests/${requestId}`);
  }

  saveDiffState(sessionId, diffState) {
    return NetworkUtilities.putJson(`/cli-api/sessions/${sessionId}/diff`, JSON.stringify(diffState));
  }

  saveSession(sessionId, session) {
    return NetworkUtilities.putJson(`/cli-api/sessions/${sessionId}`, JSON.stringify(session));
  }

  loadSession(sessionId) {
    const promises = [
      NetworkUtilities.getJson(`/cli-api/sessions/${sessionId}`)
    ];
    return Promise.all(promises)
      .then(([sessionResponse]) => {
        if (sessionResponse.session) {
          sessionResponse.session.samples = (sessionResponse.session.integrationSamples || []).filter(i => i.integrationName === this.name);
        }
        return {
          sessionResponse,
          diffStateResponse: null
        };
      });
  }
}
