import React, {useEffect, useState} from 'react';
import {useMockData} from '../../contexts/MockDataContext';
import {SpecServiceStore} from '../../contexts/SpecServiceContext';
import {LinearProgress} from '@material-ui/core';
import {RfcStore} from '../../contexts/RfcContext';
import {InitialRfcCommandsStore} from '../../contexts/InitialRfcCommandsContext';
import EventEmitter from 'events';

export default function ApiSpecServiceLoader(props) {
  const debugData = useMockData();

  const [service, setService] = useState(null);
  const [events, setEvents] = useState(null);
  useEffect(() => {
    if (debugData.available && debugData.loading) return;

    const serviceFactory = debugData.available
      ? () => createExampleSpecServiceFactory(debugData.data)
      : () => Promise.reject(new Error('Local Spec Service not implemented yet'));

    const task = async () => {
      const {specService} = await serviceFactory();
      const events = await specService.listEvents();
      setEvents(events); //@ issue here with ordering, must be before setService
      setService(specService);
      specService.eventEmitter.on('events-updated', async () => {
        const events = await specService.listEvents();
        setEvents(events);
      });
    };
    task();
  }, [debugData.available, debugData.loading]);


  if (!service) {
    return <LinearProgress/>;
  }

  return (
    <SpecServiceStore specService={service} apiName="example API" specServiceEvents={service.eventEmitter}>
      <InitialRfcCommandsStore initialEventsString={events} rfcId="testRfcId">
        <RfcStore specService={service}>
          {props.children}
        </RfcStore>
      </InitialRfcCommandsStore>
    </SpecServiceStore>
  );
}

async function createExampleSpecServiceFactory(data) {
  const testingLink =
    data.links && data.links.find(({rel}) => rel === 'testing');

  let events = JSON.stringify(data.events);

  const examples = data.examples || {};
  const eventEmitter = new EventEmitter()

  const captureId = 'example-session';
  const specService = {
    eventEmitter,
    getConfig: async function () {
      return Promise.resolve({
        config: {
          apiName: 'Example API'
        }
      });
    },
    listCapturedSamples: async (captureId) => {
      return Promise.resolve(data.session);
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
      eventEmitter.emit('events-updated');
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

  return {specService};
}
