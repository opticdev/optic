import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import {withRfcContext} from '../../contexts/RfcContext';
import compose from 'lodash.compose';
import IconButton from '@material-ui/core/IconButton';
import MoreIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const styles = theme => ({
  root: {
    color: 'black',
    zIndex: theme.zIndex.drawer + 1,
    borderBottom: '1px solid #e2e2e2',
    backgroundColor: 'white',

  },
  title: {},
  middleSection: {
    // backgroundColor: 'rgba(49,54,111,0.1)',
    borderRadius: 12,
    width: '70%',
    maxWidth: 570,
    height: 38,
    border: '1px solid #e2e2e2',
    padding: 4,
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.1s ease',
    '&:hover': {
      transition: 'background-color 0.2s ease',
      backgroundColor: 'rgba(136,160,245,0.13)'
    }
  },
  background: {
    backgroundColor: 'transparent',
    display: 'flex',
    // alignItems: 'stretch'
    justifyContent: 'space-between'
  }
});

class Navbar extends React.Component {

  // state = {
  //   menuAnchorEl: null
  // };

  render() {

    const {classes, notifications, addExample, cachedQueryResults} = this.props;

    // const menu = (
    //   <Menu anchorEl={this.state.menuAnchorEl} open={Boolean(this.state.menuAnchorEl)} onClose={() => this.setState({menuAnchorEl: null})} style={{marginTop: 30}}>
    //     <MenuItem>Manually Add Example</MenuItem>
    //     {addExample}
    //   </Menu>
    // )

    return (
      <>
        <AppBar position="fixed" elevation={0} className={classes.root}>
          <Toolbar className={classes.background} variant="dense">
            <Typography variant="h6" className={classes.title} color="textPrimary">
              {cachedQueryResults.apiName}
            </Typography>

            <div className={classes.middleSection}>
              {notifications}
            </div>

            {/*<IconButton edge="end" size="small" color="default" onClick={(e) => this.setState({menuAnchorEl: e.currentTarget})}>*/}
            {/*  <MoreIcon/>*/}
            {/*</IconButton>*/}

            <div>
            {addExample}
            </div>
          </Toolbar>
        </AppBar>
      </>
    );
  }
}

export default compose(withStyles(styles), withRfcContext)(Navbar);
