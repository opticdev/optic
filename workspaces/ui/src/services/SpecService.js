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

  static putString(url, body) {
    return fetch(url, {
      method: 'PUT',
      headers: {
        'content-type': 'text/plain'
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
  constructor(specId) {
    this.specId = specId;
  }

  listEvents() {
    return NetworkUtilities.getJsonAsText(`/api/specs/${this.specId}/events`);
  }

  listCaptures() {
    return NetworkUtilities.getJson(`/api/specs/${this.specId}/captures`);
  }

  getCommandContext() {
    return NetworkUtilities.getJson(`/api/specs/${this.specId}/command-context`);
  }

  saveEvents(eventStore, rfcId) {
    const serializedEvents = eventStore.serializeEvents(rfcId);
    return NetworkUtilities.putJson(`/api/specs/${this.specId}/events`, serializedEvents);
  }

  saveExample(interaction, requestId) {
    return NetworkUtilities.postJson(`/api/specs/${this.specId}/example-requests/${requestId}`, JSON.stringify(interaction));
  }

  listExamples(requestId) {
    return NetworkUtilities.getJson(`/api/specs/${this.specId}/example-requests/${requestId}`);
  }


  listCapturedSamples(captureId) {
    return NetworkUtilities.getJson(`/api/specs/${this.specId}/captures/${captureId}/samples`)
      .then((body) => {
        return {
          samples: body.samples
        };
      });
  }

  getConfig() {
    return NetworkUtilities.getJson(`/api/specs/${this.specId}/config`);
  }

  putConfig(configYaml) {
    return NetworkUtilities.putJson(`/api/specs/${this.specId}/config`, JSON.stringify({yaml: configYaml}));
  }
}

const specService = new SpecService();

export {
  NetworkUtilities,
  SpecService,
  specService
};
