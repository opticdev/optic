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

class LoaderFactory {
  static build(options) {
    const { notificationAreaComponent, specService, basePath } = options;

    const diffBasePath = routerPaths.diff(basePath);

    function SessionWrapper(props) {
      const { match } = props;
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

    function SpecOverviewWrapper() {
      return (
        <SpecOverview
          specService={specService}
          notificationAreaComponent={notificationAreaComponent} />
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
            taskFunction()
              .then((result) => {
                this.setState({
                  result,
                  isLoading: false
                })
              })
              .catch((e) => {
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
            return <Wrapped {...{[propName]: result}} />
          }
        }
        return Runner
      }
    }

    class TopLevelRoutes extends React.Component {
      render() {
        const {initialEventsString} = this.props;
        debugger
        return (
          <InitialRfcCommandsStore initialEventsString={initialEventsString} rfcId="testRfcId">
            <RfcStore specService={specService}>
              <Switch>
                <Route path={routerPaths.request(basePath)} component={RequestsDetailsPage} />
                <Route exact path={basePath} component={SpecOverviewWrapper} />
                <Route path={diffBasePath} component={SessionWrapper} />
              </Switch>
            </RfcStore>
          </InitialRfcCommandsStore>
        );
      }
    }

    const task = async () => {
      const results = await specService.listEvents()
      return results
    }

    class Routes extends React.Component {
      render() {
        const { match } = this.props;
        return (
          <NavigationStore baseUrl={match.url}>
            <Switch>
              <Route path={basePath} component={withTask(task, 'initialEventsString')(TopLevelRoutes)} />
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
  LoaderFactory
}