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
                    const { diffState, session, rfcContext } = sessionContext
                    const { handleCommands, rfcId, rfcService, queries, cachedQueryResults } = rfcContext
                    const { requests, pathsById } = cachedQueryResults
                    //@TODO: measure progress from sessionContext.diffState and .sessions
                    const currentInteractionIndex = diffState.currentInteractionIndex || 0;
                    const sample = session.samples[currentInteractionIndex]
                    const pathId = queries.resolvePath(sample.request.url)
                    if (pathId) {
                        // show the diff:
                        // const interaction = toInteraction(sample)
                        // const diff = RequestDiffer.compare(interaction, rfcService.currentState(rfcId))
                        // const commandsSeq = DiffToCommands.generateCommands(diff)
                        // const commands = JsonHelper.seqToJsArray(commandsSeq)
                        // handleCommands(...commands)
                        debugger
                        const request = queries.resolveMethod()
                        const pathId = request.requestDescriptor.pathComponentId;
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
                                        <div>{JSON.stringify(session, null, 2)}</div>
                                        <div>{session.samples.length} samples</div>
                                        <Operation request={request} />
                                    </FullSheet>
                                </Editor>
                            </div>
                        )
                    } else {
                        return (<div>path matcher</div>)
                    }
                }}
            </SessionContext.Consumer>
        )
    }
}
export default LocalDiffManager