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
    paddingTop: 12,
    paddingLeft: 15,
    fontWeight: 500,
    fontSize: 13
  }
}));

class LocalDiffManager extends React.Component {
  render() {

    const {classes} = this.props;

    return (
      <SessionContext.Consumer>
        {(sessionContext) => {
          const {diffSessionManager, diffStateProjections} = sessionContext;
          const {diffState} = diffSessionManager;
          const {status} = diffState;
          if (status === 'persisted') {
            return (
              <div>Saved! <a href="/saved">View updated Documentation</a></div>
            );
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
          if (!sample) {
            return (
              <div>
                done! <button onClick={() => diffSessionManager.applyDiffToSpec(eventStore, rfcId)}>apply
                changes?</button>
              </div>
            );
          }
          if (pathId) {
            const interaction = toInteraction(sample);
            const rfcState = rfcService.currentState(rfcId);
            const diff = RequestDiffer.compare(interaction, rfcState);
            console.log({diff});
            const interpretation = new DiffToCommands(rfcState.shapesState).interpret(diff);
            console.log({interpretation});
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



            return (
              <DiffPage collapseLeftMargin={true}
                        interpretation={hasDiff && interpretation}
                        finish={() => diffSessionManager.finishInteraction(currentInteractionIndex)}
                        accept={() => handleCommands(...commands)}
              >
                <EditorStore mode={EditorModes.DOCUMENTATION}>
                  <Paper style={{flex: 1, width: '100%'}}>
                      <Typography variant="subtitle2" color="primary" style={{
                        fontSize: 17,
                        padding: 12
                      }}>Path ({diffSessionManager.session.samples.length} samples)</Typography>
                    <div className={classes.pathDisplay}>
                      <div className={classes.methodDisplay}>{sample.request.method}</div> <PathTrail pathTrail={pathTrailWithNames} style={{flex: 1}}/>
                    </div>
                  </Paper>
                  {request && <Operation request={request}/>}
                  {/*{request && <Operation request={request}/>}*/}
                  {/*{hasDiff ? (*/}
                  {/*  <div>{interpretation.description}*/}
                  {/*    <button onClick={() => handleCommands(...commands)}>apply change</button>*/}
                  {/*  </div>*/}
                  {/*) : (*/}
                  {/*  <div>This request is in sync with the spec!*/}
                  {/*    <button*/}
                  {/*      onClick={() => diffSessionManager.finishInteraction(currentInteractionIndex)}>continue</button>*/}
                  {/*  </div>*/}
                  {/*)}*/}
                </EditorStore>
              </DiffPage>
            );
          } else {
            return (
              <DiffPage>
                <UnrecognizedPathWizard
                  onSubmit={({commands}) => {
                    handleCommands(...commands);
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
