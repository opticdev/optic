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
import {primary, secondary} from '../../theme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Divider from '@material-ui/core/Divider';
import SearchBar, {fuzzyConceptFilter, fuzzyPathsFilter} from '../navigation/Search';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Toolbar from '@material-ui/core/Toolbar';
import DescriptionIcon from '@material-ui/icons/Description';
import AppBar from '@material-ui/core/AppBar';
import {ActionButton} from '../navigation/TopBar';
import CodeIcon from '@material-ui/icons/Code';
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

function SetupCall({open, onClose}) {
  return (
    <Dialog
      maxWidth="lg"
      onClose={onClose}
      open={open}>
      <DialogContent>
        <iframe src="https://calendly.com/optic-onboarding/30-min-session" style={{width: 450, height: 700}}
                frameBorder="0"/>
      </DialogContent>
    </Dialog>);
}


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
    callModalOpen: false
  };

  openCallModal = () => {
    this.setState({callModalOpen: true});
  };
  closeModal = () => {
    this.setState({callModalOpen: false});
  };

  render() {
    const {classes, cachedQueryResults, mode, handleCommand, queries, baseUrl} = this.props;
    const {apiName, contributions, conceptsById, pathsById, pathIdsWithRequests} = cachedQueryResults;

    const concepts = Object.values(conceptsById).filter(i => !i.deprecated);
    const sortedConcepts = sortBy(concepts, ['name']);
    const pathTree = flattenPaths('root', pathsById);

    const conceptsFiltered = fuzzyConceptFilter(sortedConcepts, this.state.searchQuery);
    const pathIdsFiltered = fuzzyPathsFilter(pathTree, this.state.searchQuery);
    const pathTreeFiltered = flattenPaths('root', pathsById, 0, '', pathIdsFiltered)

    const hideComponents = (pathTree.children.length === 0 && concepts.length === 0);

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

export default withRfcContext(withEditorContext(withStyles(styles)(OverView)));
