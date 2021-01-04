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
import { PathAndMethodMono } from '../v2/PathAndMethod';
import { DocDarkGrey, DocGrey } from '../../docs/DocConstants';
import { useDiffSession } from './ReviewDiffSession';
import { ReviewEndpoint } from './ReviewEndpoint';
import { CircularDiffProgress } from '../../../storybook/stories/diff-page/CircularDiffProgress';
import { ReviewUndocumentedUrls } from './learn-api/ReviewUndocumented';
import { AskFinished } from './AskFinished';
import Helmet from 'react-helmet';
import { ReviewBatchSelect } from './ReviewBatchSelect';
import Fade from '@material-ui/core/Fade';
import { useCaptureContext } from '../../../contexts/CaptureContext';
import { debugDump } from '../../../utilities/debug-dump';
import equals from 'lodash.isequal';
import { DiffSummaryRegion } from './ReviewDiff';
export function ReviewUI() {
  const classes = useStyles();
  const { queries, actions } = useDiffSession();

  const results = queries.endpointSections();
  const { processed, skipped } = useCaptureContext();

  const selected = queries.selectedEndpoint();

  const shouldShowUndocumented = queries.showingUndocumented();
  const selectedEndpointHandled = queries.selectedEndpointHandled();
  const handled = queries.handledByEndpoint();

  const unrecognizedCount =
    queries.unrecognizedUrls().length + queries.undocumentedEndpoints().length;
  const handledUndocumentedCount = queries.handledUndocumented();

  const startedHandled = useMemo(() => selectedEndpointHandled, [selected]);
  const [askFinish, setAskFinish] = useState(false);

  // useEffect(() => {
  //   if (selectedEndpointHandled && !startedHandled) {
  //     setTimeout(
  //       () => actions.selectNextEndpoint(results.endpointsWithDiffs),
  //       1250
  //     );
  //   }
  // }, [selectedEndpointHandled]);

  const resetAll = () => actions.resetAll(results.endpointsWithDiffs);

  const handledAll = {
    handled:
      handled.reduce((current, i) => i.handled + current, 0) +
      handledUndocumentedCount,
    total:
      handled.reduce((current, i) => i.diffCount + current, 0) +
      unrecognizedCount,
  };

  console.log('handledUndocumentedCount', handledUndocumentedCount);

  useEffect(() => {
    if (handledAll.handled === handledAll.total && handledAll.total > 0) {
      setAskFinish(true);
    }
  }, [handledAll.handled, handledAll.total]);

  const noDiffs = handledAll.total === 0;

  const NiceSubheader = ({ title, count }) =>
    count > 1 ? (
      <div className={classes.subheader}>
        <Typography variant="overline">{`${title} (${count})`}</Typography>
      </div>
    ) : null;

  return (
    <Page>
      <Page.Navbar mini={true} />
      <Page.Body
        padded={false}
        style={{ flexDirection: 'row', height: '100vh' }}
      >
        <Paper square className={classes.left} elevation={0}>
          <DiffInfoCard
            noDiffs={noDiffs}
            {...handledAll}
            resetAll={resetAll}
            setAskFinish={setAskFinish}
          />

          {askFinish && <AskFinished {...{ setAskFinish }} />}
          <List className={classes.list}>
            <UndocumentedCard selected={shouldShowUndocumented} />
            <NiceSubheader
              title={'Endpoints with Diffs'}
              count={results.endpointsWithDiffs.length}
            />
            {results.endpointsWithDiffs.map((i) => (
              <EndpointDetailCardWrapper
                key={i.pathId + i.method}
                {...i}
                handledCount={handled.find(
                  (h) => h.pathId === i.pathId && h.method === i.method
                )}
                queries={queries}
                actions={actions}
                selected={selected}
              />
            ))}
            {noDiffs && (
              <div className={classes.noDiff}>
                <Typography variant="subtitle2" color="textSecondary">
                  Observed {parseInt(processed) + parseInt(skipped)} requests
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  No diffs for {results.totalEndpoints} documented endpoint
                  {results.totalEndpoints === 1 ? '' : 's'}
                </Typography>
              </div>
            )}
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
          {noDiffs && <NoDiffs />}
        </div>
      </Page.Body>
    </Page>
  );
}

class EndpointDetailCardWrapper extends React.Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const isSelected = (selected) => {
      return (
        selected &&
        selected.pathId === this.props.pathId &&
        selected.method === this.props.method
      );
    };
    const shouldUpdate =
      !equals(nextProps.handledCount, this.props.handledCount) ||
      !equals(isSelected(nextProps.selected), isSelected(this.props.selected));

    return shouldUpdate;
  }

  render() {
    return <EndpointDetailCard {...this.props} />;
  }
}

export function EndpointDetailCard(props) {
  const {
    method,
    pathId,
    handledCount,
    handled,
    selected,
    queries,
    actions,
  } = props;

  const classes = useStyles();

  const endpointDescriptor = useMemo(
    () => queries.getEndpointDescriptor({ method, pathId }),
    []
  );

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
      onClick={() => {
        actions.selectEndpoint(pathId, method);
      }}
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

  const unrecognizedUrls = queries.unrecognizedUrls();
  const undocumentedEndpoints = queries.undocumentedEndpoints();
  const hasUndocumented =
    unrecognizedUrls.length > 0 || undocumentedEndpoints.length > 0;

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
            Add these to your specification for documentation and to detect
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
              total={unrecognizedUrls.length + undocumentedEndpoints.length}
            />
          </div>
        </div>
      </div>
    </ListItem>
  );
}

const DiffInfoCard = (props) => {
  const classes = useStyles();
  const { total, noDiffs, handled, setAskFinish, resetAll } = props;

  const { queries } = useDiffSession();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Paper elevation={0} square className={classes.info}>
        <Helmet>
          <title>{`Review (${handled} / ${total}) diff${
            total === 1 ? '' : 's'
          }`}</title>
        </Helmet>
        <ReviewBatchSelect />
        <Handled {...{ total, handled, noDiffs, setAskFinish, resetAll }} />
      </Paper>
      <Divider />
    </>
  );
};

export function Handled(props) {
  const { total, handled, noDiffs, setAskFinish, resetAll } = props;
  return (
    <Box
      flexDirection="column"
      display="flex"
      alignItems="flex-start"
      style={{ width: '100%' }}
    >
      <div style={{ width: '100%' }}>
        <div style={{ padding: '6px 6px 0px 6px' }}>
          <Fade in={total > 0}>
            <LinearProgress
              value={total > 0 ? (handled / total) * 100 : 0}
              variant="determinate"
              style={{ flex: 1 }}
            />
          </Fade>
        </div>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          style={{ paddingLeft: 2, paddingRight: 2 }}
        >
          <Button
            size="small"
            style={{ fontSize: 10, minWidth: 'auto' }}
            color="primary"
            disabled={noDiffs}
            onClick={resetAll}
          >
            Reset
          </Button>
          <Typography
            variant="overline"
            style={{ color: DocGrey, fontSize: 10 }}
          >
            You handled ({handled} / {total}) diff{total === 1 ? '' : 's'}
          </Typography>
          <Button
            size="small"
            style={{ fontSize: 10, minWidth: 'auto' }}
            color="primary"
            disabled={handled === 0}
            onClick={setAskFinish}
          >
            Finalize
          </Button>
        </Box>
      </div>
    </Box>
  );
}

function NoDiffs() {
  const classes = useStyles();
  return (
    <div className={classes.fullPage}>
      <img src={'/no-diffs.svg'} height={50} />
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  left: {
    minWidth: 350,
    maxWidth: 420,
    background: theme.palette.grey[100],
    overflow: 'scroll',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 900,
  },
  subheader: {
    paddingLeft: 5,
    fontFamily: 'Ubuntu Mono',
    color: DocDarkGrey,
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
    background: theme.palette.grey[100],
    fontSize: 12,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    minHeight: 70,
  },
  selected: {
    borderRight: `4px solid ${secondary}`,
    transition: 'border-width 0.1s ease-in-out',
  },
  undocumentedDetected: {
    fontWeight: 400,
    flexShrink: 1,
    maxWidth: 260,
    fontSize: 12,
  },
  fullPage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
  noDiff: {
    padding: 15,
    textAlign: 'center',
    paddingTop: 30,
  },
}));
