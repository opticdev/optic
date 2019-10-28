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
  },
  dense: {
    padding: 0,
    margin: 0,
  }
}));

function EndpointBasePath({basePath, requests}) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItem button
                dense
                onClick={handleClick}>
        <ListItemText primary={basePath}
                      classes={{dense: classes.dense}}
                      primaryTypographyProps={{variant: 'overline'}}/>
        {open ? <ExpandLess/> : <ExpandMore/>}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div"
              dense
              disablePadding>
          {requests.map(i => (
            <ListItem button
                      dense
                      className={classes.nested}>
              <ListItemText primary={i}
                            classes={{dense: classes.dense}}
                            primaryTypographyProps={{variant: 'overline'}}/>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );
}

export default function ApiOverview() {
  const classes = useStyles();

  const endpointsList = [
    {
      basePath: 'users', requests: [
        'Create New User',
        'Delete a User',
        'Update a User\'s preferences',
      ]
    }
  ];

  const conceptsList = [
    'Pet',
    'Owner',
    'Store',
    'Breed'
  ]

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
          subheader={<ListSubheader>{'Endpoints'}</ListSubheader>}
          aria-labelledby="nested-list-subheader"
          dense={true}
        >
          {endpointsList.map(i => <EndpointBasePath {...i} />)}
        </List>

        <Divider/>
        <List
          component="nav"
          subheader={<ListSubheader>{'Concepts'}</ListSubheader>}
          aria-labelledby="nested-list-subheader"
          dense={true}
        >
          {conceptsList.map(i => (
            <ListItem button
                      dense
                      className={classes.nested}>
              <ListItemText primary={i}
                            classes={{dense: classes.dense}}
                            primaryTypographyProps={{variant: 'overline'}}/>
            </ListItem>
          ))}
        </List>

      </Drawer>
      <main className={classes.content}>
        <>
          <EndpointOverview
            endpointPurpose="Update a User's Preferences by ID"
            endpointDescription=""
            method="PATCH"
            parameters={['userId']}
            url="/users/:userId/preferences"

          />
          <EndpointOverview
            endpointPurpose="Create a new User"
            endpointDescription=""
            method="POST"
            url="/users"
          />
          <EndpointOverview
            endpointPurpose="Delete User by ID"
            endpointDescription=""
            method="POST"
            parameters={['userId']}
            url="/users/:userId"
          />
        </>
      </main>
    </div>
  );
}

