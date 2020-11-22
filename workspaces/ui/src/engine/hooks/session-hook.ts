import { DiffContext } from '../interactive-diff-machine';
import {
  IEndpointWithStatus,
  newDiffSessionSessionMachine,
  nextEndpointToFocusOn,
} from '../diff-session';
import { InteractiveSessionConfig } from '../interfaces/session';
import { useMemo } from 'react';

import { IDiff } from '../interfaces/diffs';
import { ParsedDiff } from '../parse-diff';
import { useEndpointDiffMachine } from './endpoint-hook';
import { createEndpointDescriptor } from '../../utilities/EndpointUtilities';
import { stuffFromQueries } from '../../contexts/RfcContext';
import { useMachine } from '@xstate/react';
import { IUnrecognizedUrl } from '../../services/diff';
import { IToDocument } from '../interfaces/interfaces';
import { InteractiveEndpointSessionContext } from '../interactive-endpoint';
import { ISuggestion } from '../interfaces/interpretors';

export function useDiffSessionMachine(
  diffId: string,
  services: InteractiveSessionConfig
) {
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
      signalDiffCompleted(
        rawDiffs: [IDiff, string[]][],
        unrecognizedUrls: IUnrecognizedUrl[]
      ) {
        send({
          type: 'COMPLETED_DIFF',
          urls: unrecognizedUrls,
          diffs: rawDiffs.map(
            ([diff, interactions]) => new ParsedDiff(diff, interactions)
          ),
        });
      },
      resetAll(endpointsWithDiffs: any[]) {
        endpointsWithDiffs.forEach(({ pathId, method }) => {
          send({
            type: 'SEND_TO_ENDPOINT',
            pathId,
            method,
            event: { type: 'RESET' },
          });
        });

        const first = endpointsWithDiffs[0];
        if (first) {
          send({
            type: 'SELECTED_ENDPOINT',
            pathId: first.pathId,
            method: first.method,
          });
        }
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
      updateToDocument: (toDocument: IToDocument[], handled: number) => {
        const existing = state.context.unrecognizedUrlsToDocument;
        if (
          existing.handled !== handled ||
          existing.urls.length !== toDocument.length
        ) {
          send({ type: 'UPDATED_TO_DOCUMENT', toDocument, handled });
        }
      },
      toggleUndocumented: (active: boolean) =>
        send({ type: 'TOGGLED_UNDOCUMENTED', active }),
      selectEndpoint: (pathId, method) =>
        send({ type: 'SELECTED_ENDPOINT', pathId, method }),
    };
  }

  function createQueries() {
    const { context, value } = state;
    return {
      undocumentedUrls: () => context.unrecognizedUrls,
      handledUndocumented: () => context.unrecognizedUrlsToDocument.handled,
      showingUndocumented: () => context.showingUndocumented,
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
      endpointsWithSuggestions: (): IAllChanges => {
        return {
          changes: context.endpoints.map((i) => ({
            pathId: i.pathId,
            method: i.method,
            status: getApprovedSuggestions(i),
          })),
          added: context.unrecognizedUrlsToDocument.urls,
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

export type IChanges = {
  ignored: boolean;
  approvedSuggestion: ISuggestion;
  tag: string;
  isHandled: boolean;
  didReview: boolean;
}[];

export type IAllChanges = {
  added: IToDocument[];
  changes: { method: string; pathId: string; status: IChanges }[];
};

function getApprovedSuggestions(i: IEndpointWithStatus): IChanges {
  type EndpointDiffsInner = {
    context: DiffContext<any>;
    value: any;
  };
  const endpointState: InteractiveEndpointSessionContext = i.ref.state.context;

  const newRegions: EndpointDiffsInner[] = endpointState.newRegions.map(
    (diff) => diff.ref.state
  );
  const shapeDiffs: EndpointDiffsInner[] = endpointState.shapeDiffs.map(
    (diff) => diff.ref.state
  );

  function processEachDiff(
    tag: string
  ): (
    diff: EndpointDiffsInner
  ) => {
    ignored: boolean;
    approvedSuggestion: ISuggestion;
    tag: string;
    isHandled: boolean;
    didReview: boolean;
  } {
    return (diff: EndpointDiffsInner) => {
      const { context, value } = diff;
      const isHandled = (value.ready && value.ready === 'handled') || false;
      const ignored =
        (context.preview &&
          (context.preview.suggestions.length === 0 ||
            context.preview.tabs.length === 0)) ||
        false;

      const approvedSuggestion =
        !ignored &&
        isHandled &&
        context.preview.suggestions[context.selectedSuggestionIndex];

      return {
        tag,
        isHandled,
        ignored,
        didReview: isHandled || ignored,
        approvedSuggestion,
      };
    };
  }

  return [
    ...shapeDiffs.map(processEachDiff('shape')),
    ...newRegions.map(processEachDiff('region')),
  ];
}
