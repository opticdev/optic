import {
  ExampleCaptureService,
  ExampleDiffService,
} from '../../../services/diff/ExampleDiffService';
import {
  DiffHelpers,
  Facade,
  JsonHelper,
  RfcCommandContext,
} from '@useoptic/domain';
import {
  cachingResolversAndRfcStateFromEventsAndAdditionalCommands,
  universeFromEvents,
} from '@useoptic/domain-utilities';
import { createExampleSpecServiceFactory } from '../../../components/loaders/ApiLoader';
import { ICaptureService, IDiffService } from '../../../services/diff';
import {
  DiffRfcBaseState,
  makeDiffRfcBaseState,
} from '../../../engine/interfaces/diff-rfc-base-state';

export async function makeUniverse(
  json: any
): Promise<{
  specService: any;
  rawDiffs: any[];
  rfcBaseState: DiffRfcBaseState;
  diffServiceFactory: (
    specService,
    captureService,
    _events,
    _rfcState,
    additionalCommands,
    config,
    captureId
  ) => Promise<ExampleDiffService>;
  jsonUniverse: any;
  captureServiceFactory: () => Promise<ExampleCaptureService>;
  diffService: ExampleDiffService;
  captureService: ExampleCaptureService;
}> {
  const { specService } = await createExampleSpecServiceFactory(json);

  const captureServiceFactory = async () => {
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

  const services = {
    diffServiceFactory,
    captureServiceFactory,
    specService,
    jsonUniverse: json,
  };

  const captureService = await captureServiceFactory();
  const events = JSON.parse(await specService.listEvents());

  const diffService = await diffServiceFactory(
    specService,
    captureService,
    events,
    universeFromEvents(events).rfcState,
    [],
    await specService.loadConfig(),
    'simulated'
  );

  const { rawDiffs } = await diffService.listDiffs();

  const { eventStore, rfcId, rfcService } = universeFromEvents(events);

  return {
    ...services,
    rfcBaseState: makeDiffRfcBaseState(eventStore, rfcService, rfcId),
    captureService,
    diffService,
    rawDiffs,
  };
}
