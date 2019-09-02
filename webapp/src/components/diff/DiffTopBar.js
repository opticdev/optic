import React, {useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {NavTextColor} from '../navigation/constants';
import {withEditorContext} from '../../contexts/EditorContext';
import {withRfcContext} from '../../contexts/RfcContext';
import {primary} from '../../theme';
import {Button} from '@material-ui/core';
import KeyboardDown from '@material-ui/icons/KeyboardArrowDown';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close'
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
  spacer: {
    flex: 1
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
    // eslint-disable-next-line no-undef
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
  progress: {
    width: 120
  }
});

class DiffTopBar extends React.Component {

  render() {
    const {classes, progress} = this.props;

    const progressCalc = (() => {
      if (!progress) {
        return 0
      }
      if (progress > 90 && progress !== 100) {
        return 90
      } else {
        return progress
      }
    })()

    return (
      <div className={classes.root}>
        <AppBar position="static" style={{backgroundColor: 'white'}} elevation={0} className={classes.appBar}>
          <Toolbar variant="dense">
            <IconButton size="small" color="primary">
              <CloseIcon />
            </IconButton>

            <Typography variant="h6" style={{color: '#202020', marginLeft: 10}}>
              Review Proposed Changes
            </Typography>
            <div className={classes.spacer} />

            <Typography variant="overline" style={{color: '#424242', marginRight: 11}}>
              {progress !== 100 ? 'Progress' : ''}
            </Typography>

            {/*
                        Progress = (Handled Interactions + No Change Interactions) / Total Number of Interactions
                        Will jump around a bit but should be the most helpful measure of progress for a person working through the flow
                        */}
            <LinearProgress value={progressCalc}
                            variant="determinate"
                            className={classes.progress} />
            {/*<Button color="primary">Hello</Button>*/}

          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

export default withRfcContext(withEditorContext(withStyles(styles)(DiffTopBar)));
