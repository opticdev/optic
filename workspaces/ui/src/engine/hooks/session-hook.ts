import { createShapeDiffMachine } from '../interactive-diff-machine';
import {
  DiffSessionSessionContext,
  DiffSessionSessionEvent,
  DiffSessionSessionStateSchema,
  newDiffSessionSessionMachine,
  nextEndpointToFocusOn,
  sendMessageToEndpoint,
} from '../diff-session';
import { InteractiveSessionConfig } from '../interfaces/session';
import { useEffect, useMemo, useState } from 'react';
import {
  EventData,
  interpret,
  Interpreter,
  Machine,
  SingleOrArray,
  State,
  StateMachine,
} from 'xstate';
import { IDiff } from '../interfaces/diffs';
import { ParsedDiff } from '../parse-diff';
import { useEndpointDiffMachine } from './endpoint-hook';
import { createEndpointDescriptor } from '../../utilities/EndpointUtilities';
import { stuffFromQueries } from '../../contexts/RfcContext';
import { useMachine } from '@xstate/react';
export function useDiffSessionMachine(
  diffId: string,
  services: InteractiveSessionConfig
) {
  // const machine: Interpreter<
  //   DiffSessionSessionContext,
  //   DiffSessionSessionStateSchema,
  //   DiffSessionSessionEvent
  // > = useMemo(() => {
  //   console.log('spinning up diff machine with id ' + diffId);
  //   const m = interpret(newDiffSessionSessionMachine(diffId, services), {
  //     devTools: true,
  //   });
  //   m.start();
  //   return m;
  // }, []);

  const [state, send] = useMachine(
    newDiffSessionSessionMachine(diffId, services),
    {
      devTools: true,
    }
  );

  const cachedQueriesResults = useMemo(
    () => stuffFromQueries(services.rfcBaseState.queries),
    []
  );

  function createActions() {
    return {
      signalDiffCompleted(rawDiffs: [IDiff, string[]][]) {
        send({
          type: 'COMPLETED_DIFF',
          diffs: rawDiffs.map(
            ([diff, interactions]) => new ParsedDiff(diff, interactions)
          ),
        });
      },
      signalHandled(pathId, method) {
        send({ type: 'HANDLED_UPDATED', pathId, method });
      },
      selectNextEndpoint: (endpointsWithDiffs: any[]) => {
        const next = nextEndpointToFocusOn(state.context, endpointsWithDiffs);
        if (next) {
          send({
            type: 'SELECTED_ENDPOINT',
            pathId: next.pathId,
            method: next.method,
          });
        }
      },
      selectEndpoint: (pathId, method) =>
        send({ type: 'SELECTED_ENDPOINT', pathId, method }),
    };
  }

  function createQueries() {
    const { context, value } = state;
    return {
      handledByEndpoint: () => context.handledByEndpoint,
      hasEndpoint: (method, pathId) =>
        !!context.endpoints.find(
          (i) => i.pathId === pathId && i.method === method
        ),
      selectedEndpoint: () => context.focus,
      selectedEndpointHandled: () => {
        const value =
          context.focus &&
          context.handledByEndpoint.find(
            (i) =>
              i.pathId === context.focus.pathId &&
              i.method === context.focus.method
          );
        return (
          value && value.diffCount === value.handled && value.diffCount > 0
        );
      },
      sessionState: () => value,
      totalDiffs: () => context.endpoints.reduce((a, c) => a + c.diffCount, 0),
      endpointSections: () => {
        const makeEndpoint = ({ pathId, method, diffCount }) => ({
          pathId,
          method,
          diffCount: diffCount || 0,
        });

        const diffEndpoints = context.endpoints;
        return {
          endpointsNoDiff: services.rfcBaseState.queries
            .endpoints()
            .filter((i) =>
              diffEndpoints.find(
                (d) => d.pathId === i.pathId && d.method === i.pathId
              )
            )
            .map(makeEndpoint),
          endpointsWithDiffs: context.endpoints.map((i) =>
            makeEndpoint({ ...i })
          ),
        };
      },
      getEndpointDescriptor: ({ method, pathId }) => {
        return createEndpointDescriptor(
          { method, pathId },
          cachedQueriesResults
        );
      },
      makeUseEndpoint: (pathId: string, method: string) => () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEndpointDiffMachine(
          pathId,
          method,
          createActions,
          () => {
            const endpoint = context.endpoints.find(
              (i) => i.pathId === pathId && i.method === method
            );
            return endpoint.ref;
          },
          services
        ),
    };
  }

  return {
    value: state.value,
    context: state.context,
    queries: createQueries(),
    actions: createActions(),
  };
}
