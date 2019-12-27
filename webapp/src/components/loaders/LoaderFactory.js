import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {InitialRfcCommandsStore} from '../../contexts/InitialRfcCommandsContext';
import {RfcStore} from '../../contexts/RfcContext';
import {basePaths, routerPaths} from '../../RouterPaths';
import {NavigationStore} from '../../contexts/NavigationContext';
import {RequestsDetailsPage} from '../requests/EndpointPage';
import {UrlsX} from '../paths/NewUnmatchedUrlWizard';
import RequestDiffX from '../diff/RequestDiffX';
import {TrafficSessionStore} from '../../contexts/TrafficSessionContext';
import {GenericContextFactory} from '../../contexts/GenericContextFactory';
import compose from 'lodash.compose';
import Navigation from '../navigation/Navbar';
import {ApiOverviewContextStore} from '../../contexts/ApiOverviewContext';
import ApiOverview from '../navigation/ApiOverview';
import APIDashboard, {IntegrationsDashboard} from '../dashboards/APIDashboard';
import {IntegrationsContextStore} from '../../contexts/IntegrationsContext';
import {IntegrationsSpecService} from '../routes/local/integrations';
import NewBehavior from '../navigation/NewBehavior';

const {
  Context: SpecServiceContext,
  withContext: withSpecServiceContext
} = GenericContextFactory(null);

class LoaderFactory {
  static build(options) {
    const {notificationAreaComponent, shareButtonComponent, basePath, specServiceTask} = options;

    const entryBasePath = basePath


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
            <Route exact path={routerPaths.diffRequest(match.path)} component={RequestDiffX}/>
          </Switch>
        </TrafficSessionStore>
      );
    }

    function withTask(taskFunction, propName) {
      return function (Wrapped) {
        class Runner extends React.Component {
          state = {
            isLoading: true,
            error: null,
            result: null
          };

          componentDidMount() {
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

        return (
          <SpecServiceContext.Provider value={{specService}}>
            <IntegrationsContextStore integrations={integrations}>
              <InitialRfcCommandsStore initialEventsString={initialEventsString} rfcId="testRfcId">
                <RfcStore specService={specService}>
                  <ApiOverviewContextStore specService={specService}>
                    <Navigation notifications={notificationAreaComponent}
                                entryBasePath={entryBasePath}
                                shareButtonComponent={shareButtonComponent}>
                      <Switch>
                        <Route path={routerPaths.request(basePath)}
                               component={withSpecServiceContext(RequestsDetailsPage)}/>
                        <Route path={routerPaths.apiDashboard(basePath)}
                               component={withSpecServiceContext(APIDashboard)}/>
                        <Route exact path={routerPaths.integrationsDashboard(basePath)}
                               component={() => <IntegrationsDashboard className={'root'}/>}/>
                        <Route exact path={basePath} component={withSpecServiceContext(ApiOverview)}/>
                        <Route path={routerPaths.diff(basePath)} component={withSpecServiceContext(SessionWrapper)}/>
                      </Switch>
                    </Navigation>
                  </ApiOverviewContextStore>
                </RfcStore>
              </InitialRfcCommandsStore>
            </IntegrationsContextStore>
          </SpecServiceContext.Provider>
        );
      }
    }

    class IntegrationsRoutes extends React.Component {
      render() {
        const {integrations, match, specService, initialEventsString} = this.props;
        global.specService = specService;

        const basePath = match.path;

        return (
          <SpecServiceContext.Provider value={{specService}}>
            <IntegrationsContextStore integrations={integrations}>
              <InitialRfcCommandsStore initialEventsString={initialEventsString} rfcId="testRfcId">
              <NavigationStore baseUrl={match.url}>
                <RfcStore specService={specService}>
                  <ApiOverviewContextStore specService={specService}>
                    <Navigation notifications={notificationAreaComponent}
                                integrationMode={true}
                                entryBasePath={entryBasePath}
                                shareButtonComponent={shareButtonComponent}>

                      <Route path={routerPaths.request(basePath)}
                             component={withSpecServiceContext(RequestsDetailsPage)}/>
                      <Route exact path={basePath} component={withSpecServiceContext(ApiOverview)}/>
                      <Route path={routerPaths.diff(basePath)} component={withSpecServiceContext(SessionWrapper)}/>
                    </Navigation>
                  </ApiOverviewContextStore>
                </RfcStore>
              </NavigationStore>
              </InitialRfcCommandsStore>
            </IntegrationsContextStore>
          </SpecServiceContext.Provider>
        );
      }
    }

    const task = async (props) => {
      const {specService} = props;
      const results = await specService.listEvents();
      return results;
    };

    const integrationsTask = async (props) => {
      const {specService} = props;
      if (specService.supportsIntegrations()) {
        return await specService.listIntegrations();
      } else {
        return [];
      }
    };

    const withWrapper = compose(
      withTask(specServiceTask, 'specService'),
      withTask(task, 'initialEventsString'),
      withTask(integrationsTask, 'integrations'),
    );

    const wrappedTopLevelRoutes = withWrapper(TopLevelRoutes);

    const withIntegrationsWrapper = compose(
      withTask(({match}) => Promise.resolve(new IntegrationsSpecService(match.params.integrationName)), 'specService'),
      withTask(task, 'initialEventsString'),
      withTask(integrationsTask, 'integrations'),
    );

    const wrappedIntegrationRoutes = withIntegrationsWrapper(IntegrationsRoutes);

    class Routes extends React.Component {
      render() {
        const {match} = this.props;
        return (
          <NavigationStore baseUrl={match.url}>
            <Switch>
              <Route path={routerPaths.integrationsPath(basePath)} component={wrappedIntegrationRoutes}/>
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
  LoaderFactory,
  withSpecServiceContext,
  SpecServiceContext,
};
