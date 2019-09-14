import React, {useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Editor, {FullSheetNoPaper} from '../navigation/Editor';
import {EditorModes, withEditorContext} from '../../contexts/EditorContext';
import {withRfcContext} from '../../contexts/RfcContext';
import {addAbsolutePath, getName, getNameWithFormattedParameters, getParentPathId} from '../utilities/PathUtilities';
import sortBy from 'lodash.sortby';
import Paper from '@material-ui/core/Paper';
import {RfcCommands, ShapeCommands} from '../../engine';
import ContributionTextField from '../contributions/ContributionTextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import Collapse from '@material-ui/core/Collapse';
import {Link} from 'react-router-dom';
import {routerUrls} from '../../routes';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import CreateNew from '../navigation/CreateNew';
import {primary} from '../../theme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Divider from '@material-ui/core/Divider';
import SearchBar, {fuzzyConceptFilter, fuzzyPathsFilter} from '../navigation/Search';

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
  innerPath: {
    padding: 8,
    border: '1px solid rgba(49,54,111,0.15)',
    borderRadius: 11,
    marginBottom: 16
  },
  chip: {
    backgroundColor: '#31366f',
    color: 'white',
  },
  innerContent: {
    backgroundColor: 'rgba(49,54,111,0.08)',
    padding: '5px 10px 5px 10px'
  },
  buttonRow: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 22
  },
  subView: {
    minHeight: 90,
    flex: 1,
    padding: 11
  },
  bareLink: {
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer'
  },
  apiNavigation: {
    display: 'flex',
    flexDirection: 'row'
  },
  searchRegion: {
    width: 600,
    textAlign: 'center',
    margin: '0 auto',
    marginBottom: 60
  }
});

const methodColors = {
  'GET': '#608c52',
  'POST': '#205B9B',
  'PUT': '#D56915',
  'PATCH': '#682189',
  'DELETE': '#E71D36',
};

const PathListItem = withRfcContext(({path, baseUrl, cachedQueryResults}) => {

  const {name, children, depth, toggled, pathId, full, visible} = path;
  const requests = cachedQueryResults.requestIdsByPathId[pathId] || [];

  const url = routerUrls.pathPage(baseUrl, pathId);

  const requestsWithMethods = requests.map(id => {
    return [id, cachedQueryResults.requests[id].requestDescriptor.httpMethod];
  });

  if (!visible) {
    return null;
  }

  return <div style={{flexDirection: 'row'}}>
    <div style={{flexDirection: 'row', display: 'flex', marginBottom: 9}}>
      <Link to={url} style={{color: 'inherit', textDecoration: 'none'}}>
        <Typography component="span" variant="subtitle2">
          <span style={{color: '#676767'}}>{full}</span>
          <span style={{fontWeight: 600}}>{name}</span>
        </Typography>
      </Link>
      <div style={{marginLeft: 16, marginTop: -1}}>
        {requestsWithMethods.map(i => {
          const method = i[1].toUpperCase();
          const color = methodColors[method] || primary;

          return <Link to={url + '#' + i[0]} style={{marginRight: 6, textDecoration: 'none'}}>
            <span style={{
              borderColor: color,
              border: '1px solid',
              color: color,
              fontSize: 10,
              padding: 2,
              paddingLeft: 5,
              paddingRight: 5,
              borderRadius: 3,
            }}>{i[1].toUpperCase()}</span>
          </Link>;
        })}
      </div>
    </div>
    {children.length ? (
      children.map(i => <PathListItem path={i} baseUrl={baseUrl}/>)
    ) : null}
  </div>;

});


class OverView extends React.Component {

  componentDidMount() {
    const {switchEditorMode} = this.props;
    const {pathIdsWithRequests} = this.props.cachedQueryResults;

    if (pathIdsWithRequests.size === 0) {
      setTimeout(() => {
        switchEditorMode(EditorModes.DESIGN);
      }, 1);
    }

  }

  state = {
    searchQuery: '',
  };

  render() {
    const {classes, cachedQueryResults, mode, handleCommand, queries, baseUrl} = this.props;
    const {apiName, contributions, conceptsById, pathsById, pathIdsWithRequests} = cachedQueryResults;

    const concepts = Object.values(conceptsById).filter(i => !i.deprecated);
    const sortedConcepts = sortBy(concepts, ['name']);
    const pathTree = flattenPaths('root', pathsById);

    const conceptsFiltered = fuzzyConceptFilter(sortedConcepts, this.state.searchQuery);
    const pathIdsFiltered = fuzzyPathsFilter(pathTree, this.state.searchQuery);

    const pathTreeFiltered = flattenPaths('root', pathsById, 0, '', pathIdsFiltered);

    const hideComponents = (pathTree.children.length === 0 && concepts.length === 0);

    return (
      <Editor>
        <div className={classes.overview}>

          <div className={classes.searchRegion}>
            <SearchBar apiName={apiName}
                       searchQuery={this.state.searchQuery}
                       onChange={(e) => this.setState({searchQuery: e.target.value})}
                       inputRef={this.searchRef}/>
          </div>

          {!hideComponents && (
            <div className={classes.apiNavigation}>
              <Paper style={{flex: 1, marginRight: 33, padding: 22, height: 'fit-content'}}>
                <Typography color="primary" variant="h5" style={{marginLeft: 6, marginBottom: 11}}>Paths</Typography>
                {pathTreeFiltered.children.filter(i => i.visible).map(i => (
                  <div className={classes.innerPath}>
                    <div className={classes.innerContent}>
                      <Typography color="primary"
                                  style={{marginTop: 4}}>{(i.name.split('/')[1]).toUpperCase()}</Typography>
                      <Divider style={{marginBottom: 9}}/>
                      <PathListItem path={i} baseUrl={baseUrl}/>
                    </div>
                  </div>
                ))}

                {pathTreeFiltered.children.every(i => !i.visible) && this.state.searchQuery ? (
                  <Typography variant="caption" color="error" style={{padding: 15}}>No Paths Found for
                    '{this.state.searchQuery}'</Typography>
                ) : null}

              </Paper>
              <Paper style={{width: 320, height: 'fit-content', paddingBottom: 15}}>
                <Typography color="primary" variant="h5" style={{
                  marginLeft: 6,
                  paddingTop: 24,
                  paddingLeft: 9,
                  paddingBottom: 5
                }}>Concepts</Typography>
                <List dense>
                  {conceptsFiltered.map(i => {
                    const to = routerUrls.conceptPage(baseUrl, i.shapeId);
                    return <Link to={to} style={{textDecoration: 'none', color: 'inherit'}}>
                      <ListItem button dense
                                style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>
                        <ListItemText primary={i.name}/>
                      </ListItem>
                    </Link>;
                  })}

                  {conceptsFiltered.length === 0 && this.state.searchQuery ? (
                    <Typography variant="caption" color="error" style={{padding: 15, paddingBottom: 25}}>No Concepts
                      Found
                      for
                      '{this.state.searchQuery}'</Typography>
                  ) : null}

                </List>
              </Paper>
            </div>)}
        </div>
      </Editor>
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

  return {
    name,
    full: full,
    toggled: depth < 2,
    children: sortBy(children, 'name'),
    depth,
    searchString: `${full}${name}`.split('/').join(' '),
    pathId: id,
    visible: filteredIds ? (filteredIds.includes(id) || children.some((i => i.visible))) : null
  };
}

export default withRfcContext(withEditorContext(withStyles(styles)(OverView)));
