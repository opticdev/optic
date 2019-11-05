import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { InitialRfcCommandsStore } from '../../contexts/InitialRfcCommandsContext';
import { RfcStore } from '../../contexts/RfcContext';
import { TutorialStore } from '../../contexts/TutorialContext';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button
} from '@material-ui/core'
import Loading from '../../components/navigation/Loading';
import { RequestViewer, SpecOverview } from '../routes/local';
import { routerPaths } from '../../routes';
import { NavigationStore } from '../../contexts/NavigationContext';


class ExampleCommandsSpecOverview extends React.Component {
  render() {
    const dummySpecService = {
      listSessions: () => Promise.resolve({ sessions: [] })
    }
    return <SpecOverview specService={dummySpecService} />
  }
}

class ExampleCommandsLoader extends React.Component {

  state = {
    example: null,
    error: null
  };

  componentDidMount() {
    fetch(`/example-commands/${this.props.match.params.exampleId}-commands.json`, {
      headers: {
        'accept': 'application/json'
      }
    })
      .then(response => {
        if (response.ok) {
          return response.text()
            .then(rawString => {
              this.setState({
                example: rawString
              });
            });
        }
        throw new Error()
      })
      .catch(e => {
        this.setState({ error: true })
      });
  }

  render() {
    const { example, error } = this.state;
    const { match } = this.props;

    if (error) {
      return (
        <Dialog open={true}>
          <DialogTitle>Example not found</DialogTitle>
          <DialogContent>The example API you are trying to load could not be found.</DialogContent>
          <DialogActions>
            <Button onClick={() => window.location.reload()}>Reload</Button>
          </DialogActions>
        </Dialog>
      );
    }

    if (example === null) {
      return <Loading />;
    }
    debugger
    const baseUrl = match.url;
    return (
      <NavigationStore baseUrl={baseUrl}>
        <InitialRfcCommandsStore initialCommandsString={example} rfcId="testRfcId">
          <RfcStore>
            <TutorialStore>
              <Switch>
                <Route path={routerPaths.request(baseUrl)} component={RequestViewer} />
                <Route path={baseUrl} component={ExampleCommandsSpecOverview} />
              </Switch>
            </TutorialStore>
          </RfcStore>
        </InitialRfcCommandsStore>
      </NavigationStore>
    );
  }
}

export default ExampleCommandsLoader