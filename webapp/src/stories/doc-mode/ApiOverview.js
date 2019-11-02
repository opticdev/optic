import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ApiSearch from './ApiSearch';
import Collapse from '@material-ui/core/Collapse';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import EndpointOverview from './EndpointOverview';
import {ListSubheader} from '@material-ui/core';
import {withRfcContext} from '../../contexts/RfcContext';
import {routerUrls} from '../../routes';
import {asPathTrail, isPathParameter} from '../../components/utilities/PathUtilities';
import ConceptOverview from './ConceptOverview';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  toolbar: {
    ...theme.mixins.toolbar,
    display: 'flex',
    flexDirection: 'row',
    justifyItems: 'center',
    alignItems: 'center',
  },
  apiName: {
    paddingLeft: 10,
    fontWeight: 500,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
  nested: {
    paddingLeft: theme.spacing(4),
    textTransform: 'none'
  },
  dense: {
    padding: 0,
    margin: 0,
  },
  subHeader: {
    backgroundColor: 'white'
  },
  sectionHeader: {
    padding: 20,
    paddingTop: 140
  }
}));

const EndpointBasePath = withRfcContext(({path, baseUrl, cachedQueryResults}) => {
  const classes = useStyles();

  const {name, children, depth, toggled, pathId, full, visible} = path;

  const flatChildren = [path, ...children.flatMap(i => [i, ...i.children])]
    .filter(({pathId}) => {
      const requests = cachedQueryResults.requestIdsByPathId[pathId] || [];
      return requests.length;
    });

  const [open, setOpen] = React.useState(false);


  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItem button
                dense
                onClick={handleClick}>
        <ListItemText primary={name.substr(1)}
                      classes={{dense: classes.dense}}
                      primaryTypographyProps={{variant: 'overline'}}/>
        {open ? <ExpandLess/> : <ExpandMore/>}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div"
              dense
              disablePadding>
          {flatChildren.map(i => (
            <ListItem button
                      component="div"
                      dense
                      className={classes.nested}>
              <ListItemText primary={i.pathId}
                            classes={{dense: classes.dense}}
                            primaryTypographyProps={{variant: 'overline'}}/>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );
});

export default withRfcContext(({paths, concepts, baseUrl, cachedQueryResults}) => {
  const classes = useStyles();

  const operationsToRender = paths.children.flatMap(i => [i, ...i.children])
    .flatMap(path => {
      const requests = cachedQueryResults.requestIdsByPathId[path.pathId] || [];
      return requests.map(id => {
        return {
          requestId: id,
          request: cachedQueryResults.requests[id],
          path
        };
      });
    });

  return (
    <div className={classes.root}>
      <CssBaseline/>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="left"
      >
        <div className={classes.toolbar}>
          <Typography variant="subtitle1" className={classes.apiName}>Netlify API</Typography>
          {/*<ApiSearch />*/}
        </div>
        <Divider/>
        <List
          component="nav"
          subheader={<ListSubheader className={classes.subHeader}>{'Endpoints'}</ListSubheader>}
          aria-labelledby="nested-list-subheader"
          dense={true}
        >
          {paths.children.map(i => <EndpointBasePath path={i} baseUrl={baseUrl}/>)}
        </List>

        <Divider/>
        <List
          component="nav"
          subheader={<ListSubheader className={classes.subHeader}>{'Concepts'}</ListSubheader>}
          aria-labelledby="nested-list-subheader"
          dense={true}
        >
          {concepts.map(i => (
            <ListItem button
                      dense>
              <ListItemText primary={i.name}
                            dense
                            classes={{dense: classes.dense}}
                            primaryTypographyProps={{variant: 'overline', style: {textTransform: 'none'}}}/>
            </ListItem>
          ))}
        </List>

      </Drawer>
      <main className={classes.content}>
        <Typography variant="h3" color="primary" className={classes.sectionHeader}
                    style={{paddingTop: 20}}>Endpoints</Typography>

        {operationsToRender.map(operation => {
          const {pathsById} = cachedQueryResults;
          const pathTrail = asPathTrail(operation.path.pathId, pathsById);
          const pathParameters = pathTrail
            .map(pathId => pathsById[pathId])
            .filter((p) => isPathParameter(p))
            .map(p => ({pathId: p.pathId, name: p.descriptor.ParameterizedPathComponentDescriptor.name}));

          return (
            <EndpointOverview
              endpointPurpose={''}
              endpointDescription=""
              method={operation.request.requestDescriptor.httpMethod}
              parameters={pathParameters}
              url={operation.path.full + operation.path.name}
            />
          );
        })}

        <Typography variant="h3" color="primary" className={classes.sectionHeader}>Concepts</Typography>

        {concepts.map(concept => (
          <ConceptOverview
            name={concept.name}
            shapeId={concept.id}
            example={{name: 'fizo', age: 15, breed: 'husky'}}
          />
        ))}

      </main>
    </div>
  );
});

