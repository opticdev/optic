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
import Drawer from '@material-ui/core/Drawer';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {StyledTab, StyledTabs} from '../requests/DocCodeBox';

const drawerWidth = 280;

const styles = theme => ({
  root: {
    color: 'black',
    zIndex: theme.zIndex.drawer + 1,
    borderBottom: '1px solid #e2e2e2',
    backgroundColor: 'white',

  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: '#1B2958'
  },
  title: {
    textAlign: 'center',
    marginTop: 20,
    color: '#ebedfc'
  },
  middle: {
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  background: {
    backgroundColor: 'transparent',
    display: 'flex',
    // alignItems: 'stretch'
    justifyContent: 'space-between'
  },
  lightDivider: {
    backgroundColor: '#4755a1',
    margin: 10
  },
  item: {
    color: '#ebedfc'
  }
});

const MainMenuItem = withStyles(styles)(({classes, name}) => {
  return (
    <ListItem button>
      <ListItemIcon>
        <InboxIcon />
      </ListItemIcon>
      <ListItemText primary={name} primaryTypographyProps={{className: classes.item}}/>
    </ListItem>
  );
});

class Navbar extends React.Component {

  // state = {
  //   menuAnchorEl: null
  // };

  render() {

    const {classes, notifications, addExample, shareButtonComponent, cachedQueryResults} = this.props;

    // const menu = (
    //   <Menu anchorEl={this.state.menuAnchorEl} open={Boolean(this.state.menuAnchorEl)} onClose={() => this.setState({menuAnchorEl: null})} style={{marginTop: 30}}>
    //     <MenuItem>Manually Add Example</MenuItem>
    //     {addExample}
    //   </Menu>
    // )

    return (
      <>
        <Drawer
          elevation={2}
          className={classes.drawer}
          variant={'permanent'}
          classes={{
            paper: classes.drawerPaper,
          }}
          anchor="left"
        >

          <div>
            <Typography variant="h6" className={classes.title}>
              {cachedQueryResults.apiName}
            </Typography>

            <div className={classes.middle}>
              {notifications}
            </div>

            <StyledTabs value={0} style={{width: 172, margin: '0 auto'}}>
              <StyledTab label="Documentation" value={0}/>
              <StyledTab label="Integrations" value={1}/>
            </StyledTabs>


            <List>
              <MainMenuItem name="Dashboard"/>
            </List>

          </div>
          {/*<Divider className={classes.lightDivider}/>*/}

        </Drawer>

        {/*<AppBar position="fixed" elevation={0} className={classes.root}>*/}
        {/*  <Toolbar className={classes.background} variant="dense">*/}
        {/*    <Typography variant="h6" className={classes.title} color="textPrimary">*/}
        {/*      {cachedQueryResults.apiName}*/}
        {/*    </Typography>*/}

        {/*    <div className={classes.middleSection}>*/}
        {/*      {notifications}*/}
        {/*    </div>*/}

        {/*    /!*<IconButton edge="end" size="small" color="default" onClick={(e) => this.setState({menuAnchorEl: e.currentTarget})}>*!/*/}
        {/*    /!*  <MoreIcon/>*!/*/}
        {/*    /!*</IconButton>*!/*/}

        {/*    <div>*/}
        {/*      {addExample}*/}
        {/*      {shareButtonComponent}*/}
        {/*    </div>*/}
        {/*  </Toolbar>*/}
        {/*</AppBar>*/}
      </>
    );
  }
}

export default compose(withStyles(styles), withRfcContext)(Navbar);
