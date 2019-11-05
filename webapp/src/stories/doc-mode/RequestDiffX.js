import React from 'react';
import {withTrafficAndDiffSessionContext} from '../../contexts/TrafficAndDiffSessionContext';
import {isStartable} from '../../components/diff/LocalDiffManager';
import {Interpreters, JsonHelper, RequestDiffer, toInteraction} from '../../engine';
import {RfcContext, withRfcContext} from '../../contexts/RfcContext';

class RequestDiffX extends React.Component {

  render() {
    const {match, diffStateProjections, diffSessionManager, rfcService, rfcId} = this.props;
    const {diffState} = diffSessionManager;
    const {requestId} = match.params;
    const rfcState = rfcService.currentState(rfcId);
    const compoundInterpreter = new Interpreters.CompoundInterpreter(rfcState.shapesState)

    const {sampleItemsWithResolvedPaths} = diffStateProjections;
    const matchingSampleItems = sampleItemsWithResolvedPaths.filter(i => i.requestId === requestId);

    const startableSampleItems = matchingSampleItems.filter(x => isStartable(diffState, x))
    //if the diff for this request is finished, show Approve/Discard Modal

    for (let item of startableSampleItems) {
      const interaction = toInteraction(item.sample);
      const diffIterator = JsonHelper.iteratorToJsIterator(RequestDiffer.compare(interaction, rfcState));

      const diff = {[Symbol.iterator]: () => diffIterator};
      for (let diffItem of diff) {
        const otherInterpretations = JsonHelper.seqToJsArray(compoundInterpreter.interpret(diffItem));
        // return this.renderWrapped(item, this.renderStandardDiffWidget(item, diffItem, otherInterpretations))
        return this.renderWrapped(item, <>HELLO</>)
      }
    }
  }

  renderWrapped(item, child) {

    const { diffSessionManager } = this.props;

    const handleCommands = (...commands) => {
      this.props.handleCommands(...commands)
      diffSessionManager.acceptCommands(commands)
    }

    const { children, ...rest } = this.props; // @GOTCHA assumes withRfcContext on parent component

    const rfcContext = {
      ...rest,
      handleCommands,
      handleCommand: handleCommands
    }

    return (
      <RfcContext.Provider value={rfcContext}>
        {child}
      </RfcContext.Provider>
    )
  }

}

export default withTrafficAndDiffSessionContext(withRfcContext(RequestDiffX))
