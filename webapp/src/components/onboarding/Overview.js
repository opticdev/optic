import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {withRfcContext} from '../../contexts/RfcContext';
import {getNameWithFormattedParameters, getParentPathId} from '../utilities/PathUtilities';
import sortBy from 'lodash.sortby';
import ApiOverview from '../navigation/ApiOverview';
import EmptySpec from '../navigation/EmptySpec';
import FuzzySearch from 'fuzzy-search';
import Navbar from '../navigation/Navbar';
import {MarkdownRender} from '../requests/DocContribution';
import EmptySpecWithSession from '../navigation/EmptySpecWithSession';


const styles = theme => ({
  overview: {
    padding: 22,
    display: 'flex',
    width: '95%',
    marginTop: 22,
    marginBottom: 140,
    flexDirection: 'column',
    height: 'fit-content',
  },
});


class OverView extends React.Component {

  state = {
    hasSession: true,
  };

  componentDidMount() {
    const {specService} = this.props;
    if (specService) {
      specService.listSessions().then(({sessions}) => {
        this.setState({hasSessions: sessions.length > 0});
      });
    }
  }

  render() {
    const {classes, cachedQueryResults, baseUrl} = this.props;
    const {conceptsById, pathsById, requestIdsByPathId} = cachedQueryResults;
    const {specService, notificationAreaComponent, addExampleComponent} = this.props;
    const concepts = Object.values(conceptsById).filter(i => !i.deprecated);
    const sortedConcepts = sortBy(concepts, ['name']);
    const pathTree = flattenPaths('root', pathsById);

    const conceptsFiltered = fuzzyConceptFilter(sortedConcepts, '');
    const pathIdsFiltered = fuzzyPathsFilter(pathTree, '');
    const pathTreeFiltered = flattenPaths('root', pathsById, 0, '', pathIdsFiltered);

    const providesSpecService = !!specService;
    const isEmptySpec = Object.entries(conceptsById).length === 0 && Object.entries(requestIdsByPathId).length === 0;

    if (providesSpecService && isEmptySpec && !this.state.hasSession) {
      return <EmptySpec/>;
    }

    return (
      <>
        <Navbar color="primary" notifications={notificationAreaComponent} addExample={addExampleComponent}/>
        {/*{providesSpecService && isEmptySpec ? (<EmptySpecWithSession />) : null}*/}
        <div className={classes.overview}>
          <ApiOverview
            isEmptySpec={isEmptySpec}
            paths={pathTreeFiltered}
            concepts={conceptsFiltered}
            baseUrl={baseUrl}/>
        </div>
      </>
    );
  }
}

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

export default withRfcContext(withStyles(styles)(OverView));


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
