import React, {useContext, useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import time from 'time-ago';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {DocDarkGrey} from '../../requests/DocConstants';
import {DocSubGroup} from '../../requests/DocSubGroup';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import {PathAndMethod} from './PathAndMethod';
import WarningIcon from '@material-ui/icons/Warning';
import {useHistory} from 'react-router-dom';
import Chip from '@material-ui/core/Chip';
import {Link, withRouter} from 'react-router-dom';

import {
  AddedGreen,
  AddedGreenBackground,
  ChangedYellow, ChangedYellowBackground,
  RemovedRed,
  RemovedRedBackground
} from '../../../contexts/ColorContext';
import {TrafficSessionStore, TrafficSessionContext} from '../../../contexts/TrafficSessionContext';
import {GenericContextFactory} from '../../../contexts/GenericContextFactory';
import {SpecServiceContext, useSpecService, withSpecServiceContext} from '../../../contexts/SpecServiceContext';
import {useRouterPaths} from '../../../RouterPaths';
import {RfcContext, withRfcContext} from '../../../contexts/RfcContext';
import {lengthScala, mapScala, JsonHelper} from '@useoptic/domain';
import {NewUrlModal} from './AddUrlModal';
import {Route, Switch} from 'react-router-dom';
import DiffPageNew, {IgnoreDiffContext, IgnoreDiffStore} from './DiffPageNew';
import {Show, ShowSpan} from '../../shared/Show';
import {EndpointsContextStore, EndpointsContext} from '../../../contexts/EndpointContext';
import MoreRecentCapture from './MoreRecentCapture';
import Page from '../../Page';
import {useBaseUrl} from '../../../contexts/BaseUrlContext';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
    alignSelf: 'center', // center on page
    flexGrow: 1, // grow to fill whole page vertically
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 1200,
    paddingTop: 35,
  },
  chips: {
    marginLeft: 10,
  },
  scroll: {
    overflow: 'scroll',
    flex: 1,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 300,
    maxWidth: 1200
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    width: '100%',
    alignItems: 'center',
    padding: 8,
    paddingLeft: 20,
  },
  formControl: {
    margin: theme.spacing(1),
    width: 250,
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
  listItemInner: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    marginBottom: 11
  }
}));

const {
  Context: AllCapturesContext,
  withContext: withAllCapturesContext
} = GenericContextFactory(null);
export {
  AllCapturesContext
};

function AllCapturesStore(props) {
  const baseUrl = useBaseUrl();
  const [captures, setCaptures] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const specService = useSpecService();
  const history = useHistory();

  function update() {
    const task = async () => {
      const listCapturesResponse = await specService.listCaptures();
      const {captures} = listCapturesResponse;
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
    switchToCapture
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
    <Page title="Optic Live Contract Testing Dashboard">
      <Page.Navbar
        mini={true}
      />
      <Page.Body>
        <AllCapturesStore>
          <IgnoreDiffStore>
            <Switch>
              <Route path={routerPaths.diffsRoot} component={CaptureManager}/>
            </Switch>
          </IgnoreDiffStore>
        </AllCapturesStore>
      </Page.Body>
    </Page>
  );

};

export const CaptureManager = ({}) => {
  const classes = useStyles();
  const routerPaths = useRouterPaths();

  return (
    <div className={classes.container}>
      <Switch>
        <Route exact path={routerPaths.captureRoot} component={CaptureDiffWrapper}/>
        <Route exact path={routerPaths.captureRequestDiffsRoot} component={RequestDiffWrapper}/>
        <Route component={RootDiffWrapper}/>
      </Switch>
    </div>
  );
};

function RootDiffWrapper() {
  const classes = useStyles();
  const captureContext = useContext(AllCapturesContext);
  const baseUrl = useBaseUrl();
  const history = useHistory();

  function handleChange(event) {
    const captureId = event.target.value;
    history.push(`${baseUrl}/diffs/${captureId}`);
  }

  return (
    <Paper>
      <div className={classes.header}>
        <FiberManualRecordIcon color="secondary" fontSize="medium" style={{marginRight: 10}}/>
        <Typography variant="h6" style={{fontSize: 19}}>Local Capture</Typography>
        <div style={{flex: 1}}/>

        <FormControl className={classes.formControl}>
          <Select
            placeholder="Select Capture"
            onChange={handleChange}
          >
            {captureContext.captures.map((capture, index) => {
              return (
                <MenuItem value={capture.captureId}>
                  <ListItemText primary={`${time.ago(capture.lastUpdate)} ${index === 0 ? '(LATEST) ' : ''} `}/>
                  <ListItemSecondaryAction>
                    {capture.hasDiff &&
                    <WarningIcon fontSize="small" color="secondary" style={{marginRight: 8, paddingTop: 5}}/>}
                  </ListItemSecondaryAction>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </div>
    </Paper>
  );
}

function RequestDiffWrapper(props) {
  const specService = useSpecService();
  return (
    <TrafficSessionStore sessionId={props.match.params.captureId} specService={specService}>
      <DiffPageNew {...props} />
    </TrafficSessionStore>
  );
}

function CaptureDiffWrapper(props) {
  const {captureId} = props.match.params;
  const baseUrl = useBaseUrl();
  const classes = useStyles();
  const specService = useSpecService();
  const history = useHistory();
  const [alphabetize, setAlphabetize] = useState(true);
  const {ignoredDiffs} = useContext(IgnoreDiffContext);
  const {rfcService, rfcId} = useContext(RfcContext);
  const rfcState = rfcService.currentState(rfcId);
  return (
    <TrafficSessionStore
      key={captureId}
      sessionId={captureId}
      specService={specService}
      renderNoSession={<div>No Capture</div>}>
      <TrafficSessionContext.Consumer>
        {({diffManager}) => {

          diffManager.updatedRfcState(rfcState);

          const ignoredAsSeq = JsonHelper.jsArrayToSeq(ignoredDiffs);
          const stats = diffManager.stats(ignoredAsSeq);
          const allUnmatchedPaths = JsonHelper.seqToJsArray(diffManager.allUnmatchedPaths);
          const newUrls = diffManager.unmatchedUrls(alphabetize, ignoredAsSeq);
          const endpointDiffs = diffManager.endpointDiffs(ignoredAsSeq, /* filter ouunmatched URLs */ true);

          return (
            <>

              <div className={classes.stats}>
                <Typography variant="h6" color="primary" style={{fontWeight: 200}}>
                  Optic observed <Stat number={stats.totalInteractions} label="interaction"/>,
                  yielding in <Stat number={stats.totalDiffs} label="diff"/>{' '}
                  and <Stat number={stats.undocumentedEndpoints} label="undocumented endpoint"/>.</Typography>
              </div>
              <Show when={lengthScala(endpointDiffs) > 0}>
                <DocSubGroup title={`Endpoint Diffs (${lengthScala(endpointDiffs)})`}>
                  <List fullWidth>
                    {mapScala(endpointDiffs)(i => {
                      const to = `${baseUrl}/diffs/${captureId}/paths/${i.pathId}/methods/${i.method}`;
                      return (
                        <EndpointsContextStore pathId={i.pathId} method={i.method}>
                          <EndpointsContext.Consumer>
                            {({endpointDescriptor}) => (
                              <ListItem button className={classes.row} component={Link} to={to}>
                                <div className={classes.listItemInner}>
                                  <Typography component="div" variant="overline"
                                              style={{color: DocDarkGrey}}>{endpointDescriptor.purpose}</Typography>
                                  <PathAndMethod method={endpointDescriptor.httpMethod}
                                                 path={endpointDescriptor.fullPath}/>
                                </div>
                                <ListItemSecondaryAction>
                                  <ShowSpan when={i.addedCount > 0}>
                                    <Chip className={classes.chips} size="small" label={i.addedCount}
                                          style={{backgroundColor: AddedGreenBackground}}/>
                                  </ShowSpan>
                                  <ShowSpan when={i.removedCount > 0}>
                                    <Chip className={classes.chips} size="small" label={i.removedCount}
                                          style={{backgroundColor: RemovedRedBackground}}/>
                                  </ShowSpan>
                                  <ShowSpan when={i.changedCount > 0}>
                                    <Chip className={classes.chips} size="small" label={i.changedCount}
                                          style={{backgroundColor: ChangedYellowBackground}}/>
                                  </ShowSpan>
                                </ListItemSecondaryAction>
                              </ListItem>
                            )}
                          </EndpointsContext.Consumer>
                        </EndpointsContextStore>
                      );
                    })}

                  </List>
                </DocSubGroup>
              </Show>

              <Show when={lengthScala(newUrls) > 0}>
                <DocSubGroup title={`Undocumented URLs (${lengthScala(newUrls)})`}>
                  <List fullWidth>
                    {mapScala(newUrls)(i => {
                      return (
                        <NewUrlModal
                          allUnmatchedPaths={allUnmatchedPaths}
                          newUrl={i}
                          onAdd={(result) => {
                            const {pathId, method} = result;
                            const to = `${baseUrl}/diffs/${captureId}/paths/${pathId}/methods/${method}`;
                            history.push(to);
                          }}>
                          <ListItem button className={classes.row}>
                            <div className={classes.listItemInner}>
                              <PathAndMethod method={i.method} path={i.path}/>
                            </div>
                            <ListItemSecondaryAction>
                              <Chip className={classes.chips} size="small" label={i.count}
                                    style={{backgroundColor: AddedGreenBackground}}/>
                            </ListItemSecondaryAction>
                          </ListItem>
                        </NewUrlModal>
                      );
                    })}
                  </List>
                </DocSubGroup>
              </Show>
              <MoreRecentCapture/>
            </>
          );
        }}
      </TrafficSessionContext.Consumer>
    </TrafficSessionStore>
  );
}

const Stat = ({number, label}) => {
  return (
    <span>
      {number !== 0 &&
      <Typography variant="h6" component="span" color="secondary" style={{fontWeight: 800}}>{number} </Typography>}
      <Typography variant="h6" component="span"
                  style={{fontWeight: 800}}>{number === 0 && 'no '}{label}{number === 1 ? '' : 's'}</Typography>
    </span>
  );

};
