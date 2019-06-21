import {Typography} from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import {withEditorContext} from '../contexts/EditorContext.js';
import {withRfcContext} from '../contexts/RfcContext.js';
import {RequestsCommands} from '../engine';
import {routerUrls} from '../routes.js';
import BodyEditor from './body-editor';
import ContributionWrapper from './contributions/ContributionWrapper.js';
import {Link as RouterLink} from 'react-router-dom'

const styles = theme => ({
    root: {},
});

class ResponseListWithoutContext extends React.Component {
    render() {
        const {responses, handleCommand} = this.props;
        return responses.map((response) => {
            const {responseId, responseDescriptor} = response;
            const {httpStatusCode, bodyDescriptor} = responseDescriptor
            const {conceptId, httpContentType, isRemoved} = getBodyDescriptor(bodyDescriptor)

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
                    {httpStatusCode}
                    <BodyEditor
                        rootId={responseId}
                        conceptId={conceptId}
                        contentType={httpContentType}
                        isRemoved={isRemoved}
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

export function getBodyDescriptor(value) {
    console.log({value})
    if (value.ShapedBodyDescriptor) {
        return value.ShapedBodyDescriptor
    }
    return {}
}

class PathPage extends React.Component {
    render() {
        const {handleCommand, pathId, queries} = this.props;
        const requestIdsForPath = Object
            .entries(queries.pathsWithRequests())
            .filter(([, v]) => v === pathId)
        const requests = queries.requests()
        const requestsForPath = requestIdsForPath
            .map(([requestId]) => requests[requestId])
        const paths = queries.paths()
        const path = paths.find(x => x.pathId === pathId)
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
        const methodLinks = requestsForPath
            .map((request) => {
                const {requestId, requestDescriptor} = request;
                const {httpMethod} = requestDescriptor
                return (
                    <Link key={requestId} href={`#${requestId}`}>{httpMethod}</Link>
                )
            })

        const responses = queries.responses()
        const requestItems = requestsForPath
            .map((request) => {
                const {requestId, requestDescriptor} = request;
                const {httpMethod, bodyDescriptor} = requestDescriptor
                const {conceptId, httpContentType, isRemoved} = getBodyDescriptor(bodyDescriptor)
                const responsesForRequest = Object
                    .values(responses)
                    .filter((response) => response.responseDescriptor.requestId === requestId)


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
                    <div key={requestId} id={requestId}>
                        <Typography variant="h5">{httpMethod} {path.normalizedAbsolutePath}</Typography>
                        <ContributionWrapper
                            contributionParentId={requestId}
                            contributionKey={'name'}
                            variant={'heading'}
                            placeholder={`${httpMethod} ${path.normalizedAbsolutePath}`}
                        />
                        <ContributionWrapper
                            contributionParentId={requestId}
                            contributionKey={'description'}
                            variant={'multi'}
                            placeholder={`Description`}
                        />
                        <BodyEditor
                            rootId={requestId}
                            conceptId={conceptId}
                            contentType={httpContentType}
                            isRemoved={isRemoved}
                            {...requestBodyHandlers}
                        />
                        <Divider style={{marginTop: 15, marginBottom: 15}}/>
                        <ResponseList responses={responsesForRequest}/>
                    </div>
                )
            })
        return (
            <div>
                <ContributionWrapper
                    contributionParentId={pathId}
                    contributionKey={'summary'}
                    variant={'heading'}
                    placeholder={path.normalizedAbsolutePath}
                />
                <PathTrail pathTrail={pathTrailWithNames}/>
                {methodLinks}
                <Divider style={{marginTop: 15, marginBottom: 15}}/>
                {requestItems}
            </div>
        )
    }
}

export default withEditorContext(withRfcContext(withStyles(styles)(PathPage)))
