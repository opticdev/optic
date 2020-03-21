import React from 'react';
import {InitialRfcCommandsStore} from '../../contexts/InitialRfcCommandsContext';
import {LocalDiffRfcStore} from '../../contexts/RfcContext';
import {commandsToJson} from '@useoptic/domain';
import {withSpecServiceContext} from '../../contexts/SpecServiceContext';
import compose from 'lodash.compose';
import sha1 from 'node-sha1';

class SimulatedCommandContext extends React.Component {
  render() {
    const {rfcId, eventStore, commands, shouldSimulate, specService} = this.props;
    const initialEventStore = eventStore.getCopy(rfcId);
    const initialEventsString = eventStore.serializeEvents(rfcId);
    const initialCommandsString = shouldSimulate ? JSON.stringify(commandsToJson(commands)) : null;
    const hash = sha1(`${initialEventsString}+${initialCommandsString}`);
    return (
      <InitialRfcCommandsStore
        rfcId={rfcId}
        initialEventsString={initialEventsString}
        initialCommandsString={initialCommandsString}>
        <LocalDiffRfcStore
          specService={specService}
          initialEventStore={initialEventStore}
          key={hash}
        >
          {this.props.children}
        </LocalDiffRfcStore>
      </InitialRfcCommandsStore>
    );
  }
}

export default compose(withSpecServiceContext)(SimulatedCommandContext);
