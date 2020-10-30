import { createShapeDiffMachine } from '../interactive-diff-machine';
import {
  DiffSessionSessionContext,
  DiffSessionSessionEvent,
  DiffSessionSessionStateSchema,
  newDiffSessionSessionMachine,
  sendMessageToEndpoint,
} from '../diff-session';
import sortby from 'lodash.sortby';
import { stuffFromQueries } from '../../contexts/RfcContext';
import { InteractiveSessionConfig } from '../interfaces/session';
import { useEffect, useMemo, useState } from 'react';
import { interpret, Interpreter, Machine, StateMachine } from 'xstate';
import { IDiff } from '../interfaces/diffs';
import { ParsedDiff } from '../parse-diff';
import { createEndpointDescriptor } from '../../utilities/EndpointUtilities';
import {
  InteractiveEndpointSessionContext,
  InteractiveEndpointSessionEvent,
  InteractiveEndpointSessionStateSchema,
} from '../interactive-endpoint';
import { useActor } from '@xstate/react';
import { ActorRefLike } from '@xstate/react/es/types';
import { diff } from 'react-ace';
import { useSingleDiffMachine } from './diff-hook';
import { IIgnoreRule } from '../interpretors/ignores/IIgnoreRule';

export function useEndpointDiffMachine(
  pathId: string,
  method: string,
  getSelf: () => any,
  services: InteractiveSessionConfig
) {
  const [state, send] = useActor<InteractiveEndpointSessionEvent>(getSelf());
  const context: InteractiveEndpointSessionContext = state.context;
  const value = state.value;

  const endpointDescriptor = useMemo(
    () =>
      createEndpointDescriptor(
        { method, pathId },
        stuffFromQueries(services.rfcBaseState.queries)
      ),
    []
  );

  function createActions() {
    return {
      prepare: () => {
        send({ type: 'PREPARE' });
      },
      handledUpdated: () => {
        send({ type: 'HANDLED_UPDATED' });
      },
      addIgnoreRule: (newRule: IIgnoreRule) => {
        send({ type: 'ADD_IGNORE', newRule });
      },
    };
  }

  function createQueries() {
    return {
      handledByDiffHash: () => context.handledByDiffHash,
      newRegionDiffs: () => context.newRegions,
      shapeDiffs: () => context.shapeDiffs,
      getDiffActor: (diffHash) => {
        const entry =
          context.newRegions.find((i) => i.diffParsed.diffHash === diffHash) ||
          context.shapeDiffs.find((i) => i.diffParsed.diffHash === diffHash);
        if (entry) {
          return entry.ref;
        }
      },
      groupDiffsByLocation: () => {
        const { newRegions, shapeDiffs } = context;

        const copiedRequestBodies = JSON.parse(
          JSON.stringify(endpointDescriptor.requestBodies)
        );
        const copiedResponseBodies = JSON.parse(
          JSON.stringify(endpointDescriptor.responses)
        );

        const requests = copiedRequestBodies.map((req) => {
          const contentType =
            req.requestBody && req.requestBody.httpContentType;
          return {
            ...req,
            location: ['Request', 'Body', contentType],
            diffs: shapeDiffs.filter((i) => {
              const location = i.diffParsed.location(services.rfcBaseState);
              return (
                location.inRequest &&
                location.inRequest.contentType === contentType
              );
            }),
          };
        });

        const responses = copiedResponseBodies.map((res) => {
          const contentType =
            res.responseBody && res.responseBody.httpContentType;
          const statusCode = res && res.statusCode;
          return {
            ...res,
            location: [`${statusCode} Response`, 'Body', contentType],
            diffs: shapeDiffs.filter((i) => {
              const location = i.diffParsed.location(services.rfcBaseState);
              return (
                location.inResponse &&
                location.inResponse.statusCode === statusCode &&
                location.inResponse.contentType === contentType
              );
            }),
          };
        });

        return {
          requests: sortby(
            requests,
            (req) => req.requestBody && req.requestBody.httpContentType
          ),
          responses: sortby(
            responses,
            (res) =>
              res.statusCode.toString() + res.responseBody &&
              res.responseBody.httpContentType
          ),
          newRequests: newRegions
            .filter(
              (i) => !!i.diffParsed.location(services.rfcBaseState).inRequest
            )
            .map((i) => {
              return {
                //@ts-ignore
                location: ['Request', 'Body', i.contentType],
                diffs: [{ ...i }],
              };
            }),
          newResponses: newRegions
            .filter(
              (i) => !!i.diffParsed.location(services.rfcBaseState).inResponse
            )
            .map((i) => {
              return {
                //@ts-ignore
                location: [`${i.statusCode} Response`, 'Body', i.contentType],
                diffs: [{ ...i }],
              };
            }),
        };
      },
    };
  }

  const actions = createActions();
  const queries = createQueries();

  return {
    value,
    context,
    actions,
    queries,
    makeDiffActorHook: (diffHash: string) => () => {
      const { ref, diffParsed }: { ref: any; diffParsed: ParsedDiff } =
        context.shapeDiffs.find((i) => i.diffParsed.diffHash === diffHash) ||
        context.newRegions.find((i) => i.diffParsed.diffHash === diffHash);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useSingleDiffMachine(
        diffParsed,
        () => ref,
        () => actions,
        services
      );
    },
  };
}
