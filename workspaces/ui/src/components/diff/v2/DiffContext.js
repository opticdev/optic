import React from 'react';
import { GenericContextFactory } from '../../../contexts/GenericContextFactory';
import { withRequestTabsContext } from '../../docs/ContentTabs';

const {
  Context: DiffContext,
  withContext: withDiffContext,
} = GenericContextFactory();

class _DiffContextStore extends React.Component {
  state = {
    selectedDiff: null,
    selectedInterpretation: null,
    isFinishing: false,
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.diffId !== this.props.diffId) {
      this.setState({
        selectedDiff: null,
        selectedInterpretation: null,
      });
    }
  }

  render() {
    const {
      setSuggestionToPreview,
      acceptSuggestion,
      acceptedSuggestions,
      setTabTo,
      diffsForThisEndpoint,
    } = this.props;

    const setSelectedDiff = (diff) => {
      this.setState({
        selectedDiff: diff || null,
        selectedInterpretation: null,
      });
    };

    const setSelectedInterpretation = (interpretation) => {
      setSuggestionToPreview(interpretation);
      this.setState({ selectedInterpretation: interpretation });
    };

    // const setIsFinishing = (bool) => this.setState({isFinishing: bool});

    const context = {
      diffsForThisEndpoint,
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
          isFinishing: false,
        });
      },
      reset: () => {
        this.props.reset();
        this.setState({
          selectedDiff: null,
          exampleInteractions: [],
          selectedInterpretation: null,
          selectedInterpretationIndex: null,
          isFinishing: false,
        });
      },

      selectedInterpretation: this.state.selectedInterpretation,
      setSelectedInterpretation,
      acceptSuggestion,
      acceptedSuggestions,
    };

    return (
      <DiffContext.Provider value={context}>
        {this.props.children}
      </DiffContext.Provider>
    );
  }
}

const DiffContextStore = withRequestTabsContext(_DiffContextStore);

export { DiffContext, withDiffContext, DiffContextStore };
