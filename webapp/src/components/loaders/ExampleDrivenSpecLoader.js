import React from 'react';
import { InitialRfcCommandsStore } from '../../contexts/InitialRfcCommandsContext';
import { TrafficAndDiffSessionStore } from '../../contexts/TrafficAndDiffSessionContext';
import { LocalDiffRfcStore, withRfcContext } from '../../contexts/RfcContext';
import { Route, Switch } from 'react-router-dom';
import { UrlsX } from '../paths/NewUnmatchedUrlWizard';
import RequestDiffX from '../diff/RequestDiffX';
import { NavigationStore } from '../../contexts/NavigationContext';
import { routerPaths } from '../../routes';
import { SpecOverview } from '../routes/local';
import NewBehavior from '../navigation/NewBehavior';
import { RequestsDetailsPage } from '../requests/EndpointPage';
import { TextField, Button, Paper, Select, Grid, Typography } from '@material-ui/core';
import useForm from 'react-hook-form';
import { STATUS_CODES } from 'http';
import { InteractionDiffer, toInteraction } from '../../engine';

export const basePath = `/spec-by-example`;
function parseLoosely(nonEmptyBodyString) {
  if (!nonEmptyBodyString) {
    return [true];
  }
  try {
    return [true, JSON.parse(nonEmptyBodyString)]
  } catch (e) {
    try {
      const result = eval(`(${nonEmptyBodyString})`)
      console.log({ result })
      if (result) {
        return [true, result]
      }
      return [false]
    } catch (e) {
      return [false]
    }
  }
}
function ExampleBuilderBase(props) {
  const { register, handleSubmit, getValues, watch } = useForm({
    defaultValues: {
      request: {
        method: 'GET',
        url: '/'
      },
      response: {
        statusCode: 200
      }
    }
  });
  // need watch() to update getValues() on change
  const watchAll = watch()
  const formValues = getValues({ nest: true })

  const parseFormState = state => {
    console.log({ state });
    const [parsedRequestBodySuccess, parsedRequestBody] = parseLoosely(state.request.body);
    const request = {
      method: state.request.method,
      url: state.request.url || '/',
      headers: {}
    }
    if (parsedRequestBodySuccess) {
      request.headers['content-type'] = 'application/json'
      request.body = parsedRequestBody
    }


    const [parsedResponseBodySuccess, parsedResponseBody] = parseLoosely(state.response.body);
    const response = {
      statusCode: parseInt(state.response.statusCode, 10),
      headers: {},
    }
    if (parsedResponseBodySuccess) {
      response.headers['content-type'] = 'application/json'
      response.body = parsedResponseBody
    }


    const sample = {
      request,
      response
    }


    const { rfcService, rfcId } = props;
    const rfcState = rfcService.currentState(rfcId)
    const interactionDiffer = new InteractionDiffer(rfcState);
    const interaction = toInteraction(sample)
    const hasUnrecognizedPath = interactionDiffer.hasUnrecognizedPath(interaction)
    const hasDiff = interactionDiffer.hasDiff(interaction);
    const result = {
      state,
      sample,
      hasUnrecognizedPath,
      hasDiff,
      parsedRequestBodySuccess,
      parsedResponseBodySuccess,
    }
    console.log(result)
    return result
  }
  const onSubmit = data => {
    const { onSampleAdded } = props;
    const { sample } = parseFormState(data)

    onSampleAdded(sample)
  };
  const { specService } = props;
  const {
    hasDiff, hasUnrecognizedPath, parsedRequestBodySuccess, parsedResponseBodySuccess
  } = parseFormState(formValues);

  return (
    <div>
      <Paper>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container>
            <Grid item xs={6}>
              <Typography variant="h4">Request</Typography>
              <div>
                <Select native label="Method" name="request.method" inputRef={register}>
                  <option value="GET" selected>GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </Select>
              </div>
              <div>
                <TextField label="URL" name="request.url" inputRef={register} autoFocus />
                {hasUnrecognizedPath ? <div>this is a new URL</div> : null}
              </div>
              <div>
                <TextField label="Body" multiline name="request.body" inputRef={register} />
              </div>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h4">Response</Typography>
              <div>
                <Select native label="Status Code" name="response.statusCode" inputRef={register}>
                  {Object.entries(STATUS_CODES).map(entry => {
                    const [code, message] = entry;
                    return (
                      <option value={code}>{code}: {message}</option>
                    )
                  })}
                </Select>
              </div>
              <div>
                <TextField label="Body" multiline name="response.body" inputRef={register} />
              </div>
            </Grid>
          </Grid>
          <div>
            <Button type="submit" disabled={!parsedRequestBodySuccess || !parsedResponseBodySuccess}>Add Example</Button>
            {hasDiff ? <div>this request does not match the spec</div> : null}
          </div>
        </form>
      </Paper>
      <NewBehavior specService={specService} />
    </div>
  )
}
const ExampleBuilder = withRfcContext(ExampleBuilderBase)

class ExampleDrivenSpecLoader extends React.Component {

  state = {
    events: '[]',
    examples: [],
    session: {
      samples: []
    }
  };

  handleSampleAdded = (sample) => {
    console.log({ sample })
    const session = {
      ...this.state.session,
      samples: [...this.state.session.samples, sample]
    }
    this.setState({
      session
    })
  }

  render() {
    const sessionId = 'someSessionId';
    const specService = {
      loadSession: (sessionId) => {
        return Promise.resolve({
          diffStateResponse: {
            diffState: {

            }
          },
          sessionResponse: {
            session: this.state.session
          }
        })
      },
      listEvents() {
        return Promise.resolve([])
      },
      listSessions() {
        return Promise.resolve({ sessions: [sessionId] })
      },
      saveEvents: (eventStore, rfcId) => {
        const events = eventStore.serializeEvents(rfcId)
        this.setState({
          events
        })
      },
      listExamples: (requestId) => {
        return Promise.resolve({ examples: this.state.examples[requestId] || [] })
      },
      saveExample: (interaction, requestId) => {
        const examples = this.state.examples
        const requestExamples = examples[requestId] || []
        requestExamples.push(interaction)
        examples[requestId] = requestExamples
        this.setState({ examples })
      },
      saveDiffState: () => { }
    }

    const diffBasePath = routerPaths.diff(basePath)

    //@todo add before modal here eventually
    const ExampleSessionsSpecOverview = () => {
      return (
        <SpecOverview
          specService={specService}
          notificationAreaComponent={<ExampleBuilder specService={specService} onSampleAdded={this.handleSampleAdded} />} />
      )
    }

    function SessionWrapper(props) {
      const { match } = props;
      const { sessionId } = match.params;
      return (
        <TrafficAndDiffSessionStore sessionId={sessionId} specService={specService}>
          <Switch>
            <Route exact path={routerPaths.diffUrls(diffBasePath)} component={UrlsX} />
            <Route exact path={routerPaths.diffRequest(diffBasePath)} component={RequestDiffX} />
          </Switch>
        </TrafficAndDiffSessionStore>
      )
    }

    return (
      <InitialRfcCommandsStore initialEventsString={this.state.events} rfcId="testRfcId">
        <LocalDiffRfcStore specService={specService}>
          <Switch>
            <Route path={routerPaths.request(basePath)} component={RequestsDetailsPage} />
            <Route exact path={basePath} component={ExampleSessionsSpecOverview} />
            <Route path={diffBasePath} component={SessionWrapper} />
          </Switch>
        </LocalDiffRfcStore>
      </InitialRfcCommandsStore>
    )
  }
}

class ExampleDrivenSpecLoaderRoutes extends React.Component {
  render() {
    const { match } = this.props
    return (
      <NavigationStore baseUrl={match.url}>
        <Switch>
          <Route path={basePath} component={ExampleDrivenSpecLoader} />
        </Switch>
      </NavigationStore>
    )
  }
}

export default ExampleDrivenSpecLoaderRoutes
