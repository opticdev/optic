import React from 'react';
import { GenericContextFactory } from '../../../contexts/GenericContextFactory';
import { withRequestTabsContext } from '../../docs/ContentTabs';

const {
  Context: DiffContext,
  withContext: withDiffContext,
} = GenericContextFactory();

class _DiffContextStore extends React.Component {
  state = {
    isFinishing: false,
  };

  render() {
    const {
      acceptSuggestion,
      acceptedSuggestions,
      diffsForThisEndpoint,
      completed,
    } = this.props;

    // const setIsFinishing = (bool) => this.setState({isFinishing: bool});

    const context = {
      diffsForThisEndpoint,
      completed,
      isFinishing: this.state.isFinishing,

      clearPreview: () => {
        this.setState({
          exampleInteractions: [],
          isFinishing: false,
        });
      },
      reset: () => {
        this.props.reset();
        this.setState({
          exampleInteractions: [],
          isFinishing: false,
        });
      },

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
