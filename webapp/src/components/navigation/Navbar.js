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
import {DocDivider} from '../requests/DocConstants';
import {Show} from '../shared/Show';

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
    color: '#c4c4c4',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  selected: {
    borderRight: `3px solid ${secondary}`
  },
  subHeader: {
    padding: 2,
    textAlign: 'center'
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
              <Route path={baseUrl} component={() => (
                <List>
                  <MainMenuItem name="Dashboard" to={baseUrl + '/dashboard'}/>
                  <MainMenuItem name="API Documentation" to={baseUrl + '/documentation'}/>

                  <Switch>
                    <Route exact path={routerPaths.apiDocumentation(entryBasePath)} component={() => (
                      <ApiDocsSubMenu operationsToRender={operationsToRender}
                                      cachedQueryResults={cachedQueryResults}
                                      basePath={'#'}
                                      baseConceptsPath={baseUrl + '/documentation#'}
                                      allPaths={allPaths}
                                      concepts={concepts}/>
                    )}/>
                    <Route component={() => (
                      <ApiDocsSubMenu operationsToRender={operationsToRender}
                                      basePath={baseUrl + '/requests/'}
                                      baseConceptsPath={baseUrl + '/documentation#'}
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

  if (operationsToRender.length === 0) {
    return null;
  }

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
            component: 'div',
            style: {textTransform: 'none', textOverflow: 'ellipsis'},
            className: classes.item
          }}/>
      </ListItem>
    );
  }

  return (
    <List component="div"
          dense
          disablePadding>
      {operationsToRender.map(({requestId, request}) => {

        const {httpMethod, pathComponentId} = request.requestDescriptor;
        const purpose = contributions.getOrUndefined(requestId, PURPOSE) || (
          <DisplayPath method={httpMethod} url={<PathIdToPathString pathId={pathComponentId}/>}/>
        );


        return (
          <ListItem button
                    disableRipple
                    to={`${basePath}${requestId}`}
                    exact
                    activeClassName={classes.selected}
                    isActive={(match, location) => {
                      return (match && !match.path.endsWith('/documentation')) || location.hash === `#${requestId}`;
                    }}
                    component={NavLink}
                    style={{textDecoration: 'none', color: 'black', height: 36}}
                    dense
                    className={classes.nested}>
            <ListItemText
              primary={purpose}
              classes={{dense: classes.dense, selected: classes.selected}}
              primaryTypographyProps={{
                variant: 'overline',
                component:'div',
                style: {textTransform: 'none', textOverflow: 'ellipsis'},
                className: classes.item
              }}/>
          </ListItem>
        );
      })}
    </List>
  );
})));

export const ApiDocsSubMenu = withStyles(styles)(({classes, operationsToRender, baseConceptsPath, allPaths, concepts, cachedQueryResults, basePath}) => {

  return <>
    <Show when={operationsToRender.length} style={{marginTop: 11}}>
      <Divider style={{backgroundColor: '#3d4989'}}/>
      <List
        component="nav"
        subheader={concepts.length > 0 && <ListSubheader className={classes.subHeader}>
          <Typography variant="overline" className={classes.title}>Endpoints</Typography>
        </ListSubheader>}
        dense={true}
      >
        {allPaths.map(i => <EndpointBasePath path={i} basePath={basePath}
                                             operationsToRender={flatMapOperations([i], cachedQueryResults)}/>)}
      </List>
    </Show>
    <Show when={concepts.length}>
      <Divider style={{backgroundColor: '#3d4989'}}/>
      <List
        component='nav'
        subheader={concepts.length > 0 && <ListSubheader className={classes.subHeader}>
          <Typography variant="overline" className={classes.title}>Shapes</Typography>
        </ListSubheader>}
        dense={true}
      >
        {
          concepts.map(i => {
            return (
              <ListItem button dense disableRipple
                        to={`${baseConceptsPath}${i.shapeId}`}
                        exact
                        activeClassName={classes.selected}
                        isActive={(match, location) => {
                          if (!match) {
                            return false;
                          }
                          return location.hash === `#${i.shapeId}`;
                        }}
                        component={NavLink}
                        className={classes.nested}
                        style={{textDecoration: 'none', color: 'black'}}>
                <ListItemText
                  primary={i.name}
                  dense
                  classes={{dense: classes.dense, selected: classes.selected}}
                  primaryTypographyProps={{className: classes.item, component:'div', style: {fontSize: 12}}}/>
              </ListItem>
            );
          })
        }
      </List>
    </Show>
  </>;
});

export const IntegrationsSubMenu = withIntegrationsContext(withStyles(styles)(({classes, basePath, integrations}) => {

  return <>
    <List
      component="nav"
      dense={true}
    >
      {integrations.map(i => {
        const to = `${basePath}${encodeURIComponent(i.name)}`;
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
