import {Typography} from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import {withEditorContext} from '../contexts/EditorContext.js';
import {withRfcContext} from '../contexts/RfcContext.js';
import ContributionWrapper from './contributions/ContributionWrapper.js';

const styles = theme => ({
    root: {},
});

class ResponseList extends React.Component {
    render() {
        const {responses} = this.props;
        return responses.map((response) => {
            const {responseId, responseDescriptor} = response;
            const {httpStatusCode} = responseDescriptor
            return (
                <div key={responseId}>{httpStatusCode}</div>
            )
        })

    }
}

class PathPage extends React.Component {
    render() {
        const {classes, pathId, queries} = this.props;
        const requestIdsForPath = Object
            .entries(queries.pathsWithRequests())
            .filter(([, v]) => v === pathId)
        const requests = queries.requests()
        const requestsForPath = requestIdsForPath
            .map(([requestId]) => requests[requestId])
        const paths = queries.paths()
        const path = paths.find(x => x.pathId === pathId)
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
                const {httpMethod} = requestDescriptor
                const responsesForRequest = Object.values(responses).filter((response) => response.responseDescriptor.requestId === requestId)
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
                {methodLinks}
                <Divider style={{marginTop: 15, marginBottom: 15}}/>
                {requestItems}
            </div>
        )
    }
}

export default withEditorContext(withRfcContext(withStyles(styles)(PathPage)))
