import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {Typography} from '@material-ui/core';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import {withEditorContext} from '../contexts/EditorContext.js';
import {withFocusedRequestContext} from '../contexts/FocusedRequestContext.js';
import {withRfcContext} from '../contexts/RfcContext.js';
import {RequestsCommands} from '../engine';
import {routerUrls} from '../routes.js';
import {primary} from '../theme.js';
import BodyEditor from './body-editor';
import StatusCode from './http/StatusCode.js';
import ParametersEditor, {pathParametersToRows, requestParametersToRows} from './parameters-editor';
import ContributionWrapper from './contributions/ContributionWrapper.js';
import {Link as RouterLink} from 'react-router-dom';
import sortBy from 'lodash.sortby';
import Editor from './navigation/Editor';
import Button from '@material-ui/core/Button';
import {asPathTrail, getNameWithFormattedParameters, isPathParameter} from './utilities/PathUtilities.js';

const styles = theme => ({
    root: {
        paddingTop: theme.spacing(2)
    },
    request: {
        border: '1px solid transparent',
        padding: theme.spacing.unit,
        transition: 'background-color 0.5s ease-in-out'
    },
    // maybe raise the elevation instead?
    focusedRequest: {
        border: `1px solid ${primary}`,
        backgroundColor: '#c0c0c0',
        padding: theme.spacing.unit
    },
    margin: {
        minWidth: 30,
        flex: 1,
    },
});

class ResponseListWithoutContext extends React.Component {
    render() {
        const {responses, handleCommand} = this.props;
        const sortedResponses = sortBy(responses, ['responseDescriptor.httpStatusCode']);
        return sortedResponses.map((response) => {
            const {responseId, responseDescriptor} = response;
            const {httpStatusCode, bodyDescriptor} = responseDescriptor;
            const {httpContentType} = getNormalizedBodyDescriptor(bodyDescriptor);

            const responseBodyHandlers = {
                onBodyAdded({conceptId, contentType}) {
                    const bodyDescriptor = RequestsCommands.ShapedBodyDescriptor(contentType, conceptId, false);
                    const command = RequestsCommands.SetResponseBodyShape(responseId, bodyDescriptor);
                    handleCommand(command);
                },
                onBodyRemoved({conceptId}) {
                    const command = RequestsCommands.UnsetResponseBodyShape(responseId, bodyDescriptor);
                    handleCommand(command);
                },
                onBodyRestored({conceptId}) {
                    const bodyDescriptor = RequestsCommands.ShapedBodyDescriptor(httpContentType, conceptId, false);
                    const command = RequestsCommands.SetResponseBodyShape(responseId, bodyDescriptor);
                    handleCommand(command);
                }
            };
            return (
                <div key={responseId}>
                    <StatusCode statusCode={httpStatusCode}/>
                    <BodyEditor
                        rootId={responseId}
                        bodyDescriptor={bodyDescriptor}
                        {...responseBodyHandlers}
                    />
                </div>
            );
        });

    }
}

const ResponseList = withRfcContext(ResponseListWithoutContext);


const pathTrailStyles = theme => {
    return {
        paper: {
            backgroundColor: '#f0f0f0',
            padding: theme.spacing(1),
        },
    };
};

class PathTrailBase extends React.Component {
    render() {
        const {classes, basePath, pathTrail} = this.props;
        console.log({pathTrail})
        const items = pathTrail
            .map((trailItem) => {
                const {pathComponentId, pathComponentName} = trailItem;
                const url = routerUrls.pathPage(basePath, pathComponentId);
                return (
                    <Link key={pathComponentId} component={RouterLink} to={url}>{pathComponentName}</Link>
                );
            });
        return (
            <Paper elevation={0} className={classes.paper}>
                <Breadcrumbs>{items}</Breadcrumbs>
            </Paper>
        );
    }
}

const PathTrail = withEditorContext(withStyles(pathTrailStyles)(PathTrailBase));

export function getNormalizedBodyDescriptor(value) {
    if (value && value.ShapedBodyDescriptor) {
        return value.ShapedBodyDescriptor;
    }
    return {};
}

class PathPage extends React.Component {

    componentDidMount() {
        console.log('xxx dm');
        this.ensureRequestFocused();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('xxx du');
        this.ensureRequestFocused();
    }

    ensureRequestFocused() {
        const {focusedRequestId, cachedQueryResults, pathId} = this.props;
        const {requestIdsByPathId} = cachedQueryResults;
        const requestIdsForPath = requestIdsByPathId[pathId];
        const focusedRequestExistsInThisPath = requestIdsForPath.indexOf(focusedRequestId) >= 0;
        if (focusedRequestExistsInThisPath) {
            return;
        }
        const targetId = requestIdsForPath[0] || null;

        this.props.setFocusedRequestId(targetId);

    }

    renderPlaceholder() {
        return (
            <div>There aren't any requests at this path. Add one!</div>
        );
    }

    renderNotFound() {
        return (
            <div>There is no matching path</div>
        );
    }


    setRequestFocus = (requestId) => () => {
        this.props.setFocusedRequestId(requestId);
    };

    render() {
        const {classes, handleCommand, pathId, focusedRequestId, cachedQueryResults} = this.props;

        const {requests, responses, requestParameters, pathsById, requestIdsByPathId} = cachedQueryResults;

        const path = pathsById[pathId];

        if (!path) {
            return this.renderNotFound();
        }

        const pathTrail = asPathTrail(pathId, pathsById)
        const pathTrailComponents = pathTrail.map(pathId => pathsById[pathId])
        const pathTrailWithNames = pathTrailComponents.map((pathComponent) => {
            const pathComponentName = getNameWithFormattedParameters(pathComponent)
            const pathComponentId = pathComponent.pathId
            return {
                pathComponentName,
                pathComponentId
            }
        })

        const pathParameters = pathTrail
            .map(pathId => pathsById[pathId])
            .filter((p) => isPathParameter(p));

        const requestIdsForPath = requestIdsByPathId[pathId];
        const requestsForPath = requestIdsForPath.map((requestId) => requests[requestId]);
        const methodLinks = requestsForPath
            .map((request) => {
                const {requestId, requestDescriptor} = request;
                const {httpMethod} = requestDescriptor;
                return (
                    <Link key={requestId} href={`#${requestId}`} style={{textDecoration: 'none'}}>
                        <Button
                            size="small"
                            className={classes.margin}
                            color={(focusedRequestId === requestId ? 'secondary' : 'default')}
                            onClick={this.setRequestFocus(requestId)}
                        >
                            {httpMethod}
                        </Button>
                    </Link>
                );
            });

        const requestItems = requestsForPath.length === 0 ? this.renderPlaceholder() : requestsForPath
            .map((request) => {
                const {requestId, requestDescriptor} = request;
                const {httpMethod, bodyDescriptor} = requestDescriptor;
                const {httpContentType} = getNormalizedBodyDescriptor(bodyDescriptor);

                const isFocused = requestId === focusedRequestId;

                const responsesForRequest = Object.values(responses)
                    .filter((response) => response.responseDescriptor.requestId === requestId);

                const parametersForRequest = Object.values(requestParameters)
                    .filter((requestParameter) => requestParameter.requestParameterDescriptor.requestId === requestId);

                const headerParameters = parametersForRequest.filter(x => x.requestParameterDescriptor.location === 'header');
                const queryParameters = parametersForRequest.filter(x => x.requestParameterDescriptor.location === 'query');

                const requestBodyHandlers = {
                    onBodyAdded({conceptId, contentType}) {
                        const bodyDescriptor = RequestsCommands.ShapedBodyDescriptor(contentType, conceptId, false);
                        const command = RequestsCommands.SetRequestBodyShape(requestId, bodyDescriptor);
                        handleCommand(command);
                    },
                    onBodyRemoved({conceptId}) {
                        const command = RequestsCommands.UnsetRequestBodyShape(requestId, bodyDescriptor);
                        handleCommand(command);
                    },
                    onBodyRestored({conceptId}) {
                        const bodyDescriptor = RequestsCommands.ShapedBodyDescriptor(httpContentType, conceptId, false);
                        const command = RequestsCommands.SetRequestBodyShape(requestId, bodyDescriptor);
                        handleCommand(command);
                    }
                };


                return (
                    <div
                        className={isFocused ? classes.focusedRequest : classes.request}
                        key={requestId} id={requestId}
                        onClickCapture={this.setRequestFocus(requestId)}
                        onKeyDownCapture={this.setRequestFocus(requestId)}
                    >
                        <Typography variant="h5">{httpMethod} {path.normalizedAbsolutePath}</Typography>
                        <ContributionWrapper
                            contributionParentId={requestId}
                            contributionKey={'name'}
                            variant={'heading'}
                            placeholder="Summary"
                        />
                        <ContributionWrapper
                            contributionParentId={requestId}
                            contributionKey={'description'}
                            variant={'multi'}
                            placeholder={`Description`}
                        />
                        {headerParameters.length === 0 ? null : (
                            <div>
                                <Typography variant="caption">Headers</Typography>
                                <ParametersEditor
                                    parameters={headerParameters}
                                    rowMapper={requestParametersToRows}
                                    onRename={({id, name}) => {
                                        handleCommand(RequestsCommands.RenameHeaderParameter(id, name))
                                    }}
                                />
                            </div>
                        )}

                        {queryParameters.length === 0 ? null : (
                            <div>
                                <Typography variant="caption">Query Parameters</Typography>
                                <ParametersEditor
                                    parameters={queryParameters}
                                    rowMapper={requestParametersToRows}
                                    onRename={({id, name}) => {
                                        handleCommand(RequestsCommands.RenameHeaderParameter(id, name))
                                    }}
                                />
                            </div>
                        )}

                        <BodyEditor
                            rootId={requestId}
                            bodyDescriptor={bodyDescriptor}
                            {...requestBodyHandlers}
                        />
                        <Divider style={{marginTop: 15, marginBottom: 15}}/>
                        <Typography variant="h5">Responses</Typography>
                        <ResponseList responses={responsesForRequest}/>
                    </div>
                );
            });

        const MethodsTOC = (<>
            <Typography variant="h5" color="primary">Methods</Typography>
            <Divider/>
            <div style={{maxWidth: 200, marginTop: 5}}>
                {methodLinks}
            </div>
        </>);


        return (
            <Editor basePath={this.props.basePath} leftMargin={MethodsTOC}>
                <div className={classes.root}>
                    <PathTrail pathTrail={pathTrailWithNames}/>
                    <ContributionWrapper
                        contributionParentId={pathId}
                        contributionKey={'name'}
                        variant={'heading'}
                        placeholder="Resource Name"
                    />
                    <Divider style={{marginTop: 15, marginBottom: 15}}/>
                    {pathParameters.length === 0 ? null : (
                        <div>
                            <Typography variant="caption">Path Parameters</Typography>
                            <ParametersEditor
                                parameters={pathParameters}
                                rowMapper={pathParametersToRows}
                                onRename={({id, name}) => {
                                    debugger
                                    handleCommand(RequestsCommands.RenamePathParameter(id, name))
                                }}
                            />
                        </div>
                    )}
                    <Divider style={{marginTop: 15, marginBottom: 15}}/>
                    {requestItems}
                </div>
            </Editor>
        );
    }
}

export default withFocusedRequestContext(withEditorContext(withRfcContext(withStyles(styles)(PathPage))));
