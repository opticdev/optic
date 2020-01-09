import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import {withRfcContext} from '../../contexts/RfcContext';
import compose from 'lodash.compose';
import Drawer from '@material-ui/core/Drawer';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
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
import {Link, Route, Switch} from 'react-router-dom';
import {flatMapOperations, withApiOverviewContext} from '../../contexts/ApiOverviewContext';
import {withIntegrationsContext} from '../../contexts/IntegrationsContext';

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

    const {classes, notifications, baseUrl, addExample, shareButtonComponent, entryBasePath, cachedQueryResults, children, apiOverview, integrationMode} = this.props;

    const {operationsToRender, concepts, allPaths} = apiOverview;

    // const TabsMode = ({active}) => (
    //   <StyledTabs value={active} style={{width: 180, margin: '0 auto'}}>
    //     <StyledTab component={Link} to={baseUrl+'/dashboard'} label="Documentation" value={0}/>
    //     <StyledTab component={Link} to={baseUrl+'/integrations'} label="Integrations" value={1}/>
    //   </StyledTabs>
    // );

    return (
      <div className={classes.root}>
        <Drawer
          id="navbar"
          elevation={2}
          className={classes.drawer}
          variant={'permanent'}
          classes={{
            paper: classes.drawerPaper,
          }}
          anchor="left"
        >

          <div>

            <div className={classes.middle}>
              {notifications}
            </div>

            <Typography variant="h6" className={classes.title}>
              {cachedQueryResults.apiName}
            </Typography>

            <Switch>
              <Route path={routerPaths.integrationsDashboard(entryBasePath)} component={() => <IntegrationsSubMenu basePath={entryBasePath + '/integrations/'}/>}/>
              <Route path={baseUrl} component={() => (
                <List>
                  <MainMenuItem name="Dashboard" to={baseUrl+'/dashboard'}/>
                  <MainMenuItem name="API Documentation" to={baseUrl+'/documentation'}/>

                  <Switch>
                    <Route exact path={routerPaths.apiDocumentation(entryBasePath)} component={() => (
                      <ApiDocsSubMenu operationsToRender={operationsToRender}
                                      cachedQueryResults={cachedQueryResults}
                                      basePath={'#'}
                                      allPaths={allPaths}
                                      concepts={concepts}/>
                    )}/>
                    <Route component={() => (
                      <ApiDocsSubMenu operationsToRender={operationsToRender}
                                      basePath={baseUrl + '/requests/'}
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

export default compose(withStyles(styles), withIntegrationsContext, withApiOverviewContext, withNavigationContext, withRfcContext)(Navigation);


// Sub Menus

const EndpointBasePath = withStyles(styles)(withRfcContext(withNavigationContext((props) => {
  const {path, operationsToRender, cachedQueryResults, classes, basePath} = props;

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
      <ListItem button
                to={`${basePath}${requestId}`} exact activeClassName={basePath !== '#' && classes.selected}
                component={NavLink}
                style={{textDecoration: 'none', color: 'black'}}
                disableRipple
                dense
                className={classes.nested}>
        <ListItemText
          primary={purpose}
          classes={{dense: classes.dense}}
          primaryTypographyProps={{
            variant: 'overline',
            style: {textTransform: 'none', textOverflow: 'ellipsis'},
            className: classes.item
          }}/>
      </ListItem>
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
              <ListItem button
                        disableRipple
                        to={`${basePath}${requestId}`} exact activeClassName={basePath !== '#' && classes.selected}
                        component={NavLink}
                        style={{textDecoration: 'none', color: 'black'}}
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
            );
          })}
        </List>
      </Collapse>
    </>
  );
})));

export const ApiDocsSubMenu = withStyles(styles)(({classes, operationsToRender, allPaths, concepts, cachedQueryResults, basePath}) => {

  return <>
    <List
      component="nav"
      dense={true}
    >
      {allPaths.map(i => <EndpointBasePath path={i} basePath={basePath}
                                           operationsToRender={flatMapOperations([i], cachedQueryResults)}/>)}
    </List>
    <Divider/>
    <List
      component='nav'
      subheader={concepts.length > 0 && <ListSubheader className={classes.subHeader}>{'Concepts'}</ListSubheader>}
      dense={true}
    >
      {
        concepts.map(i => (

          <ListItem button dense disableRipple
                    to={`${basePath}${i.shapeId}`}
                    activeClassName={basePath !== '#' && classes.selected}
                    style={{textDecoration: 'none', color: 'black'}}>
            <ListItemText
              primary={i.name}
              dense
              classes={{dense: classes.dense, selected: classes.selected}}
              primaryTypographyProps={{className: classes.item}}/>
          </ListItem>
        ))
      }
    </List>
  </>;
});

export const IntegrationsSubMenu = withIntegrationsContext(withStyles(styles)(({classes, basePath, integrations}) => {

  return <>
    <List
      component="nav"
      dense={true}
    >
      {integrations.map(i => {
        const to = `${basePath}${encodeURIComponent(i.name)}`
        return (<ListItem button dense disableRipple
                          to={to}
                          component={NavLink}
                          activeClassName={classes.selected}
                          style={{textDecoration: 'none', color: 'black'}}>
          <ListItemText
            primary={i.name}
            dense
            classes={{dense: classes.dense, selected: classes.selected}}
            primaryTypographyProps={{className: classes.item}}/>
        </ListItem>);
      })}
    </List>
  </>;
}));
