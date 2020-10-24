import { makeUniverse } from './universes/makeUniverse';
import { interpret } from 'xstate';
import { createNewAsyncMachine } from '../../engine/async-work/async-work-machines';
import {
  InteractiveEndpointSessionContext,
  newInteractiveEndpointSessionMachine,
} from '../../engine/interactive-endpoint';
import { DiffSet } from '../../engine/diff-set';
import { ParsedDiff } from '../../engine/parse-diff';
import { loadsDiffsFromUniverse } from './fixture';

test('xstate lifecycle for endpoint with region diffs', async (done) => {
  const {
    diffs,
    captureService,
    diffService,
    rfcBaseState,
  } = await loadsDiffsFromUniverse('./universes/simple-todo/universe.json');

  const pathId = 'path_it2OyjUysW';
  const method = 'GET';
  const diffsForEndpoint = diffs.forEndpoint(pathId, method).iterator(); // known to have region diffs

  const machine = newInteractiveEndpointSessionMachine(
    pathId,
    method,
    diffsForEndpoint,
    {
      rfcBaseState,
      captureService,
      diffService,
    }
  );

  const endpointMachine = interpret(machine);
  endpointMachine.start();

  expect(endpointMachine.state.value === 'unfocused');
  endpointMachine.send({ type: 'PREPARE' });

  const isReadyContext: InteractiveEndpointSessionContext = await new Promise(
    (resolve) =>
      endpointMachine.onTransition((state) => {
        if (state.value === 'ready') resolve(state.context);
      })
  );

  expect(isReadyContext.newRegions.length).toBe(2);
  expect(isReadyContext.shapeDiffs.length).toBe(0);
  expect(isReadyContext.learningContext).toBeDefined();

  // if endpoint is read, all new regions should also be ready shortly
  await Promise.all(
    isReadyContext.newRegions.map((i) => {
      i.ref.onTransition((state) => {
        return new Promise(
          (resolve) => i.ref.state.value.ready === 'unhandled' && resolve()
        );
      });
    })
  );

  done();
});

test('xstate lifecycle for endpoint with shape diffs', async (done) => {
  const {
    diffs,
    captureService,
    diffService,
    rfcBaseState,
  } = await loadsDiffsFromUniverse('./universes/simple-todo/universe.json');

  const pathId = 'path_UOIsxzICu5';
  const method = 'GET';
  const diffsForEndpoint = diffs.forEndpoint(pathId, method).iterator(); // known to have shape diffs

  const machine = newInteractiveEndpointSessionMachine(
    pathId,
    method,
    diffsForEndpoint,
    {
      rfcBaseState,
      captureService,
      diffService,
    }
  );

  const endpointMachine = interpret(machine);
  endpointMachine.start();

  expect(endpointMachine.state.value === 'unfocused');
  endpointMachine.send({ type: 'PREPARE' });

  const isReadyContext: InteractiveEndpointSessionContext = await new Promise(
    (resolve) =>
      endpointMachine.onTransition((state) => {
        if (state.value === 'ready') resolve(state.context);
      })
  );

  expect(isReadyContext.newRegions.length).toBe(0);
  expect(isReadyContext.shapeDiffs.length).toBe(2);
  expect(isReadyContext.learningContext).toBeDefined();

  // if endpoint is read, all new shape should also be ready shortly
  await Promise.all(
    isReadyContext.shapeDiffs.map((i) => {
      i.ref.onTransition((state) => {
        return new Promise(
          (resolve) => i.ref.state.value.ready === 'unhandled' && resolve()
        );
      });
    })
  );

  done();
});
