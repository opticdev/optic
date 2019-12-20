import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { InitialRfcCommandsStore } from '../../contexts/InitialRfcCommandsContext';
import { RfcStore } from '../../contexts/RfcContext';
import { routerPaths } from '../../RouterPaths';
import { NavigationStore } from '../../contexts/NavigationContext';
import { RequestsDetailsPage } from '../requests/EndpointPage';
import { SpecOverview } from '../routes/local';
import { UrlsX } from '../paths/NewUnmatchedUrlWizard';
import RequestDiffX from '../diff/RequestDiffX';
import { TrafficSessionStore } from '../../contexts/TrafficSessionContext';
import { GenericContextFactory } from '../../contexts/GenericContextFactory';
import compose from 'lodash.compose';

const {
  Context: SpecServiceContext,
  withContext: withSpecServiceContext
} = GenericContextFactory(null)

class LoaderFactory {
  static build(options) {
    const {
      notificationAreaComponent,
      shareButtonComponent,
      addExampleComponent,
      basePath,
      specServiceTask,
      RfcStoreImpl = RfcStore
    } = options;

    const diffBasePath = routerPaths.diff(basePath);


    function SessionWrapper(props) {
      const { match, specService } = props;
      const { sessionId } = match.params;
      return (
        <TrafficSessionStore
          sessionId={sessionId}
          specService={specService}
        >
          <Switch>
            <Route exact path={routerPaths.diffUrls(diffBasePath)} component={UrlsX} />
            <Route exact path={routerPaths.diffRequest(diffBasePath)} component={RequestDiffX} />
          </Switch>
        </TrafficSessionStore>
      );
    }

    function SpecOverviewWrapper({ specService }) {
      return (
        <SpecOverview
          specService={specService}
          shareButtonComponent={shareButtonComponent}
          notificationAreaComponent={notificationAreaComponent}
          addExampleComponent={addExampleComponent}
        />
      )
    }

    function withTask(taskFunction, propName) {
      return function (Wrapped) {
        class Runner extends React.Component {
          state = {
            isLoading: true,
            error: null,
            result: null
          }
          componentDidMount() {
            this.setState({
              isLoading: true
            })
            taskFunction(this.props)
              .then((result) => {
                this.setState({
                  result,
                  isLoading: false
                })
              })
              .catch((e) => {
                console.error(e)
                this.setState({
                  isLoading: false,
                  error: e
                })
              })
          }
          render() {
            const { isLoading, error, result } = this.state;
            if (isLoading) {
              return null
            }
            if (error) {
              return null
            }
            return <Wrapped {...this.props} {...{ [propName]: result }} />
          }
        }
        return Runner
      }
    }

    class TopLevelRoutes extends React.Component {
      render() {
        const { initialEventsString, specService } = this.props;
        global.specService = specService

        return (
          <SpecServiceContext.Provider value={{ specService }}>
            <InitialRfcCommandsStore initialEventsString={initialEventsString} rfcId="testRfcId">
              <RfcStoreImpl specService={specService}>
                <Switch>
                  <Route path={routerPaths.request(basePath)} component={withSpecServiceContext(RequestsDetailsPage)} />
                  <Route exact path={basePath} component={withSpecServiceContext(SpecOverviewWrapper)} />
                  <Route path={diffBasePath} component={withSpecServiceContext(SessionWrapper)} />
                </Switch>
              </RfcStoreImpl>
            </InitialRfcCommandsStore>
          </SpecServiceContext.Provider>
        );
      }
    }

    const task = async (props) => {
      const { specService } = props
      const results = await specService.listEvents()
      return results
    }

    const withWrapper = compose(
      withTask(specServiceTask, 'specService'),
      withTask(task, 'initialEventsString'),
    )

    const wrappedTopLevelRoutes = withWrapper(TopLevelRoutes)

    class Routes extends React.Component {
      render() {
        const { match } = this.props;
        return (
          <NavigationStore baseUrl={match.url}>
            <Switch>
              <Route path={basePath} component={wrappedTopLevelRoutes} />
            </Switch>
          </NavigationStore>
        );
      }
    }
    return {
      Routes
    }
  }
}

export {
  LoaderFactory,
  withSpecServiceContext,
  SpecServiceContext,
}
