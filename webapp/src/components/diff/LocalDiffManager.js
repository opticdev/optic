import React from 'react';
import { Operation } from '../PathPage'
import Editor, { FullSheet, Sheet } from '../navigation/Editor.js';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { toInteraction, RequestDiffer, DiffToCommands, JsonHelper } from '../../engine/index.js';
import { getNameWithFormattedParameters, asPathTrail } from '../utilities/PathUtilities.js';
import { SessionContext } from '../../contexts/SessionContext';
import { makeStyles } from '@material-ui/core/styles';
import { PathTrail } from '../PathPage'
import PathMatcher from './PathMatcher';
import UnrecognizedPathWizard from './UnrecognizedPathWizard';
const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    title: {
        flexGrow: 1,
    },
}));
function CustomAppBar({ title }) {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        {title}
                    </Typography>
                </Toolbar>
            </AppBar>
        </div>
    );
}
class LocalDiffManager extends React.Component {
    render() {
        return (
            <SessionContext.Consumer>
                {(sessionContext) => {
                    const { diffSessionManager, rfcContext } = sessionContext
                    const { handleCommands, rfcId, rfcService, queries, cachedQueryResults } = rfcContext
                    const { requests, requestIdsByPathId, pathsById } = cachedQueryResults
                    //@TODO: measure progress from sessionContext.diffSessionManager and .sessions
                    const sample = diffSessionManager.currentInteraction()
                    const pathId = queries.resolvePath(sample.request.url)
                    if (pathId) {
                        const interaction = toInteraction(sample)
                        const diff = RequestDiffer.compare(interaction, rfcService.currentState(rfcId))
                        const interpretation = DiffToCommands.generateCommands(diff)
                        const commands = JsonHelper.seqToJsArray(interpretation.commands)
                        const hasDiff = commands.length > 0
                        const applyChange = () => {
                            console.log({ commands })
                            handleCommands(...commands)
                            diffSessionManager.acceptInterpretation(interpretation)
                        }
                        const requestsForPathId = requestIdsByPathId[pathId] || []
                        const request = requestsForPathId
                            .map(requestId => requests[requestId])
                            .find(request => {
                                return request.requestDescriptor.httpMethod === sample.request.method
                            }) || null
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
                            <div>
                                <CustomAppBar title="Review Proposed Changes" />
                                <Editor>
                                    <FullSheet>
                                        <PathTrail pathTrail={pathTrailWithNames} />
                                        <div>{diffSessionManager.session.samples.length} samples</div>
                                        {request && <Operation request={request} />}
                                        {hasDiff ? (
                                            <button onClick={applyChange}>apply change</button>
                                        ) : (
                                            <div>This request is in sync with the spec!
                                                <button onClick={() => diffSessionManager.finishInteraction()}>continue</button>
                                            </div>
                                        )}
                                    </FullSheet>
                                </Editor>
                            </div>
                        )
                    } else {
                        return (
                            <UnrecognizedPathWizard url={sample.request.url} />
                        )
                    }
                }}
            </SessionContext.Consumer>
        )
    }
}
export default LocalDiffManager