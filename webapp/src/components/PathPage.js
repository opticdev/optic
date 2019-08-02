import Zoom from '@material-ui/core/Zoom';
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
import BodyEditor from './body-editor';
import StatusCode from './http/StatusCode.js';
import {FullSheet, Sheet} from './navigation/Editor.js';
import ParametersEditor, {pathParametersToRows, requestParametersToRows} from './parameters-editor';
import ContributionWrapper from './contributions/ContributionWrapper.js';
import {Link as RouterLink} from 'react-router-dom';
import sortBy from 'lodash.sortby';
import Editor from './navigation/Editor';
import Button from '@material-ui/core/Button';
import {asPathTrail, getNameWithFormattedParameters, isPathParameter} from './utilities/PathUtilities.js';
import {RequestUtilities} from '../utilities/RequestUtilities';
import {EditorModes} from '../contexts/EditorContext';
import {track} from '../Analytics';
import {RequestsCommandHelper} from './requests/RequestsCommandHelper.js';
import RequestPageHeader from './requests/RequestPageHeader';
import Helmet from 'react-helmet';
import CreateNew from './navigation/CreateNew';

const styles = theme => ({
    root: {
        paddingTop: theme.spacing(2)
    },
    request: {
        padding: theme.spacing.unit,
    },
    focusedRequest: {
        padding: theme.spacing.unit
    },
    margin: {
        minWidth: 30,
        flex: 1,
    },
    responseCard: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 50
    },
    responseStatus: {
        width: 120,
        borderRight: '1px solid #e2e2e2',
        paddingTop: 33,
        paddingBottom: 33
    },
    responseDetail: {
        flex: 1,
        padding: 11,
        paddingLeft: 20,
    }
});

class ResponseListWithoutContext extends React.Component {
    render() {
        const {responses, handleCommands, classes} = this.props;
        const sortedResponses = sortBy(responses, ['responseDescriptor.httpStatusCode']);
        return sortedResponses.map((response) => {
            const {responseId, responseDescriptor} = response;
            const {httpStatusCode, bodyDescriptor} = responseDescriptor;
            const {httpContentType, shapeId, isRemoved} = getNormalizedBodyDescriptor(bodyDescriptor);

            const responseBodyHandlers = {
                onBodyAdded({shapeId, contentType}) {
                    const bodyDescriptor = RequestsCommands.ShapedBodyDescriptor(contentType, shapeId, false);
                    const command = RequestsCommands.SetResponseBodyShape(responseId, bodyDescriptor);
                    handleCommands(command);
                },
                onBodyRemoved({shapeId}) {
                    const command = RequestsCommands.UnsetResponseBodyShape(responseId, bodyDescriptor);
                    handleCommands(command);
                },
                onBodyRestored({shapeId}) {
                    const bodyDescriptor = RequestsCommands.ShapedBodyDescriptor(httpContentType, shapeId, false);
                    const command = RequestsCommands.SetResponseBodyShape(responseId, bodyDescriptor);
                    handleCommands(command);
                },
                onContentTypeChanged({contentType}) {
                    const bodyDescriptor = RequestsCommands.ShapedBodyDescriptor(contentType, shapeId, isRemoved);
                    const command = RequestsCommands.SetResponseBodyShape(responseId, bodyDescriptor);
                    handleCommands(command);
                }
            };

            return (
                <Zoom in={true} key={responseId}>
                    <div className={classes.responseCard}>
                        <div className={classes.responseStatus}>
                            <StatusCode statusCode={httpStatusCode} onChange={(statusCode) => {
                                const command = RequestsCommands.SetResponseStatusCode(responseId, statusCode)
                                handleCommands(command)
                            }}/>
                        </div>
                        <div className={classes.responseDetail}>
                            <ContributionWrapper
                                style={{marginTop: -20}}
                                contributionParentId={responseId}
                                defaultText={'No Description'}
                                contributionKey={'description'}
                                variant={'multi'}
                                placeholder={`Response Description`}
                            />
                            <div style={{marginLeft: 5}}>
                                <BodyEditor
                                    rootId={responseId}
                                    bodyDescriptor={bodyDescriptor}
                                    {...responseBodyHandlers}
                                />
                            </div>
                        </div>
                    </div>
                </Zoom>
            );
        });

    }
}

const ResponseList = withRfcContext(withStyles(styles)(ResponseListWithoutContext));


const pathTrailStyles = theme => {
    return {
        paper: {
            backgroundColor: '#f8f8f8',
            padding: theme.spacing(1),
        },
    };
};

class PathTrailBase extends React.Component {
    render() {
        const {classes, baseUrl, pathTrail} = this.props;
        const items = pathTrail
            .map((trailItem) => {
                const {pathComponentId, pathComponentName} = trailItem;
                const url = routerUrls.pathPage(baseUrl, pathComponentId);
                return (
                    <Link key={pathComponentId} component={RouterLink} to={url}>{pathComponentName}</Link>
                );
            });
        return (
            <Paper elevation={0} className={classes.paper}>
                <Breadcrumbs maxItems={12}>{items}</Breadcrumbs>
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
    constructor(props) {
        super(props)
        this.scrollContainer = React.createRef()
    }


    componentDidMount() {
        this.ensureRequestFocused();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.pathId !== this.props.pathId) {
            track('Loaded Path')
            this.scrollContainer.current.scrollTo(0, 0)
        }
        this.ensureRequestFocused();
    }

    ensureRequestFocused() {
        const {focusedRequestId, cachedQueryResults, pathId} = this.props;
        const {requestIdsByPathId} = cachedQueryResults;
        const requestIdsForPath = requestIdsByPathId[pathId] || [];
        const focusedRequestExistsInThisPath = requestIdsForPath.indexOf(focusedRequestId) >= 0;
        if (focusedRequestExistsInThisPath) {
            return;
        }
        const targetId = requestIdsForPath[0] || null;

        this.props.setFocusedRequestId(targetId);

    }

    renderPlaceholder() {
        return (
            <div>
                <CreateNew render={({addRequest, classes}) => {
                    return <>There are no requests for this path. <Button color="secondary" onClick={() => {
                        this.props.switchEditorMode(EditorModes.DESIGN)
                        addRequest()
                    }}>Add Request</Button></>
                }}/>
            </div>
        );
    }

    renderNotFound() {
        const {classes} = this.props
        return (

            <Editor>
                <FullSheet>
                    <div className={classes.root}>
                        <Typography>This Path does not exist</Typography>
                    </div>
                </FullSheet>
            </Editor>
        )
    }


    setRequestFocus = (requestId) => () => {
        this.props.setFocusedRequestId(requestId);
    };

    render() {
        const {classes, handleCommands, pathId, focusedRequestId, cachedQueryResults, mode, apiName, switchEditorMode} = this.props;

        const {requests, responses, requestParameters, pathsById, requestIdsByPathId} = cachedQueryResults;

        const path = pathsById[pathId];

        if (!path) {
            return this.renderNotFound();
        }

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

        const pathParameters = pathTrail
            .map(pathId => pathsById[pathId])
            .filter((p) => isPathParameter(p));

        const methodChoices = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']
        const lowestRank = methodChoices.length;
        const ordering = methodChoices.reduce((acc, item, index) => {
            acc[item] = index + 1
            return acc
        }, {})
        const requestIdsForPath = requestIdsByPathId[pathId] || [];
        const requestsForPath = requestIdsForPath.map((requestId) => requests[requestId]);
        const methodLinks = requestsForPath
            .sort((requestA, requestB) => {
                const {httpMethod: methodA} = requestA.requestDescriptor
                const {httpMethod: methodB} = requestB.requestDescriptor
                return (ordering[methodA] || lowestRank) - (ordering[methodB] || lowestRank)
            })
            .map((request) => {
                const {requestId, requestDescriptor} = request;
                const {httpMethod} = requestDescriptor;
                return (
                    <Link key={requestId} href={`#${requestId}`} style={{textDecoration: 'none'}}>
                        <Button
                            size="small"
                            disableRipple={true}
                            className={classes.margin}
                            style={{fontWeight: 200}}
                            onClick={this.setRequestFocus(requestId)}
                        >
                            {httpMethod}
                        </Button>
                    </Link>
                );
            })

        const requestItems = requestsForPath.length === 0 ? this.renderPlaceholder() : requestsForPath
            .map((request) => {
                const {requestId, requestDescriptor} = request;
                const {httpMethod, bodyDescriptor} = requestDescriptor;
                const {httpContentType, shapeId, isRemoved} = getNormalizedBodyDescriptor(bodyDescriptor);
                const shouldShowRequestBody = RequestUtilities.hasBody(bodyDescriptor) || (mode === EditorModes.DESIGN && RequestUtilities.canAddBody(request))

                const isFocused = requestId === focusedRequestId;

                const requestCommandsHelper = new RequestsCommandHelper(handleCommands, requestId)

                const responsesForRequest = Object.values(responses)
                    .filter((response) => response.responseDescriptor.requestId === requestId);

                const parametersForRequest = Object.values(requestParameters)
                    .filter((requestParameter) => requestParameter.requestParameterDescriptor.requestId === requestId);

                const headerParameters = parametersForRequest.filter(x => x.requestParameterDescriptor.location === 'header');
                const queryParameters = parametersForRequest.filter(x => x.requestParameterDescriptor.location === 'query');

                const requestBodyHandlers = {
                    onBodyAdded({shapeId, contentType}) {
                        const bodyDescriptor = RequestsCommands.ShapedBodyDescriptor(contentType, shapeId, false);
                        const command = RequestsCommands.SetRequestBodyShape(requestId, bodyDescriptor);
                        handleCommands(command);
                    },
                    onBodyRemoved({shapeId}) {
                        const command = RequestsCommands.UnsetRequestBodyShape(requestId, bodyDescriptor);
                        handleCommands(command);
                    },
                    onBodyRestored({shapeId}) {
                        const bodyDescriptor = RequestsCommands.ShapedBodyDescriptor(httpContentType, shapeId, false);
                        const command = RequestsCommands.SetRequestBodyShape(requestId, bodyDescriptor);
                        handleCommands(command);
                    },
                    onContentTypeChanged({contentType}) {
                        const bodyDescriptor = RequestsCommands.ShapedBodyDescriptor(contentType, shapeId, isRemoved);
                        const command = RequestsCommands.SetRequestBodyShape(requestId, bodyDescriptor);
                        handleCommands(command);
                    }
                };

                return (
                    <Sheet>
                        <div
                            className={isFocused ? classes.focusedRequest : classes.request}
                            key={requestId} id={requestId}
                            onClickCapture={this.setRequestFocus(requestId)}
                            onKeyDownCapture={this.setRequestFocus(requestId)}
                        >
                            <Typography
                                variant="overline" style={{fontSize: 28, marginBottom: 5}}
                                color="primary">{httpMethod}</Typography>
                            <ContributionWrapper
                                style={{marginTop: -20}}
                                contributionParentId={requestId}
                                contributionKey={'description'}
                                variant={'multi'}
                                placeholder={`Description`}
                            />

                            {headerParameters.length === 0 && mode === EditorModes.DOCUMENTATION ? null : (
                                <div>
                                    <RequestPageHeader forType="Header"
                                                       addAction={requestCommandsHelper.addHeaderParameter}/>
                                    <ParametersEditor
                                        parameters={headerParameters}
                                        rowMapper={requestParametersToRows}
                                        onRename={({id, name}) => {
                                            handleCommands(RequestsCommands.RenameHeaderParameter(id, name));
                                        }}
                                    />
                                </div>
                            )}

                            {queryParameters.length === 0 && mode === EditorModes.DOCUMENTATION ? null : (
                                <div>
                                    <RequestPageHeader forType="Query Parameter"
                                                       addAction={requestCommandsHelper.addQueryParameter}/>
                                    <ParametersEditor
                                        parameters={queryParameters}
                                        rowMapper={requestParametersToRows}
                                        onRename={({id, name}) => {
                                            handleCommands(RequestsCommands.RenameQueryParameter(id, name));
                                        }}
                                    />
                                </div>
                            )}

                            {shouldShowRequestBody ? (
                                <>
                                    <Typography variant="h6" color="primary" style={{marginTop: 15}}>Request
                                        Body</Typography>
                                    <BodyEditor
                                        rootId={requestId}
                                        bodyDescriptor={bodyDescriptor}
                                        {...requestBodyHandlers}
                                    />
                                </>
                            ) : null}


                            <div style={{marginBottom: 44}}>
                                <RequestPageHeader forType="Response" addAction={requestCommandsHelper.addResponse}/>
                            </div>
                            <ResponseList responses={responsesForRequest}/>
                        </div>
                    </Sheet>
                );
            });

        const MethodsTOC = (<>
            <Typography variant="h5" color="primary">Methods</Typography>
            <Divider/>
            <div style={{maxWidth: 200, marginTop: 5, display: 'flex', flexDirection: 'column'}}>
                {methodLinks}
            </div>
        </>);


        const {contributions} = cachedQueryResults
        const resourceName = contributions.getOrUndefined(pathId, 'name')

        const absolutePath = pathTrailWithNames
            .map((trailItem) => {
                const {pathComponentName} = trailItem;
                return (
                    pathComponentName
                );
            }).join('/')

        const pageName = `${resourceName || absolutePath} ${apiName}`

        return (
            <Editor baseUrl={this.props.baseUrl} leftMargin={MethodsTOC} scrollContainerRef={this.scrollContainer}>
                <Helmet><title>{pageName}</title></Helmet>
                <div className={classes.root}>
                    <Sheet style={{paddingTop: 2}}>
                        <ContributionWrapper
                            contributionParentId={pathId}
                            contributionKey={'name'}
                            variant={'heading'}
                            placeholder="Resource Name"
                        />

                        <Typography variant="h6" color="primary" style={{marginBottom: 11}}>Path</Typography>
                        <PathTrail pathTrail={pathTrailWithNames}/>

                        {pathParameters.length === 0 ? null : (
                            <div>
                                <ParametersEditor
                                    parameters={pathParameters}
                                    rowMapper={pathParametersToRows}
                                    onRename={({id, name}) => {
                                        handleCommands(RequestsCommands.RenamePathParameter(id, name));
                                    }}
                                />
                            </div>
                        )}
                    </Sheet>
                    {requestItems}
                </div>
            </Editor>
        );
    }
}

export default withFocusedRequestContext(withEditorContext(withRfcContext(withStyles(styles)(PathPage))));
