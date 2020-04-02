import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {InitialRfcCommandsStore} from '../../contexts/InitialRfcCommandsContext';
import {RfcStore} from '../../contexts/RfcContext';
import {routerPaths} from '../../RouterPaths';
import {NavigationStore} from '../../contexts/NavigationContext';
import {RequestsDetailsPage, RequestsDetailsPageNew} from '../requests/EndpointPage';
import {UrlsX} from '../paths/NewUnmatchedUrlWizard';
import {TrafficSessionStore} from '../../contexts/TrafficSessionContext';
import compose from 'lodash.compose';
import SessionNavigation from '../navigation/SessionNavigation';
import {ApiOverviewContextStore} from '../../contexts/ApiOverviewContext';
import ApiOverview from '../navigation/ApiOverview';
import APIDashboard, {IntegrationsDashboard} from '../dashboards/APIDashboard';
import {IntegrationsContextStore} from '../../contexts/IntegrationsContext';
import {Redirect} from 'react-router-dom';
import Init from '../onboarding/Init';
import {SpecServiceStore, withSpecServiceContext} from '../../contexts/SpecServiceContext';
import DiffPageNew, {IgnoreDiffStore} from '../diff/v2/DiffPageNew';
import EventEmitter from 'events';
import {dumpSpecServiceState} from '../../utilities/dump-spec-service-state';
import {AllCapturesStore, CaptureManagerPage} from '../diff/v2/CaptureManagerPage';

class LoaderFactory {
  static build(options) {
    const {
      notificationAreaComponent, shareButtonComponent,
      basePath, specServiceTask, specServiceEvents,
      RfcStoreImpl = RfcStore
    } = options;
    if (!specServiceEvents) {
      debugger
    }

    const entryBasePath = basePath;

    function SessionWrapper(props) {
      const {match, specService} = props;
      const {sessionId} = match.params;
      return (
        <TrafficSessionStore
          sessionId={sessionId}
          specService={specService}
        >
          <Switch>
            <Route exact path={routerPaths.diffUrls(match.path)} component={UrlsX}/>
            <Route exact path={routerPaths.diffRequestNew(match.path)} component={DiffPageNew}/>
            <Route component={withSpecServiceContext(ApiOverview)}/>
          </Switch>
        </TrafficSessionStore>
      );
    }

    function withTask(taskFunction, propName, eventEmitter = null) {
      return function (Wrapped) {
        class Runner extends React.Component {
          state = {
            isLoading: true,
            error: null,
            result: null
          };

          componentDidMount() {
            this.update();
            eventEmitter && eventEmitter.on('rerun', () => {
              this.update();
            });
          }

          update() {
            this.setState({
              isLoading: true
            });
            taskFunction(this.props)
              .then((result) => {
                this.setState({
                  result,
                  isLoading: false
                });
              })
              .catch((e) => {
                console.error(e);
                this.setState({
                  isLoading: false,
                  error: e
                });
              });
          }

          render() {
            const {isLoading, error, result} = this.state;
            if (isLoading) {
              return null;
            }
            if (error) {
              return null;
            }
            return <Wrapped {...this.props} {...{[propName]: result}} />;
          }
        }

        return Runner;
      };
    }

    class TopLevelRoutes extends React.Component {
      render() {
        const {initialEventsString, integrations, specService} = this.props;
        global.specService = specService;
        global.opticDump = dumpSpecServiceState(specService);
        return (
          <IntegrationsContextStore integrations={integrations}>
            <SpecServiceStore specService={specService} specServiceEvents={specServiceEvents}>
              <InitialRfcCommandsStore initialEventsString={initialEventsString} rfcId="testRfcId">
                <RfcStoreImpl specService={specService}>
                  <ApiOverviewContextStore specService={specService}>
                    <SessionNavigation
                      notifications={notificationAreaComponent}
                      entryBasePath={entryBasePath}
                      shareButtonComponent={shareButtonComponent}>
                      <Switch>
                        <Route exact path={routerPaths.init(basePath)}
                               component={() => <Init/>}/>
                        <Route path={routerPaths.request(basePath)}
                               component={withSpecServiceContext(RequestsDetailsPage)}/>
                        <Route path={routerPaths.pathMethod(basePath)}
                               component={withSpecServiceContext(RequestsDetailsPageNew)}/>
                        <Route path={routerPaths.apiDashboard(basePath)}
                               component={withSpecServiceContext(APIDashboard)}/>
                        <Route exact path={routerPaths.integrationsDashboard(basePath)}
                               component={() => <IntegrationsDashboard className={'root'}/>}/>
                        <Route exact path={routerPaths.apiDocumentation(basePath)}
                               component={withSpecServiceContext(ApiOverview)}/>
                        <Route path={routerPaths.diff(basePath)} component={withSpecServiceContext(SessionWrapper)}/>
                        <Redirect to={routerPaths.apiDashboard(basePath)}/>
                      </Switch>
                    </SessionNavigation>
                  </ApiOverviewContextStore>
                </RfcStoreImpl>
              </InitialRfcCommandsStore>
            </SpecServiceStore>
          </IntegrationsContextStore>
        );
      }
    }

    const task = async (props) => {
      const {specService} = props;
      const results = await specService.listEvents();
      return results;
    };

    const initialEventsStringEmitter = new EventEmitter();
    specServiceEvents.on('events-updated', () => {
      initialEventsStringEmitter.emit('rerun');
    });

    const withWrapper = compose(
      withTask(specServiceTask, 'specService'),
      withTask(task, 'initialEventsString', initialEventsStringEmitter),
    );

    const wrappedTopLevelRoutes = withWrapper(TopLevelRoutes);

    class Routes extends React.Component {
      render() {
        const {match} = this.props;
        return (
          <NavigationStore baseUrl={match.url}>
            <Switch>
              <Route path={basePath} component={wrappedTopLevelRoutes}/>
            </Switch>
          </NavigationStore>
        );
      }
    }

    return {
      Routes
    };
  }
}

export {
  LoaderFactory
};
