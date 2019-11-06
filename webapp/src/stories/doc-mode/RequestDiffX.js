import React, {useState} from 'react';
import {withTrafficAndDiffSessionContext} from '../../contexts/TrafficAndDiffSessionContext';
import {isStartable} from '../../components/diff/LocalDiffManager';
import {Interpreters, JsonHelper, RequestDiffer, toInteraction} from '../../engine';
import {RfcContext, withRfcContext} from '../../contexts/RfcContext';
import DiffPage from './DiffPage';
import {PathIdToPathString} from './PathIdToPathString';
import SimulatedCommandContext from '../../components/diff/SimulatedCommandContext';
import {DiffToDiffCard} from './DiffCopy';

class RequestDiffX extends React.Component {

  render() {
    const {match, diffStateProjections, diffSessionManager, rfcService, eventStore, rfcId, queries} = this.props;
    const {diffState} = diffSessionManager;
    const {requestId} = match.params;
    const rfcState = rfcService.currentState(rfcId);
    const compoundInterpreter = new Interpreters.CompoundInterpreter(rfcState.shapesState);

    const {sampleItemsWithResolvedPaths} = diffStateProjections;
    const matchingSampleItems = sampleItemsWithResolvedPaths.filter(i => i.requestId === requestId);

    const startableSampleItems = matchingSampleItems.filter(x => isStartable(diffState, x));
    //if the diff for this request is finished, show Approve/Discard Modal

    for (let item of startableSampleItems) {
      const interaction = toInteraction(item.sample);
      const diffIterator = JsonHelper.iteratorToJsIterator(RequestDiffer.compare(interaction, rfcState));

      const diff = {[Symbol.iterator]: () => diffIterator};
      for (let diffItem of diff) {
        const allInterpretations = JsonHelper.seqToJsArray(compoundInterpreter.interpret(diffItem));
        // return this.renderWrapped(item, this.renderStandardDiffWidget(item, diffItem, otherInterpretations))
        return this.renderWrapped(item, (
          <DiffPageStateManager
            item={item}
            diff={diffItem}
            interpretations={allInterpretations}/>
        ));
      }
    }


    return <>YOU DONE BOY</>

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

    const {diffSessionManager} = this.props;

    const handleCommands = (...commands) => {
      this.props.handleCommands(...commands);
      diffSessionManager.acceptCommands(commands);
    };

    const {children, ...rest} = this.props; // @GOTCHA assumes withRfcContext on parent component

    const rfcContext = {
      ...rest,
      handleCommands,
      handleCommand: handleCommands
    };

    return (
      <RfcContext.Provider value={rfcContext}>
        {child}
      </RfcContext.Provider>
    );
  }

}

const DiffPageStateManager = withRfcContext(({
                                               item,
                                               diff,
                                               interpretations,
                                               handleCommands: applyCommands,
                                               rfcId,
                                               eventStore,
                                               queries}) => {

  const [interpretationIndex, setInterpretationIndex] = useState(0);

  const interpretation = interpretations[interpretationIndex]
  const commands = interpretation ? JsonHelper.seqToJsArray(interpretation.commands) : [];
  const {sample, pathId, requestId} = item;

  const diffCard = DiffToDiffCard(diff, queries)

  return (
    <SimulatedCommandContext
      shouldSimulate={true}
      rfcId={rfcId}
      eventStore={eventStore}
      commands={commands}
    >
      <DiffPage
        url={sample.request.url}
        path={<PathIdToPathString pathId={pathId}/>}
        method={sample.request.method}
        requestId={requestId}

        diff={diffCard}
        interpretation={interpretation}
        interpretationsLength={interpretations.length}
        interpretationsIndex={interpretationIndex}
        setInterpretationIndex={setInterpretationIndex}
        applyCommands={applyCommands}

        observed={{
          statusCode: sample.response.statusCode,
          requestContentType: sample.request.headers['content-type'],
          requestBody: sample.request.body,
          responseContentType: sample.response.headers['content-type'],
          responseBody: sample.response.body
        }}
      />
    </SimulatedCommandContext>
  );
});


export default withTrafficAndDiffSessionContext(withRfcContext(RequestDiffX));
