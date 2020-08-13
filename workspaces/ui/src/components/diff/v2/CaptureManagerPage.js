import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import time from 'time-ago';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {
  Dark,
  DocDarkGrey,
  DocDivider,
  DocGrey,
} from '../../docs/DocConstants';
import { DocSubGroup } from '../../docs/DocSubGroup';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import { PathAndMethod } from './PathAndMethod';
import WarningIcon from '@material-ui/icons/Warning';
import { Link, Redirect, Route, Switch, useHistory } from 'react-router-dom';
import Chip from '@material-ui/core/Chip';
import { dumpSpecServiceState } from '../../../utilities/dump-spec-service-state';
import { GenericContextFactory } from '../../../contexts/GenericContextFactory';
import {
  useServices,
  useSpecService,
} from '../../../contexts/SpecServiceContext';
import { useRouterPaths } from '../../../RouterPaths';
import { RfcContext } from '../../../contexts/RfcContext';
import classNames from 'classnames';
import {
  DiffResultHelper,
  getOrUndefined,
  JsonHelper,
  lengthScala,
  mapScala,
} from '@useoptic/domain';
import { NewUrlModal } from './AddUrlModal';
import DiffPageNew, { IgnoreDiffContext, IgnoreDiffStore } from './DiffPageNew';
import { Show, ShowSpan } from '../../shared/Show';
import {
  EndpointsContext,
  EndpointsContextStore,
  PathNameFromId,
} from '../../../contexts/EndpointContext';
import MoreRecentCapture from './MoreRecentCapture';
import Page from '../../Page';
import { useBaseUrl } from '../../../contexts/BaseUrlContext';
import EmptyState from '../../support/EmptyState';
import {
  AddedGreenBackground,
  ChangedYellowBackground,
  RemovedRedBackground,
} from '../../../theme';
import { AddOpticLink } from '../../support/Links';
import { debugDump } from '../../../utilities/debug-dump';
import {
  CaptureContext,
  CaptureContextStore,
  useCaptureContext,
} from '../../../contexts/CaptureContext';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { CustomNavTab } from './CustomNavTab';
import LinearProgress from '@material-ui/core/LinearProgress';
import TypeModal from '../../shared/JsonTextarea';
import Fade from '@material-ui/core/Fade';
import { DiffLoadingOverview } from './LoadingNextDiff';
import { DiffStats } from './Stats';
import { track } from '../../../Analytics';
import qs from 'qs';

const {
  Context: AllCapturesContext,
  withContext: withAllCapturesContext,
} = GenericContextFactory(null);
export { AllCapturesContext };

function AllCapturesStore(props) {
  const baseUrl = useBaseUrl();
  const [captures, setCaptures] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const specService = useSpecService();
  const history = useHistory();

  function update() {
    const task = async () => {
      const listCapturesResponse = await specService.listCaptures();
      const { captures } = listCapturesResponse;
      setCaptures(captures);
    };
    task();
  }

  useEffect(() => {
    update();
  }, []);

  useEffect(() => {
    window.addEventListener('focus', update);

    function cleanup() {
      window.removeEventListener('focus', update);
    }

    return cleanup;
  }, []);

  useEffect(() => {
    global.opticDump = dumpSpecServiceState(specService);
    global.dumpEvents = async () => await specService.listEvents();
  }, []);

  function dismissCapture(captureId) {
    setDismissed([...dismissed, captureId]);
  }

  function switchToCapture(captureId) {
    history.push(`${baseUrl}/diffs/${captureId}`);
  }

  const context = {
    captures,
    dismissed,
    dismissCapture,
    switchToCapture,
  };
  return (
    <AllCapturesContext.Provider value={context}>
      {props.children}
    </AllCapturesContext.Provider>
  );
}

export function CaptureManagerPage(props) {
  const routerPaths = useRouterPaths();

  return (
    <Page title="Review API Diffs">
      <Page.Navbar mini={true} />
      <Page.Body padded={false}>
        <AllCapturesStore>
          <IgnoreDiffStore>
            <Switch>
              <Route path={routerPaths.diffsRoot} component={CaptureManager} />
            </Switch>
          </IgnoreDiffStore>
        </AllCapturesStore>
      </Page.Body>
    </Page>
  );
}

export const CaptureManager = ({location}) => {
  const classes = useStyles();
  const routerPaths = useRouterPaths();
  const { captures } = useContext(AllCapturesContext);
  const baseUrl = useBaseUrl();

  return (
    <Switch>
      <Route
        exact
        path={routerPaths.captureRoot}
        component={CaptureDiffWrapper}
      />
      <Route
        exact
        path={routerPaths.captureRequestDiffsRoot}
        component={RequestDiffWrapper}
      />
      {process.env.REACT_APP_FLATTENED_SHAPE_VIEWER === 'true' && (
        <Route
          exact
          path={routerPaths.captureRequestDiffsRootWithViewer}
          component={RequestDiffWrapper}
        />
      )}
      {captures.length && (
        <Redirect to={`${baseUrl}/diffs/${captures[0].captureId}`} />
      )}
      <Route component={() => empty} />
    </Switch>
  );
};

export const subtabs = {
  ENDPOINT_DIFF: 'ENDPOINT_DIFF',
  UNDOCUMENTED_URL: 'UNDOCUMENTED_URL',
};

function CaptureChooserComponent(props) {
  const { captureId } = props;
  const specService = useSpecService();
  const classes = useStyles();
  const captureContext = useContext(AllCapturesContext);
  const {
    endpointDiffs,
    unrecognizedUrls,
    completed,
    skipped,
    processed,
  } = useCaptureContext();
  const history = useHistory();
  const baseUrl = useBaseUrl();

  const realEndpointDiffCount = endpointDiffs.filter(
    (i) => i.count > 0 && i.isDocumentedEndpoint
  ).length;

  const totalEndpoints = endpointDiffs.filter((i) => i.isDocumentedEndpoint)
    .length;

  const urlsSplit = DiffResultHelper.splitUnmatchedUrls(
    JsonHelper.jsArrayToSeq(unrecognizedUrls),
    JsonHelper.jsArrayToSeq(endpointDiffs)
  );

  const query = qs.parse(props.location.search, {
    ignoreQueryPrefix: true
  })

  let defaultTab = subtabs.ENDPOINT_DIFF;

  if (query.tab === subtabs.UNDOCUMENTED_URL) {
    defaultTab = subtabs.UNDOCUMENTED_URL;
  }
  const [tab, setTab] = useState(defaultTab);

  useEffect(() => {
    track(`Changed to ${tab}`, {
      diffCount: realEndpointDiffCount,
      undocumentedUrlCount: urlsSplit.total,
    });
  }, [tab, realEndpointDiffCount, urlsSplit.total]);

  useEffect(() => {
    global.debugOptic = debugDump(specService, captureId);
  });

  useEffect(() => {
    if (totalEndpoints === 0 && unrecognizedUrls.length > 0) {
      setTab(subtabs.UNDOCUMENTED_URL);
    }
  }, [totalEndpoints, unrecognizedUrls.length]);

  function handleChange(event) {
    const captureId = event.target.value;
    history.push(`${baseUrl}/diffs/${captureId}`);
    window.location.reload();
  }

  return (
    <div className={classes.container}>
      <div className={classes.navigationContainer}>
        <div className={classes.navRoot}>
          <div className={classes.header}>
            <FiberManualRecordIcon
              color="secondary"
              fontSize="small"
              style={{ marginRight: 10 }}
            />
            <Typography variant="h6" style={{ fontSize: 19 }}>
              Local Capture
            </Typography>
          </div>

          <FormControl className={classes.formControl} fullWidth>
            <Select
              size="small"
              placeholder="Select Capture"
              value={captureId}
              onChange={handleChange}
            >
              {captureContext.captures.map((capture, index) => {
                return (
                  <MenuItem value={capture.captureId} key={capture.captureId}>
                    <ListItemText
                      primary={`${time.ago(capture.lastUpdate)} ${
                        index === 0 ? '(LATEST) ' : ''
                      } `}
                    />
                    <ListItemSecondaryAction>
                      {capture.hasDiff && (
                        <WarningIcon
                          fontSize="small"
                          color="secondary"
                          style={{ marginRight: 8, paddingTop: 5 }}
                        />
                      )}
                    </ListItemSecondaryAction>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <DocDivider style={{ marginTop: 22, marginBottom: 15 }} />

          <Tabs
            orientation="vertical"
            className={classes.tabs}
            onChange={(_, value) => setTab(value)}
            value={tab}
          >
            <CustomNavTab
              label={`Endpoint Diffs (${realEndpointDiffCount} / ${totalEndpoints}) `}
              value={subtabs.ENDPOINT_DIFF}
            />
            <CustomNavTab
              label={`Undocumented URLs (${urlsSplit.total})`}
              value={subtabs.UNDOCUMENTED_URL}
            />
          </Tabs>

          <DocDivider style={{ marginTop: 22, marginBottom: 15 }} />

          <div style={{ flex: 1 }} />

          <DiffStats showSkipped={true} />
        </div>
      </div>
      <div className={classes.pageContainer}>
        <div className={classes.center}>
          {subtabs.ENDPOINT_DIFF === tab && (
            <EndpointDiffs captureId={captureId} />
          )}
          {subtabs.UNDOCUMENTED_URL === tab && (
            <UnrecognizedUrls captureId={captureId} urlsSplit={urlsSplit} />
          )}
        </div>
      </div>
    </div>
  );
}

function RequestDiffWrapper(props) {
  const specService = useSpecService();
  const classes = useStyles();

  return (
    // sessionId={props.match.params.captureId}
    // specService={specService}
    <DiffPageNew {...props} />
  );
}

const empty = (
  <EmptyState
    title="Optic has not observed any traffic"
    content={`
Run \`api start\` and send the API some traffic

Not setup yet? Follow the [Getting Started Tutorial](${AddOpticLink})
`.trim()}
  />
);

function CaptureDiffWrapper(props) {
  const { captureId } = props.match.params;
  const classes = useStyles();

  const rfcContext = useContext(RfcContext);
  const services = useServices();

  return (
    <IgnoreDiffContext.Consumer>
      {({ ignoredDiffs, resetIgnored }) => (
        <CaptureContextStore
          captureId={captureId}
          ignoredDiffs={ignoredDiffs}
          {...services}
        >
          <CaptureChooserComponent location={props.location} captureId={captureId} />
        </CaptureContextStore>
      )}
    </IgnoreDiffContext.Consumer>
  );
}

function CaptureDiffStat() {
  const classes = useStyles();
  // const { stats } = useCaptureContext();
  //also available
  // stats.captureCompleted
  // stats.processed
  return (
    <div className={classes.stats}>
      <Typography variant="h6" color="primary" style={{ fontWeight: 200 }}>
        Optic observed <Stat number={0} label="interaction" />, yielding{' '}
        <Stat number={0} label="diff" /> and{' '}
        <Stat number={0} label="undocumented endpoint" />.
        {/*<Stat number={stats.interactionsCounter || 0} label="interaction" />,*/}
        {/*yielding <Stat number={stats.totalDiffs || 0} label="diff" /> and{' '}*/}
        {/*<Stat*/}
        {/*  number={stats.undocumentedEndpoints || 0}*/}
        {/*  label="undocumented endpoint"*/}
        {/*/>*/}
        {/*.*/}
      </Typography>
    </div>
  );
}

function EndpointDiffs(props) {
  const { captureId } = props;
  const classes = useStyles();
  const { endpointDiffs, completed } = useCaptureContext();
  const history = useHistory();
  const baseUrl = useBaseUrl();

  const real = endpointDiffs.filter((i) => i.isDocumentedEndpoint);
  const realCount = real.length;
  const anyHaveDiffs = real.some((i) => i.count > 0);

  if (realCount === 0 && !completed) {
    return <DiffLoadingOverview show={true} />;
  }

  //also available
  // stats.captureCompleted
  // stats.processed
  return (
    <>
      <div className={classes.stats}>
        <Typography variant="h6" color="primary" style={{ fontWeight: 200 }}>
          {anyHaveDiffs
            ? 'Some endpoints are exhibiting undocumented behavior'
            : 'All endpoints are working as specified'}
        </Typography>
      </div>
      <List style={{ padding: 13, paddingTop: 4 }}>
        {endpointDiffs.map((i) => {
          //skip undocumented
          if (!i.isDocumentedEndpoint) {
            return null;
          }

          const to = `${baseUrl}/diffs/${captureId}/paths/${i.pathId}/methods/${i.method}`;
          return (
            <EndpointsContextStore key={to} pathId={i.pathId} method={i.method}>
              <Paper
                className={classNames(classes.paper, {
                  [classes.disabled]: i.count === 0,
                })}
              >
                <EndpointsContext.Consumer>
                  {({ endpointDescriptor }) => (
                    <ListItem
                      button
                      className={classes.row}
                      component={Link}
                      to={to}
                      onClick={() => {
                        track('Viewing Endpoint Diff', i);
                      }}
                    >
                      <div className={classes.listItemInner}>
                        <Typography component="div" variant="subtitle2">
                          {endpointDescriptor.endpointPurpose || (
                            <span style={{ color: DocDarkGrey }}>
                              Unamed Endpoint
                            </span>
                          )}
                        </Typography>
                        <PathAndMethod
                          method={endpointDescriptor.httpMethod}
                          path={endpointDescriptor.fullPath}
                        />
                      </div>
                      <ListItemSecondaryAction>
                        <ShowSpan when={i.count > 0}>
                          <Chip
                            className={classes.chips}
                            size="small"
                            label={`Diffs: ${i.count}`}
                            style={{
                              backgroundColor: ChangedYellowBackground,
                            }}
                          />
                        </ShowSpan>
                        <ShowSpan when={i.count === 0}>
                          <Chip
                            className={classes.chips}
                            size="small"
                            label={`No Diffs`}
                            style={{
                              backgroundColor: AddedGreenBackground,
                            }}
                          />
                        </ShowSpan>
                      </ListItemSecondaryAction>
                    </ListItem>
                  )}
                </EndpointsContext.Consumer>
              </Paper>
            </EndpointsContextStore>
          );
        })}
      </List>
    </>
  );
}

function UnrecognizedUrls(props) {
  const { captureId, urlsSplit } = props;
  const classes = useStyles();
  const history = useHistory();
  const { unrecognizedUrls, endpointDiffs, completed } = useCaptureContext();
  const baseUrl = useBaseUrl();

  const undocumented = JsonHelper.seqToJsArray(urlsSplit.undocumented);
  const allUnmatchedPaths = JsonHelper.seqToJsArray(urlsSplit.allPaths);
  const urls = JsonHelper.seqToJsArray(urlsSplit.urls);

  const [pendingUrl, setPendingUrl] = useState(null);

  if (urls.length === 0 && undocumented.length === 0 && !completed) {
    return <DiffLoadingOverview show={true} />;
  }

  return (
    <>
      {pendingUrl && (
        <NewUrlModal
          onClose={() => setPendingUrl(null)}
          allUnmatchedPaths={allUnmatchedPaths}
          urlOverride={pendingUrl.override}
          newUrl={pendingUrl}
          onAdd={(result) => {
            const { pathId, method } = result;
            const to = `${baseUrl}/diffs/${captureId}/paths/${pathId}/methods/${method}`;
            history.push(to);
          }}
        />
      )}
      <div className={classes.stats}>
        <Typography variant="h6" color="primary" style={{ fontWeight: 200 }}>
          Optic observed{' '}
          <Stat number={urlsSplit.totalCount || 0} label="undocumented url" />.
        </Typography>
      </div>

      <Show when={urlsSplit.totalCount >= 250}>
        <div className={classes.subStat}>
          <Typography variant="caption" style={{ color: DocGrey }}>
            Showing {urls.length} undocumented URLs. Start documenting the new
            endpoints or ignore the paths in your optic.yml file.
          </Typography>
        </div>
      </Show>

      <Show when={undocumented.length}>
        <Typography variant="subtitle2" color="primary" style={{ padding: 9 }}>
          Ready to Document
        </Typography>
        <List style={{ marginBottom: 12 }}>
          {undocumented.map((i) => {
            const url = <PathNameFromId pathId={getOrUndefined(i.pathId)} />;

            return (
              <ListItem
                button
                className={classes.row}
                divider={true}
                onClick={() => {
                  setPendingUrl({
                    pathId: i.pathId,
                    path: i.path,
                    method: i.method,
                    override: url,
                  });
                }}
              >
                <div className={classes.listItemInner}>
                  <PathAndMethod method={i.method} path={url} />
                </div>
                <ListItemSecondaryAction>
                  <Chip
                    className={classes.chips}
                    size="small"
                    label={i.count + ' observations'}
                    style={{
                      backgroundColor: AddedGreenBackground,
                    }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>

        {urls.length > 0 && (
          <Typography
            variant="subtitle2"
            color="primary"
            style={{ padding: 9 }}
          >
            Unrecognized URLs
          </Typography>
        )}
      </Show>

      <List>
        {urls.map((i) => {
          return (
            <ListItem
              button
              className={classes.row}
              divider={true}
              onClick={() => {
                setPendingUrl(i);
              }}
            >
              <div className={classes.listItemInner}>
                <PathAndMethod method={i.method} path={i.path} />
              </div>
              <ListItemSecondaryAction>
                <Chip
                  className={classes.chips}
                  size="small"
                  label={i.count + ' observations'}
                  style={{
                    backgroundColor: AddedGreenBackground,
                  }}
                />
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
    </>
  );
}

const Stat = ({ number, label }) => {
  return (
    <span>
      {number !== 0 && (
        <Typography
          variant="h6"
          component="span"
          color="secondary"
          style={{ fontWeight: 800 }}
        >
          {number}{' '}
        </Typography>
      )}
      <Typography variant="h6" component="span" style={{ fontWeight: 800 }}>
        {number === 0 && 'no '}
        {label}
        {number === 1 ? '' : 's'}
      </Typography>
    </span>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    overflow: 'hidden',
  },
  navigationContainer: {
    width: 280,
    overflow: 'hidden',
    display: 'flex',
  },
  pageContainer: {
    display: 'flex',
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'center',
  },
  navRoot: {
    flexGrow: 1,
    position: 'fixed',
    width: 'inherit',
    height: '100vh',
    overflowY: 'visible',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    borderRight: `1px solid ${theme.palette.grey[300]}`,
    background: theme.palette.grey[100],
  },
  chips: {
    marginLeft: 10,
  },
  tabs: {
    marginLeft: theme.spacing(4),
  },
  center: {
    flex: 1,
    maxWidth: 1200,
  },
  statsSection: {
    paddingBottom: theme.spacing(2),
  },
  progressStats: {
    paddingLeft: theme.spacing(1),
    color: DocDarkGrey,
  },
  progressWrapper: {
    height: 6,
    width: '100%',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    flexShrink: 1,
    width: '100%',
    alignItems: 'center',
    margin: theme.spacing(2),
  },
  formControl: {
    paddingLeft: 35,
    paddingRight: 15,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  stats: {
    marginTop: 20,
    paddingBottom: 15,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  subStat: {
    paddingBottom: 15,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  listItemInner: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  disabled: {
    pointerEvents: 'none',
    opacity: 0.5,
  },
  paper: {
    marginBottom: 15,
  },
  diffContainer: {
    display: 'flex',
    
    paddingLeft: 32,
    paddingRight: 32,
    flexDirection: 'row',
    overflow: 'scroll',
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'center',
  },
  diffWrapper: {
    flex: 1,
    padding: '24px 0px 144px',
    maxWidth: 1280,
  },
}));
