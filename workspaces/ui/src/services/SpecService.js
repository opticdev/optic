import Bottleneck from 'bottleneck';

class NetworkUtilities {
  static handleJsonResponse(response) {
    if (response.ok) {
      return response.json();
    }
    return response.text().then((text) => {
      throw new Error(text);
    });
  }

  static getJson(url) {
    return fetch(url, {
      headers: {
        accept: 'application/json',
      },
    }).then(NetworkUtilities.handleJsonResponse);
  }

  static getJsonAsText(url) {
    return fetch(url, {
      headers: {
        accept: 'application/json',
      },
    }).then((response) => {
      if (response.ok) {
        return response.text();
      }
    });
  }

  static putJson(url, body) {
    return fetch(url, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body,
    });
  }

  static putString(url, body) {
    return fetch(url, {
      method: 'PUT',
      headers: {
        'content-type': 'text/plain',
      },
      body,
    });
  }

  static postJson(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body,
    });
  }
}

const outgoingPoll = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000,
});

class SpecService {
  constructor(specId, eventEmitter) {
    this.specId = specId;
    this.eventEmitter = eventEmitter;
  }

  listEvents() {
    return NetworkUtilities.getJsonAsText(`/api/specs/${this.specId}/events`);
  }

  listCaptures() {
    return NetworkUtilities.getJson(`/api/specs/${this.specId}/captures`);
  }

  getCommandContext() {
    return NetworkUtilities.getJson(
      `/api/specs/${this.specId}/command-context`
    );
  }

  saveEvents(eventStore, rfcId) {
    const serializedEvents = eventStore.serializeEvents(rfcId);
    return NetworkUtilities.putJson(
      `/api/specs/${this.specId}/events`,
      serializedEvents
    ).then((x) => {
      this.eventEmitter.emit('events-updated');
      return x;
    });
  }

  saveExample(interaction, requestId) {
    return NetworkUtilities.postJson(
      `/api/specs/${this.specId}/example-requests/${requestId}`,
      JSON.stringify(interaction)
    );
  }

  listExamples(requestId) {
    return NetworkUtilities.getJson(
      `/api/specs/${this.specId}/example-requests/${requestId}`
    );
  }

  listCapturedSamples(captureId) {
    return outgoingPoll.schedule(() => {
      return NetworkUtilities.getJson(
        `/api/specs/${this.specId}/captures/${captureId}/samples`
      ).then((body) => {
        return {
          samples: body.samples,
          metadata: body.metadata,
        };
      });
    });
  }

  getCaptureStatus(captureId) {
    return NetworkUtilities.getJson(
      `/api/specs/${this.specId}/captures/${captureId}/status`
    );
  }

  getSessions() {
    return NetworkUtilities.getJson(`/api/sessions`);
  }

  getLastCapture() {
    return NetworkUtilities.getJson(`/api/specs/${this.specId}/captures/last`);
  }

  getConfig() {
    return NetworkUtilities.getJson(`/api/specs/${this.specId}/config`);
  }

  putConfig(configYaml) {
    return NetworkUtilities.putJson(
      `/api/specs/${this.specId}/config`,
      JSON.stringify({ yaml: configYaml })
    );
  }
}

export { NetworkUtilities, SpecService };
