import React from 'react';
import {GenericContextFactory} from '../../../contexts/GenericContextFactory';

const {
  Context: DiffContext,
  withContext: withDiffContext
} = GenericContextFactory()


const DiffUIEventEmitter = require('events');


/*
???s
- Will Diffs have a unique ID? hash?
  - Will also need to be grouped by part of the request that pertain to
- Will interpretations have an ID? Or just index?
- How will we group interactions by diffs? Will that be domain's concern?
- Can we ignore a diff? Where does that state have to live?


Map[Diff -> Vector[ApiInteraction]]
- Interpretations computed after selecting diff
 */

class DiffContextStore extends React.Component {

  state = {
    selectedDiff: null,
    selectedInterpretation: null,
    selectedInterpretationIndex: null,
  }

  render() {
    const {
      requestDiffs,
      requestInteractions,

    } = this.props;

    const diffsByGroup = (groupName) => requestDiffs.filter(i => i.group === groupName)
    const setSelectedDiff = (diff) => {

      this.setState({selectedDiff: diff, selectedInterpretation: null, selectedInterpretationIndex: null}, () => {
        // DiffUIEventEmitter.emit('ShowDiffExample')
      })
    }
    const setSelectedInterpretation = (interpretation, index) => {
      this.setState({selectedInterpretation: interpretation, selectedInterpretationIndex: index}, () => {
        // DiffUIEventEmitter.emit('ShowInterpretationShape')
      })
    }

    const context = {

      diffs: requestDiffs,
      diffsByGroup,

      //selected diff
      selectedDiff: this.state.selectedDiff,
      selectedDiffId: this.state.selectedDiff && this.state.selectedDiff.diffHash,
      setSelectedDiff,

      //selected interpretation
      selectedInterpretation: this.state.selectedInterpretation,
      selectedInterpretationIndex: this.state.selectedInterpretationIndex,
      setSelectedInterpretation

      // simulate: approved + selectedInterpretation.commands
    };

    return (
      <DiffContext.Provider value={context}>
        {this.props.children}
      </DiffContext.Provider>
    )
  }
}

export {
  DiffContext,
  withDiffContext,
  DiffContextStore
}
