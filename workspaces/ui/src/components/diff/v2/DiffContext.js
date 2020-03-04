import React from 'react';
import {GenericContextFactory} from '../../../contexts/GenericContextFactory';
import events from 'events';

const {
  Context: DiffContext,
  withContext: withDiffContext
} = GenericContextFactory();


export const DiffUIEventEmitter = new events.EventEmitter();
export const DiffUIEventEmitterEvents = {
  'SHOW_EXAMPLE_WHEN_POSSIBLE': 'SHOW_EXAMPLE_WHEN_POSSIBLE',
  'SHOW_SPEC_WHEN_POSSIBLE': 'SHOW_SPEC_WHEN_POSSIBLE',
};

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
    exampleInteractions: [],
    selectedInterpretation: null,
    selectedInterpretationIndex: null,
    isFinishing: false
  };


  render() {
    const {
      regions,
      getInteractionsForDiff,
      interpretationsForDiffAndInteraction,
      getDiffDescription,
      setSuggestionToPreview,
      acceptSuggestion,
      acceptedSuggestions,
    } = this.props;


    const setSelectedDiff = (diff) => {
      global.opticDebug.diff = diff;
      this.setState({
        selectedDiff: diff,
        exampleInteractions: getInteractionsForDiff(diff),
        currentExampleIndex: 0,
        selectedInterpretation: null,
        selectedInterpretationIndex: null
      }, () => {

        setSuggestionToPreview(null);
        if (diff) {
          DiffUIEventEmitter.emit(DiffUIEventEmitterEvents.SHOW_EXAMPLE_WHEN_POSSIBLE);
        }
      });
    };
    const setSelectedInterpretation = (interpretation, index) => {
      setSuggestionToPreview(interpretation);
      this.setState({
        selectedInterpretation: interpretation,
      }, () => {
        if (interpretation) {
          DiffUIEventEmitter.emit(DiffUIEventEmitterEvents.SHOW_SPEC_WHEN_POSSIBLE);
        }
      });
    };

    const setIsFinishing = (bool) => this.setState({isFinishing: bool});

    const context = {
      regions,
      getDiffDescription,
      getInteractionsForDiff,
      //selected diff
      selectedDiff: this.state.selectedDiff,
      selectedDiffId: this.state.selectedDiff && this.state.selectedDiff.diffHash,
      setSelectedDiff,

      isFinishing: this.state.isFinishing,
      setIsFinishing,
      reset: () => {
        this.props.reset();
        this.setState({
          selectedDiff: null,
          exampleInteractions: [],
          selectedInterpretation: null,
          selectedInterpretationIndex: null,
          isFinishing: false
        });
      },

      currentExample: this.state.exampleInteractions[this.state.currentExampleIndex],
      interpretationsForDiffAndInteraction,

      //selected interpretation
      selectedInterpretation: this.state.selectedInterpretation,
      setSelectedInterpretation,
      acceptSuggestion,
      acceptedSuggestions
      // simulate: approved + selectedInterpretation.commands
    };

    return (
      <DiffContext.Provider value={context}>
        {this.props.children}
      </DiffContext.Provider>
    );
  }
}

export {
  DiffContext,
  withDiffContext,
  DiffContextStore
};
