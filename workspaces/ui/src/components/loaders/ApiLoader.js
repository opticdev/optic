import React, { useEffect, useState } from 'react';
import { useMockData } from '../../contexts/MockDataContext';
import { SpecServiceStore } from '../../contexts/SpecServiceContext';
import { LinearProgress } from '@material-ui/core';
import { LocalRfcStore, RfcStore } from '../../contexts/RfcContext';
import { InitialRfcCommandsStore } from '../../contexts/InitialRfcCommandsContext';
import EventEmitter from 'events';

export function ApiSpecServiceLoader(props) {
  const debugData = useMockData();

  const [service, setService] = useState(null);
  const [events, setEvents] = useState(null);
  useEffect(() => {
    if (debugData.available && debugData.loading) return;

    const serviceFactory = () =>
      createExampleSpecServiceFactory(debugData.data);

    const task = async () => {
      const { specService } = await serviceFactory();
      setService(specService);
      specService.eventEmitter.on('events-updated', async () => {
        const events = await specService.listEvents();
        setEvents(events);
      });
    };
    task();
  }, [debugData.available, debugData.loading]);

  useEffect(() => {
    if (service) {
      const task = async () => {
        const events = await service.listEvents();
        setEvents(events);
      };
      task();
    }
  }, [service]);

  if (!service) {
    return <LinearProgress />;
  }

  return (
    <SpecServiceStore
      specService={service}
      specServiceEvents={service.eventEmitter}
    >
      <InitialRfcCommandsStore
        initialEventsString={events}
        rfcId="testRfcId"
        instance="the one in ApiSpecServiceLoader"
      >
        <RfcStore specService={service}>{props.children}</RfcStore>
      </InitialRfcCommandsStore>
    </SpecServiceStore>
  );
}

export function LocalCliSpecServiceLoader(props) {
  const [events, setEvents] = useState(null);
  const { specService } = props;
  useEffect(() => {
    const task = async () => {
      specService.eventEmitter.on('events-updated', async () => {
        const events = await specService.listEvents();
        setEvents(events);
      });
    };
    task();
  });

  useEffect(() => {
    if (specService) {
      const task = async () => {
        const events = await specService.listEvents();
        setEvents(events);
      };
      task();
    }
  }, [specService]);

  if (!events) {
    return <LinearProgress />;
  }

  return (
    <SpecServiceStore
      specService={specService}
      specServiceEvents={specService.eventEmitter}
    >
      <InitialRfcCommandsStore
        initialEventsString={events}
        rfcId="testRfcId"
        instance="the one in LocalCliSpecServiceLoader"
      >
        <LocalRfcStore specService={specService}>
          {props.children}
        </LocalRfcStore>
      </InitialRfcCommandsStore>
    </SpecServiceStore>
  );
}

async function createExampleSpecServiceFactory(data) {
  let events = JSON.stringify(data.events);

  const examples = data.examples || {};
  const eventEmitter = new EventEmitter();

  const captureId = 'example-session';

  const specService = {
    eventEmitter,
    getConfig: async function () {
      return Promise.resolve({
        config: {
          apiName: 'Example API',
        },
      });
    },
    listCapturedSamples: async (captureId) => {
      return Promise.resolve(data.session);
    },
    listEvents() {
      return Promise.resolve(events);
    },
    getCaptureStatus() {
      return Promise.resolve({
        status: 'completed',
      });
    },
    listCaptures() {
      return Promise.resolve({
        captures: [
          { captureId, lastUpdate: new Date().toISOString(), hasDiff: true },
        ],
      });
    },
    saveEvents: (eventStore, rfcId) => {
      const serializedEvents = eventStore.serializeEvents(rfcId);
      events = serializedEvents;
      eventEmitter.emit('events-updated');
    },
    listExamples: (requestId) => {
      return Promise.resolve({ examples: examples[requestId] || [] });
    },
    saveExample: (interaction, requestId) => {
      const requestExamples = examples[requestId] || [];
      requestExamples.push(interaction);
      examples[requestId] = requestExamples;
    },
  };

  return { specService };
}
