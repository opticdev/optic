import React from 'react';
import Typography from '@material-ui/core/Typography';
import {toInteraction, RequestDiffer, DiffToCommands, JsonHelper} from '../../engine/index.js';
import {SessionContext} from '../../contexts/SessionContext';
import {withStyles} from '@material-ui/core/styles';
import UnrecognizedPathWizard from './UnrecognizedPathWizard';
import {withRfcContext} from '../../contexts/RfcContext';
import DiffPage from './DiffPage';
import {primary} from '../../theme';
import Card from '@material-ui/core/Card';
import {CardActions, CardContent, CardHeader} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import {commandsFromJson, NaiveSummary} from '../../engine/index';
import DiffPageWrapper from './DiffPageWrapper';

const styles = (theme => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  pathDisplay: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#F8F8F8'
  },
  methodDisplay: {
    padding: 6,
    paddingTop: 10,
    paddingLeft: 15,
    fontWeight: 500,
    fontSize: 15,
    fontFamily: 'Ubuntu',
    color: primary
  }
}));

export function isStartable(diffState, item) {
  const {index} = item;
  const results = diffState.interactionResults[index] || {};
  return results.status !== 'skipped' && results.status !== 'completed';
}

export function isManuallyIntervened(diffState, item) {
  const {index} = item;
  const results = diffState.interactionResults[index] || {};
  return results.status === 'manual';
}

class LocalDiffManager extends React.Component {
  render() {

    const {classes} = this.props;

    return (
      <SessionContext.Consumer>
        {(sessionContext) => {
          const {diffSessionManager, diffStateProjections, applyCommands} = sessionContext;
          const {diffState} = diffSessionManager;
          const {status} = diffState;

          if (status === 'persisted') {
            //@TODO this should render a page that allows you to restart or go to the saved spec
            return window.location.href = '/saved';
          }

          const {eventStore, rfcId, rfcService, cachedQueryResults} = this.props;

          const item = (function (diffStateProjections) {

            const {samplesGroupedByPath} = diffStateProjections;
            for (const entry of Object.entries(samplesGroupedByPath)) {
              const [pathId, items] = entry;
              const firstStartableValue = items.find(x => isStartable(diffState, x));
              if (firstStartableValue) {
                return firstStartableValue;
              }
            }
            const {samplesWithoutResolvedPaths} = diffStateProjections;
            for (let value of samplesWithoutResolvedPaths) {
              if (isStartable(diffState, value)) {
                return value;
              }
            }

            return {};
          })(diffStateProjections);
          const {pathId, sample} = item;

          if (!sample) {
            const c = diffSessionManager.diffState.acceptedInterpretations.flatMap(i => i);
            const summary = NaiveSummary.fromCommands(commandsFromJson(c));

            return (
              <DiffPage progress={100}>
                <Card>
                  <CardHeader title={
                    <Typography variant="h5" color="primary">
                      Your API Spec is now updated.
                    </Typography>
                  }/>
                  <CardContent style={{marginTop: -14, paddingTop: 0}}>
                    <ul style={{fontFamily: 'Ubuntu', fontSize: 13, fontWeight: 11}}>
                      {summary['New Concepts'] && <li>+{summary['New Concepts']} Concept(s) Added</li>}
                      {summary['New Operations'] && <li>+{summary['New Operations']} Operation(s) Added</li>}
                      {summary['New Paths'] && <li>+{summary['New Paths']} Path(s) Added</li>}
                      {summary['New Responses'] && <li>+{summary['New Responses']} Response(s) Added</li>}
                    </ul>
                  </CardContent>
                  <CardActions>
                    <div style={{textAlign: 'right', width: '100%'}}>
                      <Button size="large" color="default">
                        Cancel
                      </Button>
                      <Button size="large" color="primary"
                              onClick={() => diffSessionManager.applyDiffToSpec(eventStore, rfcId)}>
                        Merge
                      </Button>
                    </div>
                  </CardActions>
                </Card>
              </DiffPage>
            );
          }

          if (pathId) {
            const isInManualMode = isManuallyIntervened(diffState, item);
            if (isInManualMode) {
              // don't recompute diff anymore, just treat it as readyToFinish
              return (
                <DiffPageWrapper
                  rfcService={rfcService}
                  classes={classes}
                  cachedQueryResults={cachedQueryResults}
                  rfcId={rfcId}
                  eventStore={eventStore}
                  applyCommands={applyCommands}
                  commands={[]}
                  diffSessionManager={diffSessionManager}
                  diffStateProjections={diffStateProjections}
                  diffState={diffState}
                  item={item}
                  readyToFinish={true}
                  interpretation={false}
                  onAccept={null}
                />
              );
            }
            const interaction = toInteraction(sample);
            const rfcState = rfcService.currentState(rfcId);
            const diff = RequestDiffer.compare(interaction, rfcState);
            const interpretation = new DiffToCommands(rfcState.shapesState).interpret(diff);
            const commands = JsonHelper.seqToJsArray(interpretation.commands);
            const hasDiff = commands.length > 0;

            console.log({diff, interpretation});

            const readyToFinish = !hasDiff;

            return (
              <DiffPageWrapper
                rfcService={rfcService}
                classes={classes}
                cachedQueryResults={cachedQueryResults}
                rfcId={rfcId}
                eventStore={eventStore}
                applyCommands={applyCommands}
                commands={commands}
                diffSessionManager={diffSessionManager}
                diffStateProjections={diffStateProjections}
                diffState={diffState}
                item={item}
                readyToFinish={readyToFinish}
                interpretation={hasDiff && interpretation}
                onAccept={(appendCommands = []) => {
                  const concat = [...commands, ...appendCommands];
                  applyCommands(...concat);
                }}
              />
            );
          } else {
            return (
              <DiffPage>
                <UnrecognizedPathWizard
                  onSubmit={({commands}) => {
                    applyCommands(...commands);
                  }}
                  url={sample.request.url}
                />
              </DiffPage>
            );
          }
        }}
      </SessionContext.Consumer>
    );
  }
}

export default withStyles(styles)(withRfcContext(LocalDiffManager));
