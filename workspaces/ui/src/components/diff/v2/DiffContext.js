import React from 'react';
import {GenericContextFactory} from '../../../contexts/GenericContextFactory';
import {DiffToggleStates, withDiffToggleContext} from './DiffShapeViewer';

const {
  Context: DiffContext,
  withContext: withDiffContext
} = GenericContextFactory();


class _DiffContextStore extends React.Component {

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
      setTabTo
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
          setTabTo(DiffToggleStates.EXAMPLE)
        }
      });
    };
    const setSelectedInterpretation = (interpretation, index) => {
      setSuggestionToPreview(interpretation);
      this.setState({
        selectedInterpretation: interpretation,
      }, () => {
        if (interpretation) {
          setTabTo(DiffToggleStates.SHAPE)
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

const DiffContextStore = withDiffToggleContext(_DiffContextStore)

export {
  DiffContext,
  withDiffContext,
  DiffContextStore
};
