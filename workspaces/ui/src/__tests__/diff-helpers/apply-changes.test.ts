import { loadsDiffsFromUniverse } from './fixture';
import { IAllChanges, IChanges } from '../../engine/hooks/session-hook';
import { newApplyChangesMachine } from '../../engine/async-work/apply-changes-machine';
import { interpret } from 'xstate';

test('can async work properly', async (done) => {
  const {
    diffs,
    captureService,
    diffService,
    rfcBaseState,
  } = await loadsDiffsFromUniverse('./universes/empty-todo/universe.json');

  const patch: IAllChanges = {
    added: [
      { pathExpression: '/api/todos/:todoId', method: 'GET', count: 0 },
      { pathExpression: '/api/todos/:todoId/profile', method: 'GET', count: 0 },
    ],
    changes: [],
  };

  const machine = newApplyChangesMachine(patch, {
    captureService,
    diffService,
    rfcBaseState,
  });

  const running = interpret(machine);

  running.onTransition((state) => {
    console.log(state.value);
    // console.log(state.context);
  });
  running.start();
  running.send('START');

  setTimeout(() => {
    done();
  }, 4000);
});
