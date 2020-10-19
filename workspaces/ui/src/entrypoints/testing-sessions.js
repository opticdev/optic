import React from 'react';
import { useParams, useRouteMatch, matchPath } from 'react-router-dom';
import { ApiSpecServiceLoader } from '../components/loaders/ApiLoader';
import {
  Provider as DebugSessionContextProvider,
  useMockSession,
} from '../contexts/MockDataContext';
import { ApiRoutes } from '../routes';
import { Provider as BaseUrlContext } from '../contexts/BaseUrlContext';
import {
  ExampleCaptureService,
  ExampleDiffService,
} from '../services/diff/ExampleDiffService';
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

  const captureServiceFactory = async (specService, captureId) => {
    return new ExampleCaptureService(specService);
  };

  const diffServiceFactory = async (
    specService,
    captureService,
    _events,
    _rfcState,
    additionalCommands,
    config,
    captureId
  ) => {
    async function computeInitialDiff() {
      const capture = await specService.listCapturedSamples(captureId);
      const commandContext = new RfcCommandContext(
        'simulated',
        'simulated',
        'simulated'
      );

      const {
        resolvers,
        rfcState,
      } = cachingResolversAndRfcStateFromEventsAndAdditionalCommands(
        _events,
        commandContext,
        additionalCommands
      );
      const a = DiffHelpers;
      let diffs = DiffHelpers.emptyInteractionPointersGroupedByDiff();
      for (const interaction of capture.samples) {
        diffs = DiffHelpers.groupInteractionPointerByDiffs(
          resolvers,
          rfcState,
          JsonHelper.fromInteraction(interaction),
          interaction.uuid,
          diffs
        );
      }
      return {
        diffs,
        rfcState,
        resolvers,
      };
    }

    const { diffs, rfcState } = await computeInitialDiff();

    return new ExampleDiffService(
      specService,
      captureService,
      config,
      diffs,
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
          <ApiRoutes />
        </ApiSpecServiceLoader>
      </DebugSessionContextProvider>
    </BaseUrlContext>
  );
}
