import React from 'react';
import {GenericContextFactory} from './GenericContextFactory';
import uuidv4 from 'uuid/v4';
import {withRfcContext} from './RfcContext';
import sortBy from 'lodash.sortby';
import {getNameWithFormattedParameters, getParentPathId} from '../components/utilities/PathUtilities';
import FuzzySearch from 'fuzzy-search';
import * as uniqBy from 'lodash.uniqby';

const clientSessionId = uuidv4();
const clientId = 'anonymous';

const {
  Context: ApiOverviewContext,
  withContext: withApiOverviewContext
} = GenericContextFactory({clientSessionId, clientId});


class ApiOverviewContextStoreWithoutContext extends React.Component {
  render() {
    const {
      specService,
      cachedQueryResults,
    } = this.props;

    const {conceptsById, pathsById, requestIdsByPathId} = cachedQueryResults;

    const concepts = Object.values(conceptsById).filter(i => !i.deprecated);
    const sortedConcepts = sortBy(concepts, ['name']);
    const pathTree = flattenPaths('root', pathsById);

    const isEmptySpec = Object.entries(conceptsById).length === 0 && Object.entries(requestIdsByPathId).length === 0;
    const conceptsFiltered = fuzzyConceptFilter(sortedConcepts, '');
    const pathIdsFiltered = fuzzyPathsFilter(pathTree, '');
    const pathTreeFiltered = flattenPaths('root', pathsById, 0, '', pathIdsFiltered);
    const allPaths = [pathTreeFiltered, ...pathTreeFiltered.children];
    const operationsToRender = uniqBy(flatMapOperations(allPaths, cachedQueryResults), 'requestId');

    const context = {
      apiOverview: {
        isEmptySpec,
        allPaths,
        operationsToRender,
        pathTree: pathTreeFiltered,
        concepts: conceptsFiltered
      }
    };

    return (
      <ApiOverviewContext.Provider value={context}>
        {this.props.children}
      </ApiOverviewContext.Provider>
    );
  }
}

const ApiOverviewContextStore = withRfcContext(ApiOverviewContextStoreWithoutContext);

export {
  ApiOverviewContext,
  withApiOverviewContext,
  ApiOverviewContextStore
};


function flattenPaths(id, paths, depth = 0, full = '', filteredIds) {
  const path = paths[id];
  let name = '/' + getNameWithFormattedParameters(path);

  if (name === '/') {
    name = '';
  }

  const fullNew = full + name;

  const children = Object.entries(paths)
    .filter(i => {
      // eslint-disable-next-line no-unused-vars
      const [childId, childPath] = i;
      return getParentPathId(childPath) === id;
    }).map(i => {
      // eslint-disable-next-line no-unused-vars
      const [childId, childPath] = i;
      return flattenPaths(childId, paths, depth + 1, fullNew, filteredIds);
    });


  const visible = filteredIds ? (filteredIds.includes(id) || (children.some((i => i.visible)))) : null;

  return {
    name,
    full: full,
    toggled: depth < 2,
    children: sortBy(children, 'name'),
    depth,
    searchString: `${full}${name}`.split('/').join(' '),
    pathId: id,
    visible
  };
}


function fuzzyPathsFilter(paths, query) {

  function flattenAll(all, a = []) {
    all.forEach(i => {
      a.push(i);
      flattenAll(i.children, a);
    });
  }

  const allPaths = [];
  flattenAll(paths.children, allPaths);

  const searcher = new FuzzySearch(allPaths, ['searchString', 'name'], {sort: true}, {
    caseSensitive: false,
  });

  const pathIds = searcher.search(query).map(i => i.pathId);
  return pathIds;
}

function fuzzyConceptFilter(concepts, query) {
  const searcher = new FuzzySearch(concepts, ['name'], {sort: true}, {
    caseSensitive: false,
  });

  return searcher.search(query);
}

export function flatMapOperations(children, cachedQueryResults) {
  return children.flatMap(path => {
    const requests = cachedQueryResults.requestIdsByPathId[path.pathId] || [];
    return requests.map(id => {
      return {
        requestId: id,
        request: cachedQueryResults.requests[id],
        path
      };
    }).concat(flatMapOperations(path.children, cachedQueryResults));
  });
}
