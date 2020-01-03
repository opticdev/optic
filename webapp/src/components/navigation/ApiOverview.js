import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import EndpointOverview from '../requests/EndpointOverview';
import {ListSubheader} from '@material-ui/core';
import {withRfcContext} from '../../contexts/RfcContext';
import {asPathTrail, isPathParameter} from '../utilities/PathUtilities';
import ConceptOverview from './ConceptOverview';
import {DisplayPath} from '../paths/DisplayPath';
import {withNavigationContext} from '../../contexts/NavigationContext';
import compose from 'lodash.compose';
import {PathIdToPathString} from '../paths/PathIdToPathString';
import {updateContribution} from '../../engine/routines';
import { NavHashLink as NavLink } from 'react-router-hash-link';
import {DESCRIPTION, PURPOSE} from '../../ContributionKeys';
import {Helmet} from 'react-helmet';
import * as uniqBy from 'lodash.uniqby'
import {withApiOverviewContext} from '../../contexts/ApiOverviewContext';
import {ProductDemoStoreBase} from '../onboarding/InlineDocs';

const drawerWidth = 320;
const appBarOffset = 50

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
    height: `calc(100% - ${appBarOffset}px)`,
    marginTop: appBarOffset,
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
    paddingLeft: 25,
    paddingTop: 5,
    overflow: 'hidden'
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

const EndpointBasePath = withRfcContext(withNavigationContext((props) => {
  const {path, operationsToRender, cachedQueryResults} = props;
  const classes = useStyles();

  const {contributions} = cachedQueryResults;
  const {name} = path;

  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  if (!name && operationsToRender[0]) {

    if (operationsToRender[0].path.name) {
      return null
    }

    const {requestId, request} = operationsToRender[0]
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
    )
  }

  return (
    <>
      <ListItem button
                dense
                disableRipple
                onClick={handleClick}>
        <ListItemText primary={name.substr(1)}
                      classes={{dense: classes.dense}}
                      primaryTypographyProps={{variant: 'overline', style: {textTransform: 'none'}}}/>
        {open ? <ExpandLess/> : <ExpandMore/>}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div"
              dense
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
                    classes={{dense: classes.dense}}
                    primaryTypographyProps={{
                      variant: 'overline',
                      style: {textTransform: 'none', textOverflow: 'ellipsis'}
                    }}/>
                </ListItem>
              </NavLink>
            );
          })}
        </List>
      </Collapse>
    </>
  );
}));


export default compose(withRfcContext, withApiOverviewContext, withNavigationContext)(function ApiOverview(props) {
  const {paths, cachedQueryResults, handleCommand, apiOverview} = props;
  const classes = useStyles();

  const {operationsToRender, concepts} = apiOverview

  return (
    <div className={classes.root}>
      <CssBaseline/>
      <main className={classes.content}>
        {operationsToRender.length > 0 && <Typography variant="h3" color="primary" className={classes.sectionHeader}
                    style={{paddingTop: 20}}>Endpoints</Typography>}

        {operationsToRender.map(operation => {
          const {pathsById, contributions} = cachedQueryResults;
          const pathTrail = asPathTrail(operation.path.pathId, pathsById);
          const pathParameters = pathTrail
            .map(pathId => pathsById[pathId])
            .filter((p) => isPathParameter(p))
            .map(p => ({
              pathId: p.pathId,
              name: p.descriptor.ParameterizedPathComponentDescriptor.name,
              description: contributions.getOrUndefined(p.pathId, DESCRIPTION)
            }));

          return (
            <EndpointOverview
              endpointPurpose={contributions.getOrUndefined(operation.requestId, PURPOSE)}
              endpointDescription={contributions.getOrUndefined(operation.requestId, DESCRIPTION)}
              requestId={operation.requestId}
              method={operation.request.requestDescriptor.httpMethod}
              parameters={pathParameters}
              url={operation.path.full + operation.path.name}
              updateContribution={(id, key, value) => {
                handleCommand(updateContribution(id, key, value));
              }}
            />
          );
        })}

        {concepts.length > 0 && <Typography variant="h3" color="primary" className={classes.sectionHeader}>Concepts</Typography>}

        {concepts.map(concept => (
          <ConceptOverview
            name={concept.name}
            shapeId={concept.shapeId}
            example={{name: 'fizo', age: 15, breed: 'husky'}}
          />
        ))}

      </main>
    </div>
  );
});

