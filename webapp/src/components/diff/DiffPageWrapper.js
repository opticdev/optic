import React from 'react';
import Typography from '@material-ui/core/Typography';
import SimulatedCommandContext from './SimulatedCommandContext';
import DiffPage from './DiffPage';
import { asPathTrail, getNameWithFormattedParameters } from '../utilities/PathUtilities';
import { RfcContext } from '../../contexts/RfcContext';
import Paper from '@material-ui/core/Paper';
import { EditorStore, EditorModes } from '../../contexts/EditorContext';
import { PathTrailWithoutLinks } from '../PathPage';
import { Operation } from '../PathPage';
import { isStartable } from './LocalDiffManager';
import { toInteraction, RequestDiffer, DiffToCommands, JsonHelper, mapScala } from '../../engine';
import { NavigationStore } from '../../contexts/NavigationContext';
import { ColoredIdsStore } from '../../contexts/ColorContext';

class DiffPageWrapper extends React.Component {
    render() {
        const {
            classes,
            rfcId,
            rfcService, eventStore, commands,
            cachedQueryResults, applyCommands,
            diffSessionManager, diffState, diffStateProjections,
            onAccept, onIgnore, item, readyToFinish, interpretation
        } = this.props;
        const progress = (diffState.acceptedInterpretations.length / diffSessionManager.session.samples.length) * 100;
        const { pathId, sample, index: currentInteractionIndex } = item;
        const { pathsById } = cachedQueryResults;
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


        const affectedIds = interpretation ? mapScala(interpretation.affectedIds)(i => i) : []

        return (
            <SimulatedCommandContext
                shouldSimulate={true}
                rfcId={rfcId}
                eventStore={eventStore}
                commands={commands}
            >
                <ColoredIdsStore ids={affectedIds}>
                    <DiffPage
                        collapseLeftMargin={true}
                        progress={progress}
                        path={pathId}
                        interpretation={interpretation}
                        readyToFinish={readyToFinish}
                        finish={() => {
                            diffSessionManager.finishInteraction(currentInteractionIndex);
                            // also finish any interaction we deem "equivalent" that doesn't have a diff
                            const startableInteractionsForPath = diffStateProjections.samplesGroupedByPath[pathId].filter(x => isStartable(diffState, x));
                            const startableInteractionsWithNoDiff = startableInteractionsForPath.filter(x => {
                                const { sample } = x;
                                const interaction = toInteraction(sample);
                                const rfcState = rfcService.currentState(rfcId);
                                const diff = RequestDiffer.compare(interaction, rfcState);
                                const interpretation = new DiffToCommands(rfcState.shapesState).interpret(diff);
                                const commands = JsonHelper.seqToJsArray(interpretation.commands);
                                const hasDiff = commands.length > 0;
                                return !hasDiff;
                            });
                            console.log({ startableInteractionsForPath, startableInteractionsWithNoDiff });
                            startableInteractionsWithNoDiff.forEach(x => diffSessionManager.finishInteraction(x.index));
                        }}
                        accept={onAccept}
                        ignore={onIgnore}
                    >
                        <NavigationStore onShapeSelected={() => {
                            // nothing for now
                        }}>
                            <EditorStore mode={readyToFinish ? EditorModes.DESIGN : EditorModes.DOCUMENTATION}>
                                <Paper style={{ flex: 1, width: 850, maxWidth: 1000, overflow: 'hidden' }}>
                                    <Typography variant="subtitle2" component="div" color="primary" style={{
                                        fontSize: 17,
                                        padding: 11
                                    }}>Path ({diffSessionManager.session.samples.length} samples)</Typography>
                                    <div className={classes.pathDisplay}>
                                        <div className={classes.methodDisplay}>{sample.request.method}</div>
                                        <PathTrailWithoutLinks pathTrail={pathTrailWithNames} style={{ flex: 1 }} />
                                    </div>
                                </Paper>
                                <RfcContext.Consumer>
                                    {(rfcContext) => {
                                        const { cachedQueryResults } = rfcContext;
                                        const { requestIdsByPathId, requests } = cachedQueryResults;
                                        const requestsForPathId = requestIdsByPathId[pathId] || [];
                                        const request = requestsForPathId
                                            .map(requestId => requests[requestId])
                                            .find(request => {
                                                return request.requestDescriptor.httpMethod === sample.request.method;
                                            }) || null;
                                        const handleCommands = (commands) => {
                                            diffSessionManager.markAsManuallyIntervened(currentInteractionIndex);
                                            applyCommands(commands);
                                            rfcContext.handleCommands(commands);
                                        };
                                        const updatedRfcContext = {
                                            ...rfcContext,
                                            handleCommands,
                                            handleCommand: handleCommands
                                        };
                                        if (request) {
                                            return (
                                                <RfcContext.Provider value={updatedRfcContext}>
                                                    <Operation request={request} />
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

export default DiffPageWrapper;
