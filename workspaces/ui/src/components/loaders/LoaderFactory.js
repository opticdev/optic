import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {InitialRfcCommandsStore} from '../../contexts/InitialRfcCommandsContext';
import {RfcStore} from '../../contexts/RfcContext';
import {routerPaths} from '../../RouterPaths';
import {NavigationStore} from '../../contexts/NavigationContext';
import {RequestsDetailsPage, RequestsDetailsPageNew} from '../requests/EndpointPage';
import {UrlsX} from '../paths/NewUnmatchedUrlWizard';
import RequestDiffX from '../diff/RequestDiffX';
import {TrafficSessionStore} from '../../contexts/TrafficSessionContext';
import compose from 'lodash.compose';
import Navigation from '../navigation/Navbar';
import {ApiOverviewContextStore} from '../../contexts/ApiOverviewContext';
import ApiOverview from '../navigation/ApiOverview';
import APIDashboard, {IntegrationsDashboard} from '../dashboards/APIDashboard';
import {IntegrationsContextStore} from '../../contexts/IntegrationsContext';
import {Redirect} from 'react-router-dom';
import {ProductDemoStore} from '../navigation/ProductDemo';
import Init from '../onboarding/Init';
import {SpecServiceStore, withSpecServiceContext} from '../../contexts/SpecServiceContext';
import DiffPageNew from '../diff/v2/DiffPageNew';

class LoaderFactory {
  static build(options) {
    const {notificationAreaComponent, shareButtonComponent, demo, basePath, specServiceTask, RfcStoreImpl = RfcStore} = options;

    const entryBasePath = basePath;

    function SessionWrapper(props) {
      const {match, specService} = props;
      const {sessionId} = match.params;
      return (
        <TrafficSessionStore
          sessionId={sessionId}
          specService={specService}
        >
          <SpecServiceStore specService={specService}>
            <Switch>
              <Route exact path={routerPaths.diffUrls(match.path)} component={UrlsX}/>
              <Route exact path={routerPaths.diffRequest(match.path)} component={RequestDiffX}/>
              <Route exact path={routerPaths.diffRequestNew(match.path)} component={DiffPageNew}/>
              <Route component={withSpecServiceContext(ApiOverview)}/>
            </Switch>
          </SpecServiceStore>
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
          <IntegrationsContextStore integrations={integrations}>
            <SpecServiceStore specService={specService}>
              <InitialRfcCommandsStore initialEventsString={initialEventsString} rfcId="testRfcId">
                <RfcStoreImpl specService={specService}>
                  <ApiOverviewContextStore specService={specService}>
                    <Navigation notifications={notificationAreaComponent}
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
                    </Navigation>
                  </ApiOverviewContextStore>
                </RfcStoreImpl>
              </InitialRfcCommandsStore>
            </SpecServiceStore>
          </IntegrationsContextStore>
        );
      }
    }

    // class IntegrationsRoutes extends React.Component {
    //   render() {
    //     const {integrations, match, specService, initialEventsString} = this.props;
    //     global.specService = specService;
    //
    //     const basePath = match.path;
    //
    //     return (
    //       <IntegrationsContextStore integrations={integrations} isIntegrationMode={true}>
    //         <SpecServiceContext.Provider value={{specService}}>
    //           <InitialRfcCommandsStore initialEventsString={initialEventsString} rfcId="testRfcId">
    //             <NavigationStore baseUrl={match.url}>
    //               <RfcStore specService={specService}>
    //                 <ApiOverviewContextStore specService={specService}>
    //                   <Navigation notifications={notificationAreaComponent}
    //                               integrationMode={true}
    //                               entryBasePath={entryBasePath}
    //                               shareButtonComponent={shareButtonComponent}>
    //
    //                     <Route path={routerPaths.request(basePath)}
    //                            component={withSpecServiceContext(RequestsDetailsPage)}/>
    //                     <Route exact path={basePath} component={withSpecServiceContext(ApiOverview)}/>
    //                     <Route path={routerPaths.diff(basePath)} component={withSpecServiceContext(SessionWrapper)}/>
    //                   </Navigation>
    //                 </ApiOverviewContextStore>
    //               </RfcStore>
    //             </NavigationStore>
    //           </InitialRfcCommandsStore>
    //         </SpecServiceContext.Provider>
    //       </IntegrationsContextStore>
    //     );
    //   }
    // }

    const task = async (props) => {
      const {specService} = props;
      const results = await specService.listEvents();
      return results;
    };

    const withWrapper = compose(
      withTask(specServiceTask, 'specService'),
      withTask(task, 'initialEventsString'),
    );

    const wrappedTopLevelRoutes = withWrapper(TopLevelRoutes);

    // const withIntegrationsWrapper = compose(
    //   withTask(({match}) => Promise.resolve(new IntegrationsSpecService(match.params.integrationName)), 'specService'),
    //   withTask(task, 'initialEventsString'),
    //   withTask(integrationsTask, 'integrations'),
    // );
    //
    // const wrappedIntegrationRoutes = withIntegrationsWrapper(IntegrationsRoutes);

    class Routes extends React.Component {
      render() {
        const {match} = this.props;
        return (
          <NavigationStore baseUrl={match.url}>
            <ProductDemoStore active={demo}>
              <Switch>
                {/*<Route path={routerPaths.integrationsPath(basePath)} component={wrappedIntegrationRoutes}/>*/}
                <Route path={basePath} component={wrappedTopLevelRoutes}/>
              </Switch>
            </ProductDemoStore>
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
