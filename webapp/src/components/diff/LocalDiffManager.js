import React from 'react';
import {Operation} from '../PathPage';
import Typography from '@material-ui/core/Typography';
import {toInteraction, RequestDiffer, DiffToCommands, JsonHelper} from '../../engine/index.js';
import {getNameWithFormattedParameters, asPathTrail} from '../utilities/PathUtilities.js';
import {SessionContext} from '../../contexts/SessionContext';
import {withStyles} from '@material-ui/core/styles';
import {PathTrail} from '../PathPage';
import UnrecognizedPathWizard from './UnrecognizedPathWizard';
import {withRfcContext} from '../../contexts/RfcContext';
import {EditorStore, EditorModes} from '../../contexts/EditorContext';
import DiffPage from './DiffPage';
import Paper from '@material-ui/core/Paper';
import {primary} from '../../theme';
import Card from '@material-ui/core/Card';
import {CardActions, CardContent, CardHeader} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import groupBy from 'lodash.groupby'
import {SemanticApplyEffect} from '../../engine/index';

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

class LocalDiffManager extends React.Component {
  render() {

    const {classes} = this.props;

    return (
      <SessionContext.Consumer>
        {(sessionContext) => {
          const {diffSessionManager, diffStateProjections, logSemanticDiff, semanticDiff} = sessionContext;
          const {diffState} = diffSessionManager;
          const {status} = diffState;
          if (status === 'persisted') {
            return window.location.href = '/saved'
          }
          const {handleCommands, eventStore, rfcId, rfcService, queries, cachedQueryResults} = this.props;
          const {requests, requestIdsByPathId, pathsById} = cachedQueryResults;
          //@TODO: measure progress from sessionContext.diffSessionManager and .sessions
          const {pathId, sample, index: currentInteractionIndex} = (function (diffStateProjections) {
            function isStartable(item) {
              const {index} = item;
              const results = diffState.interactionResults[index] || {};
              return results.status !== 'skipped' && results.status !== 'completed';
            }

            const {samplesGroupedByPath} = diffStateProjections;
            for (const entry of Object.entries(samplesGroupedByPath)) {
              const [pathId, items] = entry;
              const firstStartableValue = items.find(x => isStartable(x));
              if (firstStartableValue) {
                return firstStartableValue;
              }
            }
            const {samplesWithoutResolvedPaths} = diffStateProjections;
            for (let value of samplesWithoutResolvedPaths) {
              if (isStartable(value)) {
                return value;
              }
            }

            return {};
          })(diffStateProjections);

          const progress = (diffState.acceptedInterpretations.length / diffSessionManager.session.samples.length) * 100;

          if (!sample) {
            const changes = groupBy(semanticDiff, i => i)
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
                      {changes.PathAdded && <li>+{changes.PathAdded.length} Path(s) Added</li>}
                      {changes.ConceptAdded && <li>+{changes.ConceptAdded.length} Concept(s) Added</li>}
                      {changes.OperationAdded && <li>+{changes.OperationAdded.length} Operation(s) Added</li>}
                      {changes.OperationUpdated && <li>+{changes.OperationUpdated.length} Operation(s) Updated</li>}
                      {changes.ResponseAdded && <li>+{changes.ResponseAdded.length} Response(s) Added</li>}
                      {changes.ResponseUpdated && <li>+{changes.ResponseUpdated.length} Response(s) Updated</li>}
                    </ul>
                    {/*{semanticDiff.toString()}*/}
                  </CardContent>
                  <CardActions>
                    <div style={{textAlign: 'right', width: '100%'}}>
                      <Button size="large" color="default">
                        Cancel
                      </Button>
                      <Button size="large" color="primary" onClick={() => diffSessionManager.applyDiffToSpec(eventStore, rfcId)}>
                        Merge
                      </Button>
                    </div>
                  </CardActions>
                </Card>
              </DiffPage>
            );
          }

          if (pathId) {
            const interaction = toInteraction(sample);
            const rfcState = rfcService.currentState(rfcId);
            const diff = RequestDiffer.compare(interaction, rfcState);
            const interpretation = new DiffToCommands(rfcState.shapesState).interpret(diff);
            const commands = JsonHelper.seqToJsArray(interpretation.commands);
            const hasDiff = commands.length > 0;

            const requestsForPathId = requestIdsByPathId[pathId] || [];
            const request = requestsForPathId
              .map(requestId => requests[requestId])
              .find(request => {
                return request.requestDescriptor.httpMethod === sample.request.method;
              }) || null;
            const pathTrail = asPathTrail(pathId, pathsById);
            const pathTrailComponents = pathTrail.map(pathId => pathsById[pathId]);
            const pathTrailWithNames = pathTrailComponents.map((pathComponent) => {
              const pathComponentName = getNameWithFormattedParameters(pathComponent);
              const pathComponentId = pathComponent.pathId;
              return {
                pathComponentName,
                pathComponentId
              };
            });

            const readyToFinish = !hasDiff;

            return (
              <DiffPage collapseLeftMargin={true}
                        progress={progress}
                        path={pathId}
                        interpretation={hasDiff && interpretation}
                        readyToFinish={readyToFinish}
                        finish={() => diffSessionManager.finishInteraction(currentInteractionIndex)}
                        accept={(appendCommands = []) => {
                          const concat = [...commands, ...appendCommands];
                          handleCommands(...concat);
                          logSemanticDiff(interpretation.semanticEffect)
                        }}
              >
                <EditorStore mode={readyToFinish ? EditorModes.DESIGN : EditorModes.DOCUMENTATION}>
                  <Paper style={{flex: 1, width: 850, maxWidth: 1000, overflow: 'hidden'}}>
                    <Typography variant="subtitle2" component="div" color="primary" style={{
                      fontSize: 17,
                      padding: 11
                    }}>Path ({diffSessionManager.session.samples.length} samples)</Typography>
                    <div className={classes.pathDisplay}>
                      <div className={classes.methodDisplay}>{sample.request.method}</div>
                      <PathTrail pathTrail={pathTrailWithNames} style={{flex: 1}}/>
                    </div>
                  </Paper>
                  {request && <Operation request={request}/>}
                </EditorStore>
              </DiffPage>
            );
          } else {
            return (
              <DiffPage>
                <UnrecognizedPathWizard
                  onSubmit={({commands}) => {
                    handleCommands(...commands);
                    logSemanticDiff(SemanticApplyEffect.seqForPathAdded)
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
