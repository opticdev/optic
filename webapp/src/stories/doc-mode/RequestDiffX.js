import React, { useState } from 'react';
import { withTrafficAndDiffSessionContext } from '../../contexts/TrafficAndDiffSessionContext';
import {Interpreters, JsonHelper, RequestDiffer, ShapesCommands, toInteraction} from '../../engine';
import { RfcContext, withRfcContext } from '../../contexts/RfcContext';
import DiffPage from './DiffPage';
import { PathIdToPathString } from './PathIdToPathString';
import SimulatedCommandContext from '../../components/diff/SimulatedCommandContext';
import { DiffToDiffCard } from './DiffCopy';
import PreCommit from './PreCommit';
import { withNavigationContext } from '../../contexts/NavigationContext';
import compose from 'lodash.compose';
import {NamerStore} from './shape/Namer';

class RequestDiffX extends React.Component {

  render() {
    const { baseUrl } = this.props;
    const { match } = this.props;
    const { specService } = this.props;
    const { diffStateProjections, diffSessionManager, rfcService, eventStore, rfcId } = this.props;
    const { diffState } = diffSessionManager;
    const { requestId } = match.params;
    const rfcState = rfcService.currentState(rfcId);
    const compoundInterpreter = new Interpreters.CompoundInterpreter(rfcState.shapesState);

    const { sampleItemsWithResolvedPaths } = diffStateProjections;
    const matchingSampleItems = sampleItemsWithResolvedPaths.filter(i => i.requestId === requestId);

    const startableSampleItems = matchingSampleItems.filter(x => diffSessionManager.isStartable(diffState, x));
    //if the diff for this request is finished, show Approve/Discard Modal

    for (let item of startableSampleItems) {
      const interaction = toInteraction(item.sample);
      const diffIterator = JsonHelper.iteratorToJsIterator(RequestDiffer.compare(interaction, rfcState));

      const diff = { [Symbol.iterator]: () => diffIterator };
      for (let diffItem of diff) {
        const allInterpretations = JsonHelper.seqToJsArray(compoundInterpreter.interpret(diffItem));
        return this.renderWrapped(item, (
          <DiffPageStateManager
            item={item}
            diff={diffItem}
            diffSessionManager={diffSessionManager}
            interpretations={allInterpretations} />
        ));
      }
    }

    return (
      <PreCommit
        taggedIds={diffSessionManager.getTaggedIds()}
        requestId={requestId}
        onSave={async () => {
          const examples = diffSessionManager.listExamplesToAdd();
          diffSessionManager.reset();
          await specService.saveEvents(eventStore, rfcId)
          await Promise.all(
            [...examples]
              .map((exampleItem) => {
                return specService.saveExample(exampleItem.sample, exampleItem.requestId)
              })
          )

          this.props.pushRelative('')
        }}
        onDiscard={() => {
          window.location.href = baseUrl;
        }}
      />)

    /*
     Approve button handleCommands
     interpreation commands fed into

     <SimulatedCommandContext
        shouldSimulate={true}
        rfcId={rfcId}
        eventStore={eventStore}
        commands={commands}
      >


     */
  }

  renderWrapped(item, child) {

    const { diffSessionManager } = this.props;

    const handleCommands = (...commands) => {
      this.props.handleCommands(...commands);
      diffSessionManager.acceptCommands(item, commands);
      return diffSessionManager.tagIds
    };

    const { children, ...rest } = this.props; // @GOTCHA assumes withRfcContext on parent component

    const rfcContext = {
      ...rest,
      handleCommands,
      handleCommand: handleCommands,
    };

    return (
      <RfcContext.Provider value={rfcContext}>
        {child}
      </RfcContext.Provider>
    );
  }

}

const DiffPageStateManager = withRfcContext((props) => {
  const {
    item,
    diff,
    interpretations,
    handleCommands: applyCommands,
    rfcId,
    diffSessionManager,
    eventStore,
    queries
  } = props;
  const [interpretationIndex, setInterpretationIndex] = useState(0);

  const interpretation = interpretations[interpretationIndex]
  const commands = interpretation ? JsonHelper.seqToJsArray(interpretation.commands) : [];
  const { sample, pathId, requestId, index } = item;

  const diffCard = DiffToDiffCard(diff, queries)

  return (
    <SimulatedCommandContext
      shouldSimulate={true}
      rfcId={rfcId}
      eventStore={eventStore}
      commands={commands}
    >
      <NamerStore nameShape={(shapeId, name) => {
        applyCommands(...[
          ShapesCommands.RenameShape(shapeId, name)
        ])
      }}>
      <DiffPage
        //request context
        url={sample.request.url}
        path={<PathIdToPathString pathId={pathId} />}
        method={sample.request.method}
        requestId={requestId}

        //diff / interpretations
        diff={diffCard}
        interpretation={interpretation}
        interpretationsLength={interpretations.length}
        interpretationsIndex={interpretationIndex}
        setInterpretationIndex={setInterpretationIndex}
        applyCommands={applyCommands}

        //observation
        observed={{
          statusCode: sample.response.statusCode,
          requestContentType: sample.request.headers['content-type'],
          requestBody: sample.request.body,
          responseContentType: sample.response.headers['content-type'],
          responseBody: sample.response.body
        }}

        //control
        onSkip={() => {
          diffSessionManager.skipInteraction(index)
        }}
      />
      </NamerStore>
    </SimulatedCommandContext>
  );
});


export default compose(
  withTrafficAndDiffSessionContext,
  withNavigationContext,
  withRfcContext
)(RequestDiffX);
