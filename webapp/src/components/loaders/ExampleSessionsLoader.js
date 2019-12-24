import React from 'react';
import {routerPaths, basePaths} from '../../RouterPaths';
import {LoaderFactory} from './LoaderFactory';
import {notificationAreaComponent, shareButtonComponent} from './SharedLoader';

export const basePath = basePaths.exampleSessionsBasePath;


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
  const session = body.session;

  const sessionId = 'example-session';
  const specService = {
    loadSession: (sessionId) => {
      return Promise.resolve({
        diffStateResponse: {
          diffState: {}
        },
        sessionResponse: {
          session: session
        }
      });
    },
    listEvents() {
      return Promise.resolve(events);
    },
    listSessions() {
      return Promise.resolve({sessions: [sessionId]});
    },
    saveEvents: (eventStore, rfcId) => {
      const serializedEvents = eventStore.serializeEvents(rfcId);
      events = serializedEvents;
    },
    listExamples: (requestId) => {
      return Promise.resolve({examples: examples[requestId] || []});
    },
    saveExample: (interaction, requestId) => {
      const requestExamples = examples[requestId] || [];
      requestExamples.push(interaction);
      examples[requestId] = requestExamples;
    },
    saveDiffState: () => {
    }
  };
  return specService;
};

const {
  Routes: ExampleSessionsLoaderRoutes
} = LoaderFactory.build({
  specServiceTask,
  notificationAreaComponent,
  shareButtonComponent,
  basePath
});

export default ExampleSessionsLoaderRoutes;
