import React from 'react';
import { useParams, useRouteMatch, matchPath } from 'react-router-dom';
import { ApiSpecServiceLoader } from '../components/loaders/ApiLoader';
import {
  Provider as DebugSessionContextProvider,
  useMockSession,
} from '../contexts/MockDataContext';
import { ApiRoutes } from '../routes';
import { Provider as BaseUrlContext } from '../contexts/BaseUrlContext';
import { DiffHelpers, JsonHelper, RfcCommandContext } from '@useoptic/domain';
import {
  cachingResolversAndRfcStateFromEventsAndAdditionalCommands,
  normalizedDiffFromRfcStateAndInteractions,
} from '@useoptic/domain-utilities';

export default function TestingSessions(props) {
  const match = useRouteMatch();
  const { sessionId } = useParams();

  const session = useMockSession({
    sessionId: sessionId,
    exampleSessionCollection: 'example-sessions',
  });

  // let exampleDiff;

  // const captureServiceFactory = async (specService, captureId) => {
  //   const { ExampleDiff, ExampleCaptureService } = await import(
  //     '../services/diff/ExampleDiffService'
  //   );

  //   if (!exampleDiff) exampleDiff = new ExampleDiff();

  //   return new ExampleCaptureService(specService, exampleDiff);
  // };

  // const diffServiceFactory = async (
  //   specService,
  //   captureService,
  //   _events,
  //   _rfcState,
  //   additionalCommands,
  //   config
  // ) => {
  //   const commandContext = new RfcCommandContext(
  //     'simulated',
  //     'simulated',
  //     'simulated'
  //   );
  //   const {
  //     rfcState,
  //   } = cachingResolversAndRfcStateFromEventsAndAdditionalCommands(
  //     _events,
  //     commandContext,
  //     additionalCommands
  //   );

  //   const { ExampleDiff, ExampleDiffService } = await import(
  //     '../services/diff/ExampleDiffService'
  //   );

  //   if (!exampleDiff) exampleDiff = new ExampleDiff();

  //   return new ExampleDiffService(
  //     exampleDiff,
  //     specService,
  //     captureService,
  //     config,
  //     [],
  //     rfcState
  //   );
  // };

  return (
    <BaseUrlContext value={{ path: match.path, url: match.url }}>
      <DebugSessionContextProvider value={session}>
        <ApiSpecServiceLoader>
          <ApiRoutes />
        </ApiSpecServiceLoader>
      </DebugSessionContextProvider>
    </BaseUrlContext>
  );
}
