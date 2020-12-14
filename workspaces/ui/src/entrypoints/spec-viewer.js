import React from 'react';
import { useParams, useRouteMatch, matchPath } from 'react-router-dom';
import { ApiSpecServiceLoader } from '../components/loaders/ApiLoader';
import { useSpecSession } from '../contexts/SpecViewerContext';
import { Provider as DebugSessionContextProvider } from '../contexts/MockDataContext';
import { ApiRoutes } from '../routes';
import { Provider as BaseUrlContext } from '../contexts/BaseUrlContext';
// import {
//   ExampleCaptureService,
//   ExampleDiffService,
// } from '../services/diff/ExampleDiffService';
import { DiffHelpers, JsonHelper, RfcCommandContext } from '@useoptic/domain';
import {
  cachingResolversAndRfcStateFromEventsAndAdditionalCommands,
  normalizedDiffFromRfcStateAndInteractions,
} from '@useoptic/domain-utilities';

export default function SpecViewer(props) {
  const match = useRouteMatch();
  const { specId } = useParams();

  const session = useSpecSession(specId);

  let exampleDiff;

  const captureServiceFactory = async (specService, captureId) => {
    const { ExampleDiff, ExampleCaptureService } = await import(
      '../services/diff/ExampleDiffService'
    );

    if (!exampleDiff) exampleDiff = new ExampleDiff();

    return new ExampleCaptureService(specService, exampleDiff);
  };

  const diffServiceFactory = async (
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

    const { ExampleDiff, ExampleDiffService } = await import(
      '../services/diff/ExampleDiffService'
    );

    if (!exampleDiff) exampleDiff = new ExampleDiff();

    return new ExampleDiffService(
      exampleDiff,
      specService,
      captureService,
      config,
      [],
      rfcState
    );
  };

  return (
    <BaseUrlContext value={{ path: match.path, url: match.url }}>
      <DebugSessionContextProvider value={session}>
        <ApiSpecServiceLoader
          captureServiceFactory={captureServiceFactory}
          diffServiceFactory={diffServiceFactory}
        >
          <ApiRoutes defaultRoute={(options) => options.docsRoot} />
        </ApiSpecServiceLoader>
      </DebugSessionContextProvider>
    </BaseUrlContext>
  );
}
