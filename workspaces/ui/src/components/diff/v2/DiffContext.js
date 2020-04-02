import React from 'react';
import {GenericContextFactory} from '../../../contexts/GenericContextFactory';
import {DiffToggleStates, withDiffToggleContext} from './DiffShapeViewer';
import {withRequestTabsContext} from './ContentTabs';

const {
  Context: DiffContext,
  withContext: withDiffContext
} = GenericContextFactory();


class _DiffContextStore extends React.Component {

  state = {
    selectedDiff: null,
    selectedInterpretation: null,
    isFinishing: false
  };


  render() {
    const {
      endpointDiffManger,
      setSuggestionToPreview,
      acceptSuggestion,
      acceptedSuggestions,
      setTabTo
    } = this.props;

    const setSelectedDiff = (diff) => {
      this.setState({selectedDiff: diff || null, selectedInterpretation: null})
    };
    const setSelectedInterpretation = (interpretation) => {
      setSuggestionToPreview(interpretation);
      this.setState({selectedInterpretation: interpretation});
    };

    // const setIsFinishing = (bool) => this.setState({isFinishing: bool});

    const context = {
      endpointDiffManger,
      // regions,
      // getDiffDescription,
      // getInteractionsForDiff,
      //selected diff
      selectedDiff: this.state.selectedDiff,
      setSelectedDiff,
      isFinishing: this.state.isFinishing,

      // setIsFinishing,
      clearPreview: () => {
        this.setState({
          selectedDiff: null,
          exampleInteractions: [],
          selectedInterpretation: null,
          selectedInterpretationIndex: null,
          isFinishing: false
        });
      },
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

      selectedInterpretation: this.state.selectedInterpretation,
      setSelectedInterpretation,
      acceptSuggestion,
      acceptedSuggestions
    };

    return (
      <DiffContext.Provider value={context}>
        {this.props.children}
      </DiffContext.Provider>
    );
  }
}

const DiffContextStore = withRequestTabsContext(withDiffToggleContext(_DiffContextStore))

export {
  DiffContext,
  withDiffContext,
  DiffContextStore
};
