import React from 'react';
import {LoaderFactory} from './LoaderFactory';
import {shareButtonComponent} from './SharedLoader';
import EventEmitter from 'events';

const demoEventEmitter = new EventEmitter();
const specServiceEvents = new EventEmitter()

const specServiceTask = async (props) => {
  const body = await fetch(`/example-sessions/${props.match.params.exampleId}.json`, {
    headers: {
      'accept': 'application/json'
    }
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error();
    });


  let events = JSON.stringify(body.events);
  const examples = body.examples || {};

  const captureId = 'example-session';
  const specService = {
    getConfig: async function () {
      return Promise.resolve({
        config: {
          apiName: body.config?.apiName || 'Example API'
        }
      });
    },
    listCapturedSamples: async (captureId) => {
      return Promise.resolve(body.session);
    },
    listEvents() {
      return Promise.resolve(events);
    },
    listCaptures() {
      return Promise.resolve({captures: [{captureId, lastUpdate: new Date().toISOString(), hasDiff: true}]});
    },
    saveEvents: (eventStore, rfcId) => {
      const serializedEvents = eventStore.serializeEvents(rfcId);
      events = serializedEvents;
      specServiceEvents.emit('events-updated')
    },
    listExamples: (requestId) => {
      return Promise.resolve({examples: examples[requestId] || []});
    },
    saveExample: (interaction, requestId) => {
      const requestExamples = examples[requestId] || [];
      requestExamples.push(interaction);
      examples[requestId] = requestExamples;
    },
  };
  return specService;
};
const {
  Routes: ExampleSessionsLoaderRoutes
} = LoaderFactory.build({
  specServiceTask,
  specServiceEvents,
  shareButtonComponent,
  demo: true
});

export default ExampleSessionsLoaderRoutes;
