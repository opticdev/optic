class NetworkUtilities {

  static handleJsonResponse(response) {
    if (response.ok) {
      return response.json();
    }
    return response.text()
      .then((text) => {
        throw new Error(text);
      });
  }

  static getJson(url) {
    return fetch(url, {
      headers: {
        'accept': 'application/json',
      }
    })
      .then(NetworkUtilities.handleJsonResponse);
  }

  static getJsonAsText(url) {
    return fetch(url, {
      headers: {
        'accept': 'application/json',
      }
    })
      .then((response) => {
        if (response.ok) {
          return response.text();
        }
      });
  }


  static putJson(url, body) {
    return fetch(url, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json'
      },
      body
    });
  }

  static postJson(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body
    });
  }
}

class SpecService {

  listEvents() {
    return NetworkUtilities.getJsonAsText(`/cli-api/events`);
  }

  listSessions() {
    return NetworkUtilities.getJson(`/cli-api/sessions`);
  }

  getCommandContext() {
    return NetworkUtilities.getJson(`/cli-api/command-context`);
  }

  saveEvents(eventStore, rfcId) {
    const serializedEvents = eventStore.serializeEvents(rfcId);
    return NetworkUtilities.putJson(`/cli-api/events`, serializedEvents);
  }

  saveExample(interaction, requestId) {
    return NetworkUtilities.postJson(`/cli-api/example-requests/${requestId}`, JSON.stringify(interaction));
  }

  listExamples(requestId) {
    return NetworkUtilities.getJson(`/cli-api/example-requests/${requestId}`);
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
        return {
          sessionResponse,
          diffStateResponse: null
        };
      });
  }

  async listIntegrations() {
    const {integrations} = await NetworkUtilities.getJson(`/cli-api/integrations`);
    return integrations
  }
  supportsIntegrations () {
    return true
  }
}

const specService = new SpecService();

export {
  NetworkUtilities,
  SpecService,
  specService
};
