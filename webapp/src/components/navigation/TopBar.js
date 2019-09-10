import React, {useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {fade} from '@material-ui/core/styles';
import {NavTextColor, SearchBackground} from './constants';
import {Button} from '@material-ui/core';
import KeyboardDown from '@material-ui/icons/KeyboardArrowDown';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {primary} from '../../theme';
import {EditorModes, withEditorContext} from '../../contexts/EditorContext';
import {withRfcContext} from '../../contexts/RfcContext';
import TextField from '@material-ui/core/TextField';
import {renameAPI} from '../../engine/routines';
import CodeIcon from '@material-ui/icons/Code';
import DescriptionIcon from '@material-ui/icons/Description';
import CreateNew from './CreateNew';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  appBar: {
    borderBottom: '1px solid #e2e2e2'
  },
  menuButton: {
    // color: NavTextColor,
  },
  title: {
    display: 'none',
    color: NavTextColor,
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  sideSpacer: {
    flex: 1
  },
  centerSpacer: {
    flexBasis: 1,
    textAlign: 'center',
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(SearchBackground, 0.15),
    '&:hover': {
      backgroundColor: fade(SearchBackground, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  rightIcon: {
    marginLeft: theme.spacing(1),
    color: NavTextColor
  },
  searchIcon: {
    width: theme.spacing(7),
    color: NavTextColor,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: NavTextColor,
    cursor: 'pointer'
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 120,
    },
  },
  toggleButton: {
    height: 28,
    // borderColor: primary,
    color: primary
  },
  toggleButtonSelected: {
    backgroundColor: `${primary} !important`,
    color: `white !important`
  },
  titleInput: {
    width: 280,
    color: NavTextColor
  },
  button: {},
  leftIcon: {
    width: 15,
    marginRight: theme.spacing.unit,
  },
});

const APITitle = ({mode, apiName, classes, onRenamed, style}) => {

  const [stagedName, setStagedName] = useState(apiName);

  return (
    <>
      {mode === EditorModes.DOCUMENTATION ? (
        <Typography className={classes.title} variant="h6" noWrap style={style}>
          {apiName}
        </Typography>
      ) : (
        <TextField
          value={stagedName}
          style={style}
          onBlur={() => onRenamed(stagedName)}
          className={classes.titleInput}
          onChange={(e) => setStagedName(e.target.value)}
        />
      )}
    </>
  );
};

class TopBar extends React.Component {

  render() {
    const {classes, mode, switchEditorMode, cachedQueryResults, handleCommand, hasUnsavedChanges} = this.props;
    const {apiName} = cachedQueryResults;
    return (
      <div className={classes.root}>
        <AppBar position="static" style={{backgroundColor: 'white'}} elevation={0} className={classes.appBar}>
          <Toolbar variant="dense">

            <div className={classes.sideSpacer}>

              <Button
                disableRipple={true}
                variant="text" color="primary"
                className={classes.menuButton}
                onClick={this.props.toggleSuperMenu}
              >Explore API
                <KeyboardDown className={classes.rightIcon}/>
              </Button>

              {(hasUnsavedChanges && process.env.REACT_APP_CLI_MODE) ? (
                <Typography variant="caption" style={{color: '#8e8e8e', marginLeft: 20}}>
                  Saving...
                </Typography>
              ) : null}

            </div>

            <div className={classes.centerSpacer}>
              <APITitle
                mode={mode}
                apiName={apiName}
                classes={classes}
                onRenamed={(name) => handleCommand(renameAPI(name))}/>
            </div>


            <div className={classes.sideSpacer} style={{textAlign: 'right'}}>

              <ToggleButtonGroup value={mode}
                                 disableRipple={true}
                                 exclusive size="small"
                                 style={{marginRight: 22}}
                                 onChange={(e, value) => switchEditorMode(value)}>
                <ToggleButton value={EditorModes.DOCUMENTATION}
                              className={classes.toggleButton}
                              classes={{selected: classes.toggleButtonSelected}}>
                  Documentation
                </ToggleButton>
                <ToggleButton value={EditorModes.DESIGN}
                              className={classes.toggleButton}
                              classes={{selected: classes.toggleButtonSelected}}>
                  Design
                </ToggleButton>
              </ToggleButtonGroup>
              {!process.env.REACT_APP_CLI_MODE ? (
                <Button color="secondary" onClick={this.props.showShare} disableRipple={true}>
                  Share
                </Button>
              ) : null}

            </div>
          </Toolbar>
        </AppBar>
        {mode === EditorModes.DESIGN ? (
          <AppBar position="static" style={{backgroundColor: 'white'}} elevation={0}
                  className={classes.appBar}>
            <CreateNew render={({addConcept, addRequest, classes}) => {
              return (
                <Toolbar variant="dense" style={{paddingLeft: 30}}>
                  <ActionButton onClick={addRequest}>
                    <CodeIcon className={classes.leftIcon}/>
                    New Request
                  </ActionButton>

                  <ActionButton onClick={addConcept}>
                    <DescriptionIcon className={classes.leftIcon}/>
                    New Concept
                  </ActionButton>
                </Toolbar>
              );
            }}/>
          </AppBar>) : null}
      </div>
    );
  }
}

export const ActionButton = withStyles(styles)(function ActionButton({classes, onClick, children}) {
  return (
    <Button
      disableRipple={true}
      color="secondary"
      onClick={onClick}
      className={classes.button}
    >{children}</Button>
  );
});

export default withRfcContext(withEditorContext(withStyles(styles)(TopBar)));
