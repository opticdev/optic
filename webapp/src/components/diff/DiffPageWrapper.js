import React from 'react';
import Typography from '@material-ui/core/Typography';
import SimulatedCommandContext from './SimulatedCommandContext';
import DiffPage from './DiffPage';
import {asPathTrail, getNameWithFormattedParameters} from '../utilities/PathUtilities';
import {RfcContext} from '../../contexts/RfcContext';
import Paper from '@material-ui/core/Paper';
import {EditorStore, EditorModes} from '../../contexts/EditorContext';
import {PathTrailWithoutLinks} from '../PathPage';
import {Operation} from '../PathPage';
import {isStartable} from './LocalDiffManager';
import {toInteraction, RequestDiffer, JsonHelper, Interpreters} from '../../engine';
import {NavigationStore} from '../../contexts/NavigationContext';
import {
  ColoredIdsStore, ColorTags
} from '../../contexts/ColorContext';
import FastForwardIcon from '@material-ui/icons/FastForward';
import {withShapeDialogContext} from '../../contexts/ShapeDialogContext';
import ShapeViewerStack from '../shape-editor/ShapeViewerStack';
import Interpreter from './Interpreter';
import Button from '@material-ui/core/Button';
import BasicButton from '../shape-editor/BasicButton';

class DiffPageWrapper extends React.Component {
  state = {
    selectedInterpretationIndex: 0,
    additionalCommands: []
  };

  setSelectedInterpretationIndex = (selectedInterpretationIndex) => {
    this.setState({
      selectedInterpretationIndex,
      additionalCommands: []
    });
  };

  addAdditionalCommands = (...commands) => {
    this.setState({
      additionalCommands: [...this.state.additionalCommands, ...commands]
    });
  };

  render() {
    const {
      classes,
      rfcId,
      diff,
      queries,
      rfcService, eventStore,
      cachedQueryResults, applyCommands,
      diffSessionManager, diffState, diffStateProjections,
      onAccept, onIgnore, item, readyToFinish, interpretations,
      shapeDialog
    } = this.props;
    const progress = (diffState.acceptedInterpretations.length / diffSessionManager.session.samples.length) * 100;
    const {pathId, sample, index: currentInteractionIndex} = item;
    const {pathsById} = cachedQueryResults;
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
    const startableInteractionsForPath = diffStateProjections.sampleItemsGroupedByPath[pathId].filter(x => isStartable(diffState, x));

    const interpretation = interpretations[this.state.selectedInterpretationIndex] || null;
    const commands = interpretation ? JsonHelper.seqToJsArray(interpretation.commands) : [];

    {/*<div style={{ margin: '2em 0', width: 380 }}>*/
    }
    {/*  <Typography variant="overline">{interpretations.length} diff interpretations</Typography>*/
    }
    {/*  <Select*/
    }
    {/*    value={this.state.selectedInterpretationIndex}*/
    }
    {/*    onChange={(e) => this.setSelectedInterpretationIndex(e.target.value)}*/
    }
    {/*    fullWidth*/
    }
    {/*  >*/
    }
    {/*    {interpretations.map((interpretation, index) => {*/
    }
    {/*      return (*/
    }
    {/*        <MenuItem value={index}>*/
    }
    {/*          {interpretation.title}*/
    }
    {/*        </MenuItem>*/
    }
    {/*      );*/
    }
    {/*    })}*/
    }
    {/*  </Select>*/
    }
    {/*</div>*/
    }


    commands.push(...this.state.additionalCommands);

    const accept = () => onAccept([...commands, ...this.state.additionalCommands]);

    const affectedIds = interpretation ? interpretation.metadataJs.affectedIds : [];
    const colors = interpretation && ((() => {
      if (interpretation.metadataJs.added) {
        return ColorTags.ADDED;
      } else if (interpretation.metadataJs.changed) {
        return ColorTags.CHANGED;
      }
    }))();

    const cardNavigator = interpretations.length === 0 ? null : (
      <Interpreter
        diff={diff}
        queries={queries}
        accept={accept}
        ignore={onIgnore}
        interpretations={interpretations}
        selectedInterpretationIndex={this.state.selectedInterpretationIndex}
        setInterpretation={this.setSelectedInterpretationIndex}
      />
    );
    return (
      <SimulatedCommandContext
        shouldSimulate={true}
        rfcId={rfcId}
        eventStore={eventStore}
        commands={commands}
      >
        <ColoredIdsStore ids={affectedIds} tag={colors}>
          <DiffPage
            cardNavigator={cardNavigator}
            collapseLeftMargin={true}
            progress={progress}
            path={pathId}
            interpretation={interpretation}
            readyToFinish={readyToFinish}
            finish={() => {
              diffSessionManager.finishInteraction(currentInteractionIndex);
              // also finish any interaction we deem "equivalent" that doesn't have a diff
              const startableInteractionsForPath = diffStateProjections.sampleItemsGroupedByPath[pathId].filter(x => isStartable(diffState, x));
              const startableInteractionsWithNoDiff = startableInteractionsForPath.filter(x => {
                const {sample} = x;
                const interaction = toInteraction(sample);
                const rfcState = rfcService.currentState(rfcId);
                const diff = RequestDiffer.compare(interaction, rfcState);
                const interpretations = new Interpreters.CompoundInterpreter(rfcState.shapesState).interpret(diff);
                const hasDiff = interpretations.length > 0;
                return !hasDiff;
              });
              // console.log({ startableInteractionsForPath, startableInteractionsWithNoDiff });
              startableInteractionsWithNoDiff.forEach(x => diffSessionManager.finishInteraction(x.index));
            }}
          >
            <NavigationStore addAdditionalCommands={this.addAdditionalCommands}
                             inDiffMode={true}
                             onShapeSelected={(shapeId) => {
                               const examples = interpretation.metadataJs.examples;
                               shapeDialog.pushToStack(shapeId, examples);
                             }}>
              <EditorStore mode={EditorModes.DESIGN}>
                <Paper style={{flex: 1, width: 850, maxWidth: 1000, overflow: 'hidden'}}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <Typography variant="subtitle2" component="div" color="primary" style={{
                      fontSize: 17,
                      padding: 11
                    }}>Path ({startableInteractionsForPath.length} samples)
                    </Typography>
                    <div style={{flex: 1}}/>
                    <div style={{padding: '.5em', opacity: '0'}}>
                      <BasicButton onClick={() => {
                      startableInteractionsForPath.forEach((item) => {
                        diffSessionManager.skipInteraction(item.index);
                      });
                    }}><FastForwardIcon color="primary"/></BasicButton>
                    </div>
                  </div>
                  <div className={classes.pathDisplay}>
                    <div className={classes.methodDisplay}>{sample.request.method}</div>
                    <PathTrailWithoutLinks pathTrail={pathTrailWithNames} style={{flex: 1}}/>
                  </div>
                </Paper>
                <RfcContext.Consumer>
                  {(rfcContext) => {
                    const {cachedQueryResults} = rfcContext;
                    const {requestIdsByPathId, requests} = cachedQueryResults;
                    const requestsForPathId = requestIdsByPathId[pathId] || [];
                    const request = requestsForPathId
                      .map(requestId => requests[requestId])
                      .find(request => {
                        return request.requestDescriptor.httpMethod === sample.request.method;
                      }) || null;
                    const handleCommands = (...commands) => {
                      diffSessionManager.markAsManuallyIntervened(currentInteractionIndex);
                      applyCommands(...commands);
                      rfcContext.handleCommands(...commands);
                    };
                    const updatedRfcContext = {
                      ...rfcContext,
                      handleCommands,
                      handleCommand: handleCommands
                    };
                    if (request) {
                      const highlightNestedShape = (interpretation && interpretation.metadataJs.highlightNestedShape) || {};
                      return (
                        <RfcContext.Provider value={updatedRfcContext}>
                          <Operation request={request} highlightNestedShape={highlightNestedShape}/>
                          <ShapeViewerStack handleCommands={this.addAdditionalCommands}/>
                        </RfcContext.Provider>
                      );
                    }
                  }}
                </RfcContext.Consumer>
              </EditorStore>
            </NavigationStore>
          </DiffPage>
        </ColoredIdsStore>
      </SimulatedCommandContext>
    );
  }
}

export default withShapeDialogContext(DiffPageWrapper);
