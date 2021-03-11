import React, { useEffect, useRef, useState } from 'react';
import { useMockData } from '../../contexts/MockDataContext';
import { SpecServiceStore } from '../../contexts/SpecServiceContext';
import { LinearProgress } from '@material-ui/core';
import { LocalRfcStore, RfcStore } from '../../contexts/RfcContext';
import { InitialRfcCommandsStore } from '../../contexts/InitialRfcCommandsContext';
import EventEmitter from 'events';
import { RfcCommandContext } from '@useoptic/domain';
import { cachingResolversAndRfcStateFromEventsAndAdditionalCommands } from '@useoptic/domain-utilities';
import { AnalyticsContextStore } from '../../utilities/useAnalyticsHook';

export function ApiSpecServiceLoader(props) {
  const debugData = useMockData();

  const specService = useSpecService(debugData);
  const [events, setEvents] = useState(null);
  const loadingExampleDiff = useLoadExampleDiff(specService);

  useEffect(() => {
    if (specService) {
      const task = async () => {
        const events = await specService.listEvents();
        setEvents(events);
      };
      specService.eventEmitter.on('events-updated', () => {
        task();
      });
      task();
    }
  }, [specService]);

  useEffect(() => {
    if (specService) {
      function onEventAppended(newEvents) {
        setEvents([...events, ...newEvents]);
      }

      specService.eventEmitter.on('events-appended', onEventAppended);

      return function cleanup() {
        specService.eventEmitter.removeListener(
          'events-appended',
          onEventAppended
        );
      };
    }
  }, [specService]);

  const captureServiceFactory = useCaptureServiceFactory(loadingExampleDiff);
  const diffServiceFactory = useDiffServiceFactory(loadingExampleDiff);

  if (!events) {
    return <LinearProgress />;
  }

  return (
    <SpecServiceStore
      specService={specService}
      specServiceEvents={specService.eventEmitter}
      diffServiceFactory={diffServiceFactory}
      captureServiceFactory={captureServiceFactory}
    >
      <AnalyticsContextStore specService={specService}>
        <InitialRfcCommandsStore
          initialEventsString={events}
          rfcId="testRfcId"
          instance="the one in ApiSpecServiceLoader"
        >
          <RfcStore specService={specService}>{props.children}</RfcStore>
        </InitialRfcCommandsStore>
      </AnalyticsContextStore>
    </SpecServiceStore>
  );
}

export function LocalCliSpecServiceLoader(props) {
  const { diffServiceFactory, captureServiceFactory } = props;
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
      diffServiceFactory={diffServiceFactory}
      captureServiceFactory={captureServiceFactory}
    >
      <AnalyticsContextStore specService={specService}>
        <InitialRfcCommandsStore
          initialEventsString={events}
          rfcId="testRfcId"
          instance="the one in LocalCliSpecServiceLoader"
        >
          <LocalRfcStore specService={specService}>
            {props.children}
          </LocalRfcStore>
        </InitialRfcCommandsStore>
      </AnalyticsContextStore>
    </SpecServiceStore>
  );
}

function useSpecService(debugData) {
  const [service, setService] = useState(null);
  useEffect(() => {
    if (debugData.available && debugData.loading) return;

    const serviceFactory = () =>
      createExampleSpecServiceFactory(debugData.data);

    const task = async () => {
      const { specService } = await serviceFactory();
      setService(specService);
    };
    task();
  }, [debugData.available, debugData.loading]);

  return service;
}

function useLoadExampleDiff() {
  // produce a Promise that resolves with example diff instance
  const resolveExampleDiff = useRef(null);

  const loadingRef = useRef(
    !resolveExampleDiff.current
      ? new Promise((resolve) => {
          resolveExampleDiff.current = resolve;
        })
      : null
  );

  useEffect(() => {
    let createExampleDiff = async () => {
      const { ExampleDiff } = await import(
        '../../services/diff/ExampleDiffService'
      );
      let diff = new ExampleDiff();

      resolveExampleDiff.current(diff);
      resolveExampleDiff.current = null;
    };

    createExampleDiff();
  }, []);

  return loadingRef.current;
}

function useCaptureServiceFactory(loadingExampleDiff) {
  const factoryRef = useRef(async (specService) => {
    const [{ ExampleCaptureService }, exampleDiff] = await Promise.all([
      import('../../services/diff/ExampleDiffService'),
      loadingExampleDiff,
    ]);

    return new ExampleCaptureService(specService, exampleDiff);
  });

  return factoryRef.current;
}

function useDiffServiceFactory(loadingExampleDiff) {
  const factoryRef = useRef(
    async (
      specService,
      captureService,
      _events,
      _rfcState,
      additionalCommands,
      config
    ) => {
      const commandContext = new RfcCommandContext(
        'simulated',
        'simulated',
        'simulated'
      );
      const {
        rfcState,
      } = cachingResolversAndRfcStateFromEventsAndAdditionalCommands(
        _events,
        commandContext,
        additionalCommands
      );

      const [{ ExampleDiffService }, exampleDiff] = await Promise.all([
        import('../../services/diff/ExampleDiffService'),
        loadingExampleDiff,
      ]);

      return new ExampleDiffService(
        exampleDiff,
        specService,
        captureService,
        config,
        [],
        rfcState
      );
    }
  );

  return factoryRef.current;
}

export const captureId = 'example-session';
export async function createExampleSpecServiceFactory(data) {
  let events = JSON.stringify(data.events);
  let DiffEngine = await import('@useoptic/diff-engine-wasm/engine/browser');

  const examples = data.examples || {};
  const eventEmitter = new EventEmitter();

  const ignoreRequests = [];

  const config = {
    config: {
      name: 'Example API',
      ignoreRequests,
    },
    configRaw:
      'name: Todo API\ntasks:\n  start:\n    command: npm run server-start\n    inboundUrl: http://localhost:3005',
  };

  const specService = {
    eventEmitter,
    loadConfig: async function () {
      return Promise.resolve(config);
    },
    saveConfig: async function (config) {
      config.configRaw = config;
      return Promise.resolve();
    },
    addIgnoreRule: async (rule) => {
      ignoreRequests.push(rule);
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
      return Promise.resolve();
    },
    saveEventsArray: (serializedEvents) => {
      events = JSON.stringify(serializedEvents);
      eventEmitter.emit('events-updated');
      return Promise.resolve();
    },
    listExamples: (requestId) => {
      return Promise.resolve({ examples: examples[requestId] || [] });
    },
    saveExample: (interaction, requestId) => {
      const requestExamples = examples[requestId] || [];
      requestExamples.push(interaction);
      examples[requestId] = requestExamples;
    },

    getEnabledFeatures() {
      return {
        TESTING_DASHBOARD:
          process.env.REACT_APP_TESTING_DASHBOARD === 'true' ||
          process.env.REACT_APP_TESTING_DASHBOARD === true,
      };
    },
    processCommands(commands, commitMessage) {
      let spec = DiffEngine.spec_from_events(events);
      let newEventsJson = DiffEngine.append_batch_to_spec(
        spec,
        JSON.stringify(commands),
        commitMessage
      );
      let newEvents = JSON.parse(newEventsJson);

      events = JSON.stringify([...JSON.parse(events), ...newEvents]);
      eventEmitter.emit('events-updated');

      // eventEmitter.emit('events-appended', newEvents);
      return Promise.resolve(newEvents);
    },
  };

  return { specService };
}
