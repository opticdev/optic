import * as React from 'react';
import {commandsToJson, Facade, Queries, RfcCommandContext} from '@useoptic/domain';
import {GenericContextFactory} from './GenericContextFactory.js';
import {withInitialRfcCommandsContext} from './InitialRfcCommandsContext.js';
import debounce from 'lodash.debounce';
import {useSnackbar, VariantType, withSnackbar} from 'notistack';
import uuidv4 from 'uuid/v4';
import {CommandContext, withCommandContext} from './CommandContext';
import memoize from 'memoize-weak';
import {InitialRfcCommandsContext} from './InitialRfcCommandsContext';
import {useContext, useEffect, useState} from 'react';

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

  const endpoints = queries.endpoints()
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
    endpoints,
    pathIdsWithRequests,
    shapesState
  };
  return cachedQueryResults;
}

function BaseRfcStore(props) {
  const {clientId, clientSessionId} = useContext(CommandContext);
  const initialRfcInput = useContext(InitialRfcCommandsContext);
  const [error, setError] = useState(null);
  const [x, setX] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
  const {initialCommandsString, initialEventsString, rfcId} = initialRfcInput;

  console.log({updateCount});

  useEffect(function () {
    try {
      const eventStore = Facade.makeEventStore();
      global.eventStore = eventStore
      if (initialEventsString) {
        eventStore.bulkAdd(rfcId, initialEventsString);
      }
      const batchId = 'initial-batch';
      const commandContext = new RfcCommandContext(clientId, clientSessionId, batchId);
      const rfcService = Facade.fromJsonCommands(eventStore, rfcId, initialCommandsString || '[]', commandContext);
      setX({rfcService, eventStore});
    } catch (e) {
      setError(e);
    }

  }, [initialCommandsString, initialEventsString]);
  if (!x) {
    return null;
  }

  if (error) {
    console.error(error);
    return (
      <div>Error! :(</div>
    );
  }
  const {rfcService, eventStore} = x;
  const initialEventStore = (props.initialEventStore || eventStore).getCopy(rfcId);

  function handleCommands(...commands) {
    const batchId = uuidv4();
    const commandContext = new RfcCommandContext(clientId, clientSessionId, batchId);

    try {
      rfcService.handleCommands(rfcId, commandContext, ...commands);
      setUpdateCount((c) => c + 1);
      if (props.handleChange) {
        props.handleChange({
          rfcId,
          eventStore,
          rfcService,
        });
      }
    } catch (e) {
      setError(e);
    }
  }

  const handleCommand = handleCommands;

  const queries = Queries(eventStore, rfcService, rfcId);
  const cachedQueryResults = stuffFromQueries(queries);
  const {specService} = props;
  const value = {
    specService,
    rfcId,
    clientSessionId,
    clientId,
    rfcService,
    initialEventStore,
    eventStore,
    queries,
    cachedQueryResults,
    handleCommand,
    handleCommands,
  };
  return (
    <RfcContext.Provider value={value}>
      {props.children}
    </RfcContext.Provider>
  );
}


const RfcStore = BaseRfcStore;

function LocalRfcStore(props) {
  const {enqueueSnackbar} = useSnackbar();
  const {specService} = props;

  async function handleChange({eventStore, rfcId}) {
    try {
      const response = await specService.saveEvents(eventStore, rfcId);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }
    } catch (e) {
      enqueueSnackbar('Unable to save changes. Please make sure the CLI is still running.', {variant: 'error'});
    }
  }

  return (
    <RfcStore onChange={debounce(handleChange, 4000, {leading: true, trailing: true})}>
      {props.children}
    </RfcStore>
  );
}

function ImmutableRfcStore(props) {
  return (
    <RfcStore onChange={() => console.log('not mutable')}>
      {props.children}
    </RfcStore>
  );
}



const LocalDiffRfcStore = BaseRfcStore;

export {
  RfcStore,
  ImmutableRfcStore,
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
