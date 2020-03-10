import React from 'react'
import {GenericContextFactory} from './GenericContextFactory';

const {
  Context: SpecServiceContext,
  withContext: withSpecServiceContext
} = GenericContextFactory(null);

class SpecServiceStore extends React.Component {

  state = {
    apiName: ''
  }

  componentDidMount() {
    const {specService, specServiceEvents} = this.props;
    specService.getConfig().then(({config}) => this.setState({apiName: config.name}))
    if (!specServiceEvents) {
      console.warn('I need specServiceEvents')
      debugger
    } else {
      specServiceEvents.on('events-updated', () => {
        this.forceUpdate()
      })
    }
  }

  render() {
    const {specService} = this.props;

    return (
      <SpecServiceContext.Provider value={{specService, apiName: this.state.apiName}}>
        {this.props.children}
      </SpecServiceContext.Provider>
    );
  }
}

export {
  withSpecServiceContext,
  SpecServiceContext,
  SpecServiceStore
};
