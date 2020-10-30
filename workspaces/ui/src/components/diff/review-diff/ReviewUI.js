import React, { useMemo, useState } from 'react';
import Page from '../../../components/Page';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import { Divider, IconButton, ListSubheader } from '@material-ui/core';
import ListItem from '@material-ui/core/ListItem';
import { primary, secondary, SubtleBlueBackground } from '../../../theme';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Box from '@material-ui/core/Box';
import Menu from '@material-ui/core/Menu';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import MenuItem from '@material-ui/core/MenuItem';
import { Code } from '../../../storybook/stories/diff-page/DiffSummaryRegion';
import { PathAndMethodMono } from '../v2/PathAndMethod';
import { DocDarkGrey } from '../../docs/DocConstants';
import { useDiffSession } from './ReviewDiffSession';
import { ReviewEndpoint } from './ReviewEndpoint';

export function ReviewUI() {
  const classes = useStyles();
  const { queries } = useDiffSession();

  const results = queries.endpointSections();
  const selected = queries.selectedEndpoint();

  const NiceSubheader = ({ title, count }) => (
    <ListSubheader
      disableGutters
      style={{
        paddingLeft: 10,
        fontFamily: 'Ubuntu Mono',
        backgroundColor: SubtleBlueBackground,
      }}
    >{`${title} (${count})`}</ListSubheader>
  );
  return (
    <Page.Body padded={false} style={{ flexDirection: 'row', height: '100vh' }}>
      <Paper square className={classes.left} elevation={0}>
        <DiffInfoCard />
        <List className={classes.list}>
          <NiceSubheader
            title={'Endpoints with Diffs'}
            count={results.endpointsWithDiffs.length}
          />
          {results.endpointsWithDiffs.map((i) => (
            <EndpointDetailCard
              key={i.pathId + i.method}
              {...i}
              selected={selected}
            />
          ))}
          {/*{dummyData*/}
          {/*  .filter((i) => i.hasDiff)*/}
          {/*  .map((i) => (*/}
          {/*    <EndpointDetailCard {...i} {...{ selected, setSelected }} />*/}
          {/*  ))}*/}
          <NiceSubheader
            title={'Endpoints without Diffs'}
            count={results.endpointsNoDiff.length}
          />
          {/*{dummyData*/}
          {/*  .filter((i) => !i.hasDiff && i.hasCoverage)*/}
          {/*  .map((i) => (*/}
          {/*    <EndpointDetailCard {...i} {...{ selected, setSelected }} />*/}
          {/*  ))}*/}
        </List>
        <Divider />

        <Paper className={classes.undocumented} square>
          <Typography variant="subtitle1">
            <Code>15</Code> undocumented urls
            <Button
              color="primary"
              size="medium"
              style={{ marginLeft: 10, marginTop: -1 }}
            >
              {' '}
              Start Documenting
            </Button>
          </Typography>
        </Paper>
      </Paper>
      <div className={classes.right}>
        {selected && (
          <ReviewEndpoint
            key={selected.pathId + selected.method}
            pathId={selected.pathId}
            method={selected.method}
            useEndpointDiffMachine={queries.makeUseEndpoint(
              selected.pathId,
              selected.method
            )}
          />
        )}
      </div>
    </Page.Body>
  );
}

export function EndpointDetailCard(props) {
  const { method, pathId, diffCount, handled, selected } = props;
  const { queries, actions } = useDiffSession();
  const classes = useStyles();

  const { httpMethod, fullPath, endpointPurpose } = useMemo(
    () => queries.getEndpointDescriptor({ method, pathId }),
    []
  );

  return (
    <ListItem
      classes={{
        selected: classes.selected,
        root: handled ? classes.listItemHandled : classes.listItemRoot,
      }}
      button
      key={method + pathId}
      selected={
        selected && selected.pathId === pathId && selected.method === method
      }
      onClick={() => actions.selectEndpoint(pathId, method)}
      disableGutters
      divider={true}
    >
      <div className={classes.listInner}>
        <div className={classes.endpointDescriptor}>
          <PathAndMethodMono path={fullPath} method={httpMethod} />
          <Typography variant="caption" className={classes.name}>
            {endpointPurpose || (
              <span style={{ color: DocDarkGrey }}>Unnamed Endpoint</span>
            )}
          </Typography>
        </div>
        <div style={{ flex: 1 }} />
        <div className={classes.rightAction}>
          <div className={classes.stats}>
            {/*<CoverageDots*/}
            {/*  requests={props.requests}*/}
            {/*  responses={props.responses}*/}
            {/*/>*/}
            {/*{!handled && <DiffCounter {...stats} />}*/}
          </div>
        </div>
      </div>
    </ListItem>
  );
}

const DiffInfoCard = (props) => {
  const classes = useStyles();
  const { queries } = useDiffSession();

  const totalDiffs = queries.totalDiffs();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={classes.info}>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        style={{ paddingTop: 10, paddingLeft: 10, paddingRight: 10 }}
      >
        <div style={{ flex: 1 }}>
          Diffs Since Last Commit <Code>e2rff34</Code> on{' '}
          <Code>feature/new-thing</Code>
        </div>
        <div style={{ paddingLeft: 15 }}>
          <IconButton size="small" onClick={handleClick}>
            <MenuOpenIcon style={{ width: 20, height: 20 }} />
          </IconButton>
        </div>
        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>Restart Diff Review</MenuItem>
          <MenuItem onClick={handleClose}>Clear Capture</MenuItem>
          <MenuItem onClick={handleClose}>Switch Capture Mode</MenuItem>
        </Menu>
      </Box>
      <Handled totalDiffs={totalDiffs} />
    </div>
  );
};

export function Handled(props) {
  const { totalDiffs, handled } = props;
  return (
    <Box
      flexDirection="row"
      display="flex"
      alignItems="center"
      style={{ marginTop: 5, paddingLeft: 10, paddingRight: 10 }}
    >
      <div style={{ fontSize: 10, color: DocDarkGrey, marginRight: 10 }}>
        You have handled 0/{totalDiffs} Diffs
      </div>
      <LinearProgress
        value={50}
        variant="determinate"
        style={{ flex: 1, maxWidth: 100 }}
      />
    </Box>
  );
}

const useStyles = makeStyles((theme) => ({
  left: {
    width: 450,
    height: '100%',
    backgroundColor: SubtleBlueBackground,
    overflow: 'scroll',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 900,
  },
  right: {
    minWidth: 550,
    borderLeft: '1px solid',
    borderColor: '#d2d2d2',
    flex: 1,
    overflow: 'scroll',
  },
  listInner: {
    padding: 9,
    paddingTop: 1,
    paddingBottom: 1,
    height: 50,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
  endpointDescriptor: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  stats: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  name: {
    marginTop: 3,
    fontWeight: 500,
    fontSize: 14,
  },
  listItemRoot: {
    borderRightWidth: 0,
  },
  listItemHandled: {
    borderRight: `4px solid ${primary}`,
  },
  list: {
    flex: 1,
    overflow: 'scroll',
    paddingTop: 0,
  },
  rightAction: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
  },
  undocumented: {
    height: 75,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    fontFamily: 'Ubuntu Mono',
    paddingBottom: 0,
    fontSize: 12,
  },
  selected: {
    borderRight: `4px solid ${secondary}`,
    transition: 'border-width 0.1s ease-in-out',
  },
}));
