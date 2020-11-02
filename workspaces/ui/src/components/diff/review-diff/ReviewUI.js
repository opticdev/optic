import React, { useEffect, useMemo, useState } from 'react';
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
import { CircularDiffProgress } from '../../../storybook/stories/diff-page/CircularDiffProgress';
import { ReviewUndocumentedUrls } from './learn-api/ReviewUndocumented';
import TopNavigation from '../../../storybook/stories/navigation/TopNavigation';
import { PageWithTopNavigation } from '../../Page';
import Collapse from '@material-ui/core/Collapse';
import { AskFinished } from './AskFinished';
export function ReviewUI() {
  const classes = useStyles();
  const { queries, actions } = useDiffSession();

  const results = queries.endpointSections();
  const selected = queries.selectedEndpoint();
  const shouldShowUndocumented = queries.showingUndocumented();
  const selectedEndpointHandled = queries.selectedEndpointHandled();
  const handled = queries.handledByEndpoint();

  const undocumentedCount = queries.undocumentedUrls().length;
  const handledUndocumentedCount = queries.handledUndocumented();

  const startedHandled = useMemo(() => selectedEndpointHandled, [selected]);
  const [askFinish, setAskFinish] = useState(false);

  useEffect(() => {
    if (selectedEndpointHandled && !startedHandled) {
      setTimeout(
        () => actions.selectNextEndpoint(results.endpointsWithDiffs),
        1250
      );
    }
  }, [selectedEndpointHandled]);

  const handledAll = {
    handled:
      handled.reduce((current, i) => i.handled + current, 0) +
      handledUndocumentedCount,
    total:
      handled.reduce((current, i) => i.diffCount + current, 0) +
      undocumentedCount,
  };

  useEffect(() => {
    if (handledAll.handled === handledAll.total && handledAll.total > 0) {
      setAskFinish(true);
    }
  }, [handledAll.handled, handledAll.total]);

  const NiceSubheader = ({ title, count }) =>
    count > 1 ? (
      <ListSubheader
        disableGutters
        className={classes.subheader}
      >{`${title} (${count})`}</ListSubheader>
    ) : null;

  return (
    <PageWithTopNavigation>
      <Page.Body
        padded={false}
        style={{ flexDirection: 'row', height: '100vh' }}
      >
        <Paper square className={classes.left} elevation={0}>
          <DiffInfoCard {...handledAll} setAskFinish={setAskFinish} />
          <AskFinished {...{ askFinish, setAskFinish }} />
          <Divider style={{ marginTop: 12, marginBottom: 0 }} />
          <List className={classes.list}>
            <UndocumentedCard selected={shouldShowUndocumented} />

            <NiceSubheader
              title={'Endpoints with Diffs'}
              count={results.endpointsWithDiffs.length}
            />
            {results.endpointsWithDiffs.map((i) => (
              <EndpointDetailCard
                key={i.pathId + i.method}
                {...i}
                handledCount={handled.find(
                  (h) => h.pathId === i.pathId && h.method === i.method
                )}
                selected={selected}
              />
            ))}
          </List>
          <Divider />
        </Paper>
        <div className={classes.right}>
          {shouldShowUndocumented && <ReviewUndocumentedUrls />}
          {!shouldShowUndocumented && selected && (
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
    </PageWithTopNavigation>
  );
}

export function EndpointDetailCard(props) {
  const { method, pathId, diffCount, handled, handledCount, selected } = props;
  const { queries, actions } = useDiffSession();
  const classes = useStyles();

  const endpointDescriptor = useMemo(
    () => queries.getEndpointDescriptor({ method, pathId }),
    []
  );

  if (!endpointDescriptor) {
    debugger;
  }
  const { httpMethod, fullPath, endpointPurpose } = endpointDescriptor || {};

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
            {handledCount && (
              <CircularDiffProgress
                handled={handledCount.handled}
                total={handledCount.diffCount}
              />
            )}
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

export function UndocumentedCard(props) {
  const { queries, actions } = useDiffSession();
  const { selected } = props;
  const classes = useStyles();

  const undocumentedUrls = queries.undocumentedUrls();
  const hasUndocumented = undocumentedUrls.length > 0;
  const handledUndocumented = queries.handledUndocumented();

  if (!hasUndocumented) {
    return null;
  }

  return (
    <ListItem
      classes={{
        selected: classes.selected,
      }}
      button
      key={'undocumented'}
      selected={selected}
      onClick={() => actions.toggleUndocumented(true)}
      disableGutters
      divider={true}
    >
      <div className={classes.listInner}>
        <div className={classes.endpointDescriptor}>
          <Typography
            variant="subtitle1"
            className={classes.undocumentedDetected}
          >
            Undocumented Endpoints Detected
          </Typography>
          <Typography
            variant="caption"
            className={classes.undocumentedDetected}
            style={{ fontWeight: 200, color: DocDarkGrey }}
          >
            Add these to your specification for documentation and to manage
            future changes.
          </Typography>
        </div>
        <div style={{ flex: 1 }} />
        <div className={classes.rightAction}>
          <div className={classes.stats}>
            <CircularDiffProgress
              startBlue
              symbol={'+'}
              handled={handledUndocumented}
              total={undocumentedUrls.length}
            />
          </div>
        </div>
      </div>
    </ListItem>
  );
}

const DiffInfoCard = (props) => {
  const classes = useStyles();
  const { total, handled, setAskFinish } = props;

  const { queries } = useDiffSession();

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
        style={{
          paddingTop: 10,
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        <div style={{ flex: 1 }}>Showing diffs from your latest capture</div>
        <div style={{ paddingLeft: 15 }}>
          <IconButton
            size="small"
            onClick={handleClick}
            style={{ marginTop: 10 }}
          >
            <MenuOpenIcon style={{ width: 20, height: 20 }} />
          </IconButton>
        </div>
        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem
            onClick={() => {
              handleClose();
              setAskFinish(true);
            }}
          >
            Finalize
          </MenuItem>
          <MenuItem onClick={handleClose}>Reset Review</MenuItem>
          <MenuItem onClick={handleClose}>Clear Capture</MenuItem>
        </Menu>
      </Box>
      <Handled {...{ total, handled }} />
    </div>
  );
};

export function Handled(props) {
  const { total, handled } = props;
  return (
    <>
      <Box
        flexDirection="row"
        display="flex"
        alignItems="center"
        style={{ marginTop: 5, paddingLeft: 10, paddingRight: 10 }}
      >
        <div style={{ fontSize: 10, color: DocDarkGrey, marginRight: 10 }}>
          You have handled {handled}/{total} Diffs
        </div>
        <LinearProgress
          value={(handled / total) * 100}
          variant="determinate"
          style={{ flex: 1, maxWidth: 100 }}
        />
      </Box>
    </>
  );
}

const useStyles = makeStyles((theme) => ({
  left: {
    width: 400,
    height: '100%',
    background: theme.palette.grey[100],
    overflow: 'scroll',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 900,
  },
  subheader: {
    paddingLeft: 10,
    fontFamily: 'Ubuntu Mono',
    background: theme.palette.grey[100],
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
  undocumentedDetected: {
    fontWeight: 400,
    fontSize: 12,
  },
}));
