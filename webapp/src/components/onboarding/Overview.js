import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { withRfcContext } from '../../contexts/RfcContext';
import { getNameWithFormattedParameters, getParentPathId } from '../utilities/PathUtilities';
import sortBy from 'lodash.sortby';
import { fuzzyConceptFilter, fuzzyPathsFilter } from '../navigation/Search';
import ApiOverview from '../../stories/doc-mode/ApiOverview';
import {specService} from '../../services/SpecService';
import EmptySpec from '../../stories/doc-mode/EmptySpec';


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
  }

  componentDidMount() {
    const {specService} = this.props
    if (specService) {
      specService.listSessions().then( ({sessions}) => {
        this.setState({hasSessions: sessions.length > 0})
      })
    }
  }

  render() {
    const { classes, cachedQueryResults, mode, handleCommand, queries, baseUrl } = this.props;
    const { apiName, contributions, conceptsById, pathsById, pathIdsWithRequests, requestIdsByPathId } = cachedQueryResults;
    const { specService, notificationAreaComponent } = this.props
    const concepts = Object.values(conceptsById).filter(i => !i.deprecated);
    const sortedConcepts = sortBy(concepts, ['name']);
    const pathTree = flattenPaths('root', pathsById);

    const conceptsFiltered = fuzzyConceptFilter(sortedConcepts, '');
    const pathIdsFiltered = fuzzyPathsFilter(pathTree, '');
    const pathTreeFiltered = flattenPaths('root', pathsById, 0, '', pathIdsFiltered)

    const providesSpecService = !!specService
    const isEmptySpec = Object.entries(conceptsById).length === 0 && Object.entries(requestIdsByPathId).length === 0

    if (providesSpecService && isEmptySpec && !this.state.hasSession) {
      return <EmptySpec />
    }

    return (
      <div className={classes.overview}>
        <ApiOverview
          notificationAreaComponent={notificationAreaComponent}
          isEmptySpec={isEmptySpec}
          paths={pathTreeFiltered}
          concepts={conceptsFiltered}
          baseUrl={baseUrl} />
      </div>
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
      const [childId, childPath] = i;
      return getParentPathId(childPath) === id;
    }).map(i => {
      const [childId, childPath] = i;
      return flattenPaths(childId, paths, depth + 1, fullNew, filteredIds);
    });


  const visible = filteredIds ? (filteredIds.includes(id) || (children.some((i => i.visible)))) : null

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
