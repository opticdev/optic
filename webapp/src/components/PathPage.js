import {Typography} from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import {withEditorContext} from '../contexts/EditorContext.js';
import {withFocusedRequestContext} from '../contexts/FocusedRequestContext.js';
import {withRfcContext} from '../contexts/RfcContext.js';
import {RequestsCommands} from '../engine';
import {routerUrls} from '../routes.js';
import {primary} from '../theme.js';
import BodyEditor from './body-editor';
import StatusCode from './http/StatusCode.js';
import ParametersEditor from './parameters-editor';
import ContributionWrapper from './contributions/ContributionWrapper.js';
import {Link as RouterLink} from 'react-router-dom'

const styles = theme => ({
    root: {},
    request: {
        border: '1px solid transparent',
        padding: 10,
        transition: 'background-color 0.5s ease-in-out'
    },
    // maybe raise the elevation instead?
    focusedRequest: {
        border: `1px solid ${primary}`,
        backgroundColor: '#c0c0c0',
        padding: 10
    }
});

class ResponseListWithoutContext extends React.Component {
    render() {
        const {responses, handleCommand} = this.props;
        return responses.map((response) => {
            const {responseId, responseDescriptor} = response;
            const {httpStatusCode, bodyDescriptor} = responseDescriptor
            const {httpContentType} = getNormalizedBodyDescriptor(bodyDescriptor)

            const responseBodyHandlers = {
                onBodyAdded({conceptId, contentType}) {
                    const bodyDescriptor = RequestsCommands.ShapedBodyDescriptor(contentType, conceptId, false)
                    const command = RequestsCommands.SetResponseBodyShape(responseId, bodyDescriptor)
                    handleCommand(command)
                },
                onBodyRemoved({conceptId}) {
                    const command = RequestsCommands.UnsetResponseBodyShape(responseId, bodyDescriptor)
                    handleCommand(command)
                },
                onBodyRestored({conceptId}) {
                    const bodyDescriptor = RequestsCommands.ShapedBodyDescriptor(httpContentType, conceptId, false)
                    const command = RequestsCommands.SetResponseBodyShape(responseId, bodyDescriptor)
                    handleCommand(command)
                }
            }
            return (
                <div key={responseId}>
                    <StatusCode statusCode={httpStatusCode} />
                    <BodyEditor
                        rootId={responseId}
                        bodyDescriptor={bodyDescriptor}
                        {...responseBodyHandlers}
                    />
                </div>
            )
        })

    }
}

const ResponseList = withRfcContext(ResponseListWithoutContext)

class PathTrailWithoutContext extends React.Component {
    render() {
        const {basePath, pathTrail} = this.props;
        const maxIndex = pathTrail.length - 1
        const items = pathTrail.map((trailItem, index) => {
            const {pathComponentId, pathComponentName} = trailItem;
            return (
                <>
                    <RouterLink to={routerUrls.pathPage(basePath, pathComponentId)}><Typography
                        variant="h4">{pathComponentName}</Typography></RouterLink>
                    {index < maxIndex ? <Typography variant="h4">/</Typography> : null}
                </>
            )
        })
        return (
            <div style={{display: 'flex'}}>{items}</div>
        )
    }
}

const PathTrail = withEditorContext(PathTrailWithoutContext)

export function getNormalizedBodyDescriptor(value) {
    console.log({value})
    if (value && value.ShapedBodyDescriptor) {
        return value.ShapedBodyDescriptor
    }
    return {}
}

class PathPage extends React.Component {
    renderPlaceholder() {
        return (
            <div>There aren't any requests at this path. Add one!</div>
        )
    }

    renderMissing() {
        return (
            <div>There is no matching path</div>
        )
    }


    setRequestFocus = (requestId) => () => {
        this.props.setFocusedRequestId(requestId)
    }

    render() {
        const {classes, handleCommand, pathId, focusedRequestId, cachedQueryResults} = this.props;

        const {requests, responses, requestParameters, pathsById, pathIdsByRequestId} = cachedQueryResults

        const path = pathsById[pathId]

        if (!path) {
            return this.renderMissing()
        }

        const pathTrail = [...path.parentPathIds().reverse(), pathId]
        const pathTrailWithNames = path.normalizedAbsolutePath
            .split('/')
            .map((pathComponentName, index) => {
                const pathComponentId = pathTrail[index]
                return {
                    pathComponentId,
                    pathComponentName
                }
            })

        const pathParameters = pathTrail
            .map(pathId => pathsById[pathId])
            .filter(x => x.isParameter)

        const requestIdsForPath = Object
            .entries(pathIdsByRequestId)
            .filter(([, v]) => v === pathId)
        const requestsForPath = requestIdsForPath
            .map(([requestId]) => requests[requestId])
        const methodLinks = requestsForPath
            .map((request) => {
                const {requestId, requestDescriptor} = request;
                const {httpMethod} = requestDescriptor
                return (
                    <Link key={requestId} href={`#${requestId}`}>{httpMethod}</Link>
                )
            })

        const requestItems = requestsForPath.length === 0 ? this.renderPlaceholder() : requestsForPath
            .map((request) => {
                const {requestId, requestDescriptor} = request
                const {httpMethod, bodyDescriptor} = requestDescriptor
                const {httpContentType} = getNormalizedBodyDescriptor(bodyDescriptor)

                const isFocused = requestId === focusedRequestId

                const responsesForRequest = Object.values(responses)
                    .filter((response) => response.responseDescriptor.requestId === requestId)

                const parametersForRequest = Object.values(requestParameters)
                    .filter((requestParameter) => requestParameter.requestParameterDescriptor.requestId === requestId)

                const headerParameters = parametersForRequest.filter(x => x.requestParameterDescriptor.location === 'header')
                const queryParameters = parametersForRequest.filter(x => x.requestParameterDescriptor.location === 'query')
                const pathParameters = []

                const requestBodyHandlers = {
                    onBodyAdded({conceptId, contentType}) {
                        const bodyDescriptor = RequestsCommands.ShapedBodyDescriptor(contentType, conceptId, false)
                        const command = RequestsCommands.SetRequestBodyShape(requestId, bodyDescriptor)
                        handleCommand(command)
                    },
                    onBodyRemoved({conceptId}) {
                        const command = RequestsCommands.UnsetRequestBodyShape(requestId, bodyDescriptor)
                        handleCommand(command)
                    },
                    onBodyRestored({conceptId}) {
                        const bodyDescriptor = RequestsCommands.ShapedBodyDescriptor(httpContentType, conceptId, false)
                        const command = RequestsCommands.SetRequestBodyShape(requestId, bodyDescriptor)
                        handleCommand(command)
                    }
                }


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
                                <ParametersEditor parameters={headerParameters}/>
                            </div>
                        )}

                        {queryParameters.length === 0 ? null : (
                            <div>
                                <Typography variant="caption">Query Parameters</Typography>
                                <ParametersEditor parameters={queryParameters}/>
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
                )
            })
        return (
            <div>
                <ContributionWrapper
                    contributionParentId={pathId}
                    contributionKey={'name'}
                    variant={'heading'}
                    placeholder="Resource Name"
                />
                <PathTrail pathTrail={pathTrailWithNames}/>
                {methodLinks}
                <Divider style={{marginTop: 15, marginBottom: 15}}/>
                {requestItems}
            </div>
        )
    }
}

export default withFocusedRequestContext(withEditorContext(withRfcContext(withStyles(styles)(PathPage))))
