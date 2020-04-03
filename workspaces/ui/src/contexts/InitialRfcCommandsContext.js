import * as React from 'react';
import {GenericContextFactory} from './GenericContextFactory.js';

const {
  Context: InitialRfcCommandsContext,
  withContext: withInitialRfcCommandsContext
} = GenericContextFactory(null);
global.devlog2 = []
class InitialRfcCommandsStore extends React.Component {
  render() {
    const {rfcId, initialCommandsString, initialEventsString} = this.props;
    global.devlog2.push({
      instance: this.props.instance,
      e: initialEventsString && initialEventsString.length,
      c: initialCommandsString && initialCommandsString.length,
      initialEventsString,
      initialCommandsString
    })
    return (
      <InitialRfcCommandsContext.Provider value={{rfcId, initialCommandsString, initialEventsString}}>
        {this.props.children}
      </InitialRfcCommandsContext.Provider>
    );
  }
}

export {
  InitialRfcCommandsStore,
  InitialRfcCommandsContext,
  withInitialRfcCommandsContext
};
