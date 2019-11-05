import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Editor from '../navigation/Editor';
import { withRfcContext } from '../../contexts/RfcContext';
import { getNameWithFormattedParameters, getParentPathId } from '../utilities/PathUtilities';
import sortBy from 'lodash.sortby';
import { fuzzyConceptFilter, fuzzyPathsFilter } from '../navigation/Search';
import ApiOverview from '../../stories/doc-mode/ApiOverview';


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
  render() {
    const { classes, cachedQueryResults, mode, handleCommand, queries, baseUrl } = this.props;
    const { apiName, contributions, conceptsById, pathsById, pathIdsWithRequests } = cachedQueryResults;

    const concepts = Object.values(conceptsById).filter(i => !i.deprecated);
    const sortedConcepts = sortBy(concepts, ['name']);
    const pathTree = flattenPaths('root', pathsById);

    const conceptsFiltered = fuzzyConceptFilter(sortedConcepts, '');
    const pathIdsFiltered = fuzzyPathsFilter(pathTree, '');
    const pathTreeFiltered = flattenPaths('root', pathsById, 0, '', pathIdsFiltered)


    return (
        <div className={classes.overview}>
          <ApiOverview paths={pathTreeFiltered}
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
