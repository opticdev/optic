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
import {secondary} from '../../theme';
import Collapse from '@material-ui/core/Collapse';
import {withNavigationContext} from '../../contexts/NavigationContext';
import {PURPOSE} from '../../ContributionKeys';
import {DisplayPath} from '../paths/DisplayPath';
import {PathIdToPathString} from '../paths/PathIdToPathString';
import {NavHashLink as NavLink} from 'react-router-hash-link';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ListSubheader from '@material-ui/core/ListSubheader';
import {routerPaths} from '../../RouterPaths';
import {Route, Switch} from 'react-router-dom';
import {flatMapOperations, withApiOverviewContext} from '../../contexts/ApiOverviewContext';

const drawerWidth = 280;

const styles = theme => ({
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
    color: '#c4c4c4'
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
    color: '#c4c4c4'
  },
  selected: {
    borderRight: `3px solid ${secondary}`
  },
  subHeader: {
    color: '#c4c4c4',
    textTransform: 'uppercase',
    padding: 0,
  },
  arrow: {
    color: '#c4c4c4',
  },
  root: {
    display: 'flex',
  },
  content: {
    flex: 1
  }
});

const MainMenuItem = withStyles(styles)(({classes, to = '', name}) => {
  return (
    <ListItem to={to} exact activeClassName={classes.selected} component={NavLink} button dense
              classes={{selected: classes.selected}}>
      <ListItemText primary={name} primaryTypographyProps={{className: classes.item}}/>
    </ListItem>
  );
});

class Navigation extends React.Component {

  // state = {
  //   menuAnchorEl: null
  // };

  render() {

    const {classes, notifications, baseUrl, addExample, shareButtonComponent, cachedQueryResults, children, apiOverview} = this.props;

    const {operationsToRender, concepts, allPaths} = apiOverview;

    // const menu = (
    //   <Menu anchorEl={this.state.menuAnchorEl} open={Boolean(this.state.menuAnchorEl)} onClose={() => this.setState({menuAnchorEl: null})} style={{marginTop: 30}}>
    //     <MenuItem>Manually Add Example</MenuItem>
    //     {addExample}
    //   </Menu>
    // )

    const TabsMode = ({active}) => (
      <StyledTabs value={active} style={{width: 172, margin: '0 auto'}}>
        <StyledTab label="Documentation" value={0}/>
        <StyledTab label="Integrations" value={1}/>
      </StyledTabs>
    );

    return (
      <div className={classes.root}>
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

            <Switch>
              <Route path={routerPaths.integrationsDashboard(baseUrl)} component={() => <TabsMode active={1}/>}/>
              <Route path={baseUrl} component={() => <TabsMode active={0}/>}/>
            </Switch>


            <Switch>
              <Route path={routerPaths.integrationsDashboard(baseUrl)} component={() => <div>HELLO DUDE</div>}/>
              <Route path={baseUrl} component={() => (
                <List>
                  <MainMenuItem name="Dashboard" to={routerPaths.apiDashboard(baseUrl)}/>
                  <MainMenuItem name="API Documentation" to={baseUrl}/>

                  <Switch>
                    <Route exact path={baseUrl} component={() =>(
                        <ApiDocsSubMenu operationsToRender={operationsToRender}
                                        cachedQueryResults={cachedQueryResults}
                                        allPaths={allPaths}
                                        concepts={concepts}/>
                    )}/>
                  </Switch>
                </List>
              )}/>
            </Switch>


          </div>
          {/*<Divider className={classes.lightDivider}/>*/}

        </Drawer>

        <div className={classes.content}>
          {children}
        </div>

      </div>
    );
  }
}

export default compose(withStyles(styles), withApiOverviewContext, withNavigationContext, withRfcContext)(Navigation);


// Sub Menus

const EndpointBasePath = withStyles(styles)(withRfcContext(withNavigationContext((props) => {
  const {path, operationsToRender, cachedQueryResults, classes} = props;

  const {contributions} = cachedQueryResults;
  const {name} = path;

  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  if (!name && operationsToRender[0]) {

    if (operationsToRender[0].path.name) {
      return null;
    }

    const {requestId, request} = operationsToRender[0];
    const {httpMethod, pathComponentId} = request.requestDescriptor;
    const purpose = contributions.getOrUndefined(requestId, PURPOSE) || (
      <DisplayPath method={httpMethod} url={<PathIdToPathString pathId={pathComponentId}/>}/>
    );
    return (
      <NavLink
        to={`#${requestId}`}
        activeClassName="selected"
        style={{textDecoration: 'none', color: 'black'}}
      >
        <ListItem button
                  disableRipple
                  component="div"
                  dense
                  className={classes.nested}>
          <ListItemText
            primary={purpose}
            classes={{dense: classes.dense}}
            primaryTypographyProps={{
              variant: 'overline',
              style: {textTransform: 'none', textOverflow: 'ellipsis'}
            }}/>
        </ListItem>
      </NavLink>
    );
  }

  return (
    <>
      <ListItem button
                dense
                disableRipple
                onClick={handleClick}>
        <ListItemText primary={name.substr(1)}
                      classes={{dense: classes.dense}}
                      primaryTypographyProps={{
                        variant: 'overline',
                        style: {textTransform: 'none'},
                        className: classes.item
                      }}/>
        {open ? <ExpandLess className={classes.arrow}/> : <ExpandMore className={classes.arrow}/>}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div"
              dense
              style={{paddingLeft: 10}}
              disablePadding>
          {operationsToRender.map(({requestId, request}) => {

            const {httpMethod, pathComponentId} = request.requestDescriptor;
            const purpose = contributions.getOrUndefined(requestId, PURPOSE) || (
              <DisplayPath method={httpMethod} url={<PathIdToPathString pathId={pathComponentId}/>}/>
            );

            return (
              <NavLink
                to={`#${requestId}`}
                activeClassName="selected"
                style={{textDecoration: 'none', color: 'black'}}
              >
                <ListItem button
                          disableRipple
                          component="div"
                          dense
                          className={classes.nested}>
                  <ListItemText
                    primary={purpose}
                    classes={{dense: classes.dense, selected: classes.selected}}
                    primaryTypographyProps={{
                      variant: 'overline',
                      style: {textTransform: 'none', textOverflow: 'ellipsis'},
                      className: classes.item
                    }}/>
                </ListItem>
              </NavLink>
            );
          })}
        </List>
      </Collapse>
    </>
  );
})));

export const ApiDocsSubMenu = withStyles(styles)(({classes, operationsToRender, allPaths, concepts, cachedQueryResults}) => {

  return <>
    <List
      component="nav"
      dense={true}
    >
      {allPaths.map(i => <EndpointBasePath path={i} operationsToRender={flatMapOperations([i], cachedQueryResults)}/>)}
    </List>
    <Divider/>
    <List
      component='nav'
      subheader={concepts.length > 0 && <ListSubheader className={classes.subHeader}>{'Concepts'}</ListSubheader>}
      dense={true}
    >
      {
        concepts.map(i => (
          <NavLink
            to={`#${i.shapeId}`}
            activeClassName="selected"
            style={{textDecoration: 'none', color: 'black'}}
          >
            <ListItem button dense disableRipple>
              <ListItemText
                primary={i.name}
                dense
                classes={{dense: classes.dense, selected: classes.selected}}
                primaryTypographyProps={{className: classes.item}}/>
            </ListItem>
          </NavLink>
        ))
      }
    </List>
  </>;
});
