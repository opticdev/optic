import React, {useContext, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import TypeModal from '../../shared/JsonTextarea';
import Typography from '@material-ui/core/Typography';
import {Card, ListItemSecondaryAction, ListItemText, TextField} from '@material-ui/core';
import time from 'time-ago';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {DocDarkGrey, DocDivider} from '../../requests/DocConstants';
import {DocSubGroup} from '../../requests/DocSubGroup';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import GridList from '@material-ui/core/GridList';
import {PathAndMethod} from './PathAndMethod';
import WarningIcon from '@material-ui/icons/Warning';
import {useHistory} from 'react-router-dom';
import Chip from '@material-ui/core/Chip';
import {Link, withRouter} from 'react-router-dom';
import {matchPath} from 'react-router';
import {
  AddedGreen,
  AddedGreenBackground,
  ChangedYellow, ChangedYellowBackground,
  RemovedRed,
  RemovedRedBackground
} from '../../../contexts/ColorContext';
import {TrafficSessionStore, TrafficSessionContext} from '../../../contexts/TrafficSessionContext';
import {GenericContextFactory} from '../../../contexts/GenericContextFactory';
import {withSpecServiceContext} from '../../../contexts/SpecServiceContext';
import {routerPaths, useRouterPaths} from '../../../RouterPaths';
import {RfcContext, withRfcContext} from '../../../contexts/RfcContext';
import {lengthScala, mapScala, JsonHelper} from '@useoptic/domain';
import {NewUrlModal} from './AddUrlModal';
import {Route, Switch} from 'react-router-dom';
import {UrlsX} from '../../paths/NewUnmatchedUrlWizard';
import DiffPageNew, {IgnoreDiffContext, IgnoreDiffStore} from './DiffPageNew';
import ApiOverview from '../../navigation/ApiOverview';
import {Show, ShowSpan} from '../../shared/Show';
import {EndpointsContextStore, EndpointsContext} from '../../../contexts/EndpointContext';
import MoreRecentCapture from './MoreRecentCapture';
import Page from '../../Page';
import ReportsNavigation from '../../testing/reports-nav';
import {Provider as TestingDashboardContextProvider} from '../../../contexts/TestingDashboardContext';
import {TestingDashboard} from '../../dashboards/TestingDashboard';
import {InitialRfcCommandsContext} from '../../../contexts/InitialRfcCommandsContext';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    margin: '0 auto',
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

class _AllCapturesStore extends React.Component {

  state = {
    captures: [],
    dismissed: null
  };

  componentDidMount = () => {
    this.update();
    window.addEventListener('focus', this.update);
  };

  componentWilUnmount = () => {
    window.removeEventListener('focus', this.update);
  };

  update = () => {
    this.props.specService.listCaptures().then(({captures}) => {
      this.setState({captures});
    });
  };

  render() {

    const {location} = this.props;
    const matched = matchPath(location.pathname, {
      //@todo fix this
      path: routerPaths.diffPageWithCapture(this.props.baseUrl),
      exact: false,
      strict: true
    });

    const currentCaptureId = matched && matched.params.captureId;
    const lastCaptureId = (this.state.captures[0] || {}).captureId;
    const to = `/diff/${lastCaptureId}`;

    const context = {
      captures: this.state.captures,
      lastCapture: this.state.captures[0],
    };

    const shouldShow = matched && lastCaptureId && currentCaptureId !== lastCaptureId && this.state.dismiss !== lastCaptureId;
    return (
      <AllCapturesContext.Provider value={context}>
        {this.props.children}
        <MoreRecentCapture
          open={shouldShow}
          target={to}
          dismiss={() => this.setState({dismissed: lastCaptureId})}/>
      </AllCapturesContext.Provider>
    );
  }
}

export const AllCapturesStore = withRouter(withSpecServiceContext(_AllCapturesStore));

export const CaptureManagerPage = ({match, specService}) => {

  const routerPaths = useRouterPaths();


  return (
    <Page title="Optic Live Contracting Dashboard">
      <Page.Navbar
        mini={true}
        baseUrl={match.url}
      />
      <Page.Body>
        <Switch>
          <AllCapturesStore>
            <IgnoreDiffStore>
              <Switch>
                <Route exact path={routerPaths.diffPage()}
                       component={() => <CaptureManager specService={specService}/>}/>
                <Route exact path={routerPaths.diffPageWithCapture()}
                       component={(props) => <CaptureManager specService={specService}
                                                             captureId={props.match.params.captureId}/>}/>
                <Route exact path={routerPaths.diffRequestNew()} component={(props) => {
                  return (
                    <TrafficSessionStore sessionId={props.match.params.captureId} specService={specService}>
                      <DiffPageNew {...props} />
                    </TrafficSessionStore>
                  );
                }}/>
              </Switch>
            </IgnoreDiffStore>
          </AllCapturesStore>
        </Switch>
      </Page.Body>
    </Page>
  );

};

export const CaptureManager = ({captureId, specService}) => {
  const classes = useStyles();
  const {rfcService, rfcId} = useContext(RfcContext);
  const history = useHistory();
  const captureContext = useContext(AllCapturesContext);
  const {ignoredDiffs} = useContext(IgnoreDiffContext);
  const [alphabetize, setAlphabetize] = useState(true);
  const rfcState = rfcService.currentState(rfcId);

  function handleChange(event) {
    const captureId = event.target.value;
    history.push(`diff/${captureId}`);
  }

  if (captureContext.captures.length > 0 && !captureId) {
    history.push(`diff/${captureContext.captures[0].captureId}`);
    return null;
  }

  return (
    <div className={classes.container}>
      <div className={classes.scroll}>
        <Paper>
          <div className={classes.header}>
            <FiberManualRecordIcon color="secondary" fontSize="medium" style={{marginRight: 10}}/>
            <Typography variant="h6" style={{fontSize: 19}}>Local Capture</Typography>
            <div style={{flex: 1}}/>

            <FormControl className={classes.formControl}>
              <Select
                value={captureId}
                placeholder="Select Capture"
                onChange={handleChange}
              >
                {captureContext.captures.map((capture, index) => {
                  const selected = capture.captureId !== captureId;
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
        {captureId && (
          <TrafficSessionStore
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

                    {rfcState.toString()}
                    <div>
                      {rfcState.toString().length}
                    </div>

                    <Show when={lengthScala(endpointDiffs) > 0}>
                      <DocSubGroup title={`Endpoint Diffs (${lengthScala(endpointDiffs)})`}>
                        <List fullWidth>
                          {mapScala(endpointDiffs)(i => {
                            const to = `${captureId}/paths/${i.pathId}/methods/${i.method}`;
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
                              <NewUrlModal {...{allUnmatchedPaths, newUrl: i, captureId}}>
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
                  </>
                );
              }}
            </TrafficSessionContext.Consumer>
          </TrafficSessionStore>
        )}
      </div>
    </div>
  );
};

const Stat = ({number, label}) => {
  const classes = useStyles();
  return (
    <span>
      {number !== 0 &&
      <Typography variant="h6" component="span" color="secondary" style={{fontWeight: 800}}>{number} </Typography>}
      <Typography variant="h6" component="span"
                  style={{fontWeight: 800}}>{number === 0 && 'no '}{label}{number === 1 ? '' : 's'}</Typography>
    </span>
  );

};
