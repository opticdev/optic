import React from 'react';
import {basePaths} from '../../RouterPaths';
import {LoaderFactory} from './LoaderFactory';
import {notificationAreaComponent, shareButtonComponent} from './SharedLoader';
import EventEmitter from 'events';


export const basePath = basePaths.exampleSessionsBasePath;

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

  const sessionId = 'example-session';
  const specService = {
    getConfig: async function () {
      return Promise.resolve({
        config: {
          apiName: body.config?.apiName || 'Example API'
        }
      });
    },
    listCapturedSamples: async (sessionId) => {
      await waitForEvent('simulate-session');
      return Promise.resolve(body.session);
    },
    listEvents() {
      return Promise.resolve(events);
    },
    listCaptures() {
      return Promise.resolve({captures: [sessionId]});
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
  notificationAreaComponent,
  shareButtonComponent,
  basePath,
  demo: true
});

export default ExampleSessionsLoaderRoutes;

export function simulateSession() {
  return demoEventEmitter.emit('simulate-session');
}

let wasOpenedBefore = false;

function waitForEvent(event) {

  if (wasOpenedBefore || !window.location.pathname.endsWith('/dashboard')) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    demoEventEmitter.on(event, () => {
      wasOpenedBefore = true;
      setTimeout(resolve, 400);
    });
  });
}
