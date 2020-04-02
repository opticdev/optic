import * as React from 'react';
import {commandsToJson, Facade, Queries, RfcCommandContext} from '@useoptic/domain';
import {GenericContextFactory} from './GenericContextFactory.js';
import {withInitialRfcCommandsContext} from './InitialRfcCommandsContext.js';
import debounce from 'lodash.debounce';
import {withSnackbar} from 'notistack';
import uuidv4 from 'uuid/v4';
import {withCommandContext} from './CommandContext';
import memoize from 'memoize-weak';

const {
  Context: RfcContext,
  withContext: withRfcContext
} = GenericContextFactory(null);

global.commands = [];
global.getCommandsAsJson = function () {
  return commandsToJson(global.commands);
};

export function stuffFromQueries(queries) {
  const apiName = queries.apiName();
  const contributions = queries.contributions();

  const {requests, pathComponents, responses, requestParameters} = queries.requestsState();
  const pathIdsByRequestId = queries.pathsWithRequests();
  const pathsById = pathComponents;
  // const absolutePaths = Object.keys(pathsById).map(pathId => ({ [pathId]: queries.absolutePath(pathId) })).reduce((acc, value) => Object.assign(acc, value), {})
  // console.log({ absolutePaths })
  const pathIdsWithRequests = new Set(Object.values(pathIdsByRequestId));

  const conceptsById = queries.namedShapes();
  const shapesState = queries.shapesState();

  const requestIdsByPathId = Object
    .entries(pathIdsByRequestId)
    .reduce((acc, entry) => {
      const [requestId, pathId] = entry;
      const value = acc[pathId] || [];
      value.push(requestId);
      acc[pathId] = value;
      return acc;
    }, {});
  queries.memoizedFlatShapeForExample = memoize((x, h, k) => {
    console.count('memoizedFlatShapeForExample');
    return queries.flatShapeForExample(x, h, k);
  });
  const cachedQueryResults = {
    apiName,
    contributions,
    requests,
    requestParameters,
    responses,
    responsesArray: Object.values(responses),
    conceptsById,
    pathIdsByRequestId,
    requestIdsByPathId,
    pathsById,
    pathIdsWithRequests,
    shapesState
  };
  return cachedQueryResults;
}

class RfcStoreWithoutContext extends React.Component {

  constructor(props) {
    super(props);
    //@todo Dev Doshi will refactor
    this.handleCommands = this.handleCommands.bind(this);
    const {initialCommandsString, initialEventsString, rfcId} = this.props;
    const eventStore = Facade.makeEventStore();
    console.count('make event store');
    global.eventStore = eventStore;
    if (initialEventsString) {
      //console.log({ bulkAdd: JSON.parse(initialEventsString) })
      eventStore.bulkAdd(rfcId, initialEventsString);
    }
    const initialEventStore = (props.initialEventStore || eventStore).getCopy(rfcId);
    global.initialEventStore = initialEventStore;
    const rfcService = (() => {
      const batchId = 'initial-batch';
      const {clientId, clientSessionId} = this.props;
      const commandContext = new RfcCommandContext(clientId, clientSessionId, batchId);

      try {
        //console.log(JSON.parse(initialCommandsString || '[]'))
        return Facade.fromJsonCommands(eventStore, rfcId, initialCommandsString || '[]', commandContext);
      } catch (e) {
        //@GOTCHA: eventStore is being mutated in the try{} so any commands that have succeeded will be part of eventStore here.
        console.error(e);
        // debugger;
        return Facade.fromJsonCommands(eventStore, rfcId, '[]', commandContext);
      }
    })();
    const queries = Queries(eventStore, rfcService, rfcId);

    this.state = {
      initialEventStore,
      eventStore,
      rfcService,
      queries,
      hasUnsavedChanges: false
    };
  }

  handleCommand = (command) => {
    this.handleCommands(command);
  };

  handleChange = debounce(() => {
    this.forceUpdate();
  }, 10, {leading: true});

  handleCommands(...commands) {
    const {clientId, clientSessionId} = this.props;
    if (!clientId || !clientSessionId) {
      console.warn('I need clientId and clientSessionId')
      debugger
    }
    const batchId = uuidv4();
    const commandContext = new RfcCommandContext(clientId, clientSessionId, batchId);

    try {
      //debugger
      this.state.rfcService.handleCommands(this.props.rfcId, commandContext, ...commands);
      global.commands.push(...commands);

      //console.log(this.state.eventStore.serializeEvents(this.props.rfcId));
      this.handleChange();
    } catch (e) {
      debugger
      console.error(e);
      //console.log(...commands);
      //console.log(commandsToJson(commands));
    }

    //commands.forEach(command => track('Command', { commandType: commandNameFor(command) }))
  }

  render() {
    const {queries, eventStore, initialEventStore, hasUnsavedChanges, rfcService} = this.state;
    const {rfcId, clientId, clientSessionId} = this.props;
    const {specService} = this.props;
    if (!specService) {
      console.warn('I need specService')
      debugger
    }
    const cachedQueryResults = stuffFromQueries(queries);
    const value = {
      rfcId,
      clientSessionId,
      clientId,
      rfcService,
      specService,
      initialEventStore,
      eventStore,
      queries,
      cachedQueryResults,
      handleCommand: this.handleCommand,
      handleCommands: this.handleCommands,
      hasUnsavedChanges
    };

    return (
      <RfcContext.Provider value={value}>
        {this.props.children}
      </RfcContext.Provider>
    );
  }
}

const RfcStore = withCommandContext(withInitialRfcCommandsContext(RfcStoreWithoutContext));


class LocalRfcStoreWithoutContext extends RfcStoreWithoutContext {

  handleCommands = (...commands) => {
    super.handleCommands(...commands);
    this.setState({hasUnsavedChanges: true});
    this.persistEvents();
  };

  persistEvents = debounce(async () => {
    const response = await this.props.specService.saveEvents(this.state.eventStore, this.props.rfcId);

    if (response.ok) {
      // this.props.enqueueSnackbar('Saved', { 'variant': 'success' })
      this.setState({hasUnsavedChanges: false});
    } else {
      this.props.enqueueSnackbar('Unable to save changes. Make sure the CLI is still running.', {'variant': 'error'});
    }

  }, 4000, {leading: true, trailing: true});
}

const LocalRfcStore = withSnackbar(withCommandContext(withInitialRfcCommandsContext(LocalRfcStoreWithoutContext)));

class LocalDiffRfcStoreWithoutContext extends RfcStoreWithoutContext {
  handleCommands = (...commands) => {
    super.handleCommands(...commands);
  };
}

const LocalDiffRfcStore = withCommandContext(withInitialRfcCommandsContext(LocalDiffRfcStoreWithoutContext));

export {
  RfcStore,
  LocalRfcStore,
  LocalDiffRfcStore,
  RfcContext,
  withRfcContext
};


// function commandNameFor(command) {
//     const name = command.$classData.name
//     const split = name.split('$')
//     return split[1]
// }
