import {Select} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import {withRouter} from 'react-router-dom';
import {withEditorContext} from '../../contexts/EditorContext.js';
import {withRfcContext} from '../../contexts/RfcContext.js';
import {RequestsHelper, RequestsCommands} from '../../engine';
import {routerUrls} from '../../routes.js';
import {asNormalizedAbsolutePath, asPathTrailComponents} from '../utilities/PathUtilities.js';
import PathInput, {cleanupPathComponentName} from './PathInput.js';

const rootPathComponent = [];

export function normalizePath(pathComponents) {
    return '/' + pathComponents.map(x => x.isParameter ? '{}' : x.name).join('/')
}

export function prefixes(pathComponents) {
    return pathComponents
        .reduce((acc, pathComponent) => {
            return [
                ...acc,
                [...(lastOrElse(acc, [])), pathComponent]
            ]
        }, [rootPathComponent])
}

export function resolvePath(pathComponents, pathsById) {
    const normalizedPathMap = Object.entries(pathsById)
        .reduce((acc, [pathId, pathComponent]) => {
            const normalizedAbsolutePath = asNormalizedAbsolutePath(asPathTrailComponents(pathId, pathsById))
            acc[normalizedAbsolutePath] = pathComponent
            return acc
        }, {})
    const pathPrefixes = prefixes(pathComponents).reverse()
    // should be guaranteed to have a match of at least [] => '/' (root)
    const lastMatchComponents = pathPrefixes
        .find((pathComponentPrefix) => {
            const normalized = normalizePath(pathComponentPrefix)
            const match = normalizedPathMap[normalized]
            return !!match
        })


    const normalized = normalizePath(lastMatchComponents)
    const lastMatch = normalizedPathMap[normalized]

    const lengthDifference = pathComponents.length - lastMatchComponents.length;
    const toAdd = lengthDifference <= 0 ? [] : pathComponents.slice(-1 * lengthDifference)
    return {
        lastMatch,
        toAdd
    }
}

function lastOrElse(array, defaultValue) {
    const length = array.length;
    return length === 0 ? defaultValue : array[length - 1]
}

class PathEditor extends React.Component {
    state = {
        methods: [],
        pathComponents: null
    }
    handleSubmit = () => {
        const {pathComponents, methods} = this.state;
        const {onSubmit, basePath, history, handleCommand, cachedQueryResults} = this.props;
        const {pathsById} = cachedQueryResults
        const {toAdd, lastMatch} = resolvePath(pathComponents, pathsById)
        debugger
        // emit commands to add any necessary paths then go to the final path
        let lastParentPathId = lastMatch.pathId
        toAdd.forEach((addition) => {
            const pathId = RequestsHelper.newId()
            const command = (addition.isParameter ? RequestsCommands.AddPathParameter : RequestsCommands.AddPathComponent)(
                pathId,
                lastParentPathId,
                cleanupPathComponentName(addition.name)
            )
            handleCommand(command)
            lastParentPathId = pathId
        })
        methods.forEach((method) => {
            const requestId = RequestsHelper.newId()
            const command = RequestsCommands.AddRequest(requestId, lastParentPathId, method)
            handleCommand(command)
        })
        onSubmit()
        // maybe this should happen in the consumer
        history.push(routerUrls.pathPage(basePath, lastParentPathId))
    }

    handleSubmitPath = ({pathComponents}) => {
        this.setState({pathComponents})
    }

    handleSubmitMethods = () => {
        this.setState({
            isReadyToSubmit: true
        })
    }

    handleMethodsChange = (e) => {
        const methods = e.target.value
        this.setState({
            methods
        })
    }

    render() {
        const {initialPathString} = this.props
        return (
            <div>
                <PathInput onSubmit={this.handleSubmitPath} initialPathString={initialPathString}/>
                {this.state.pathComponents ? (
                    <div>
                        <Select multiple onChange={this.handleMethodsChange} value={this.state.methods}>
                            {['get', 'put', 'post', 'delete'].map(method => {
                                return (
                                    <MenuItem key={method} value={method}>
                                        {/*@TODO: add useful info here*/}
                                        {method}
                                    </MenuItem>
                                )
                            })}
                        </Select>
                        <Button onClick={this.handleSubmitMethods}>continue</Button>
                    </div>
                ) : null}
                {this.state.isReadyToSubmit ? (
                    <Button onClick={this.handleSubmit}>Add Requests</Button>
                ) : null}
            </div>
        );
    }
}

export default withRouter(withEditorContext(withRfcContext(PathEditor)));