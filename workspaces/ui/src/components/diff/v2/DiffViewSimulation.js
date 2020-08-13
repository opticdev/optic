import React from 'react';
import {
  CompareEquality,
  DiffResultHelper,
  getOrUndefined,
  JsonHelper,
} from '@useoptic/domain';
import SimulatedCommandContext from '../SimulatedCommandContext';
import { RfcContext, withRfcContext } from '../../../contexts/RfcContext';
import DiffHunkViewer from './DiffHunkViewer';

class _DiffViewSimulation extends React.Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const update =
      !CompareEquality.betweenBodyDiff(
        nextProps.diff || undefined,
        this.props.diff || undefined
      ) ||
      !CompareEquality.betweenSuggestions(
        nextProps.selectedInterpretation || undefined,
        this.props.selectedInterpretation || undefined
      ) ||
      !CompareEquality.betweenInteractions(
        nextProps.interactionScala || undefined,
        this.props.interactionScala || undefined
      ) ||
      !nextProps.renderDiff !== this.props.renderDiff;

    return update;
  }

  render() {
    const {
      outerRfcState,
      renderDiff,
      diff,
      description,
      interactionScala,
      body,
      selectedInterpretation,
      rfcId,
      eventStore,
    } = this.props;

    const renderKey = 'render ' + diff.diff.toString() + interactionScala.uuid;

    if (renderDiff) {
      const simulatedCommands = selectedInterpretation
        ? JsonHelper.seqToJsArray(selectedInterpretation.commands)
        : [];

      return (
        <div key={renderKey}>
          <SimulatedCommandContext
            rfcId={rfcId}
            eventStore={eventStore.getCopy(rfcId)}
            commands={simulatedCommands}
            shouldSimulate={true}
          >
            <RfcContext.Consumer>
              {({ rfcService, rfcId }) => {
                const currentRfcState = rfcService.currentState(rfcId);

                console.time('Making preview ' + renderKey);
                let preview = DiffResultHelper.previewDiff(
                  diff,
                  interactionScala,
                  currentRfcState
                );
                console.timeEnd('Making preview ' + renderKey);
                return (
                  <DiffHunkViewer
                    suggestion={selectedInterpretation}
                    diff={diff}
                    preview={getOrUndefined(preview)}
                    diffDescription={description}
                  />
                );
              }}
            </RfcContext.Consumer>
          </SimulatedCommandContext>
        </div>
      );
    } else {
      return (
        <div key={renderKey}>
          <DiffHunkViewer
            exampleOnly
            preview={getOrUndefined(
              DiffResultHelper.previewBody(body, outerRfcState)
            )}
          />
        </div>
      );
    }
  }
}

export const DiffViewSimulation = withRfcContext(_DiffViewSimulation);
