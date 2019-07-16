import {Typography} from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {withEditorContext} from '../../contexts/EditorContext.js';
import {withRfcContext} from '../../contexts/RfcContext.js';
import {ShapesCommands, ShapesHelper} from '../../engine';
import {routerUrls} from '../../routes.js';
import CoreShapeViewer from './CoreShapeViewer.js';

const coreShapeIds = ['$string', '$number', '$object', '$list', '$map', '$oneOf', '$identifier', '$reference', '$any']

function ShapeChanger({queries, cachedQueryResults, blacklist, shapeId, onChange}) {
    coreShapeIds.forEach((id) => console.log(cachedQueryResults.shapesState.shapes[id]))
    const {conceptsById} = cachedQueryResults
    const blacklistedShapeIds = new Set(blacklist);
    const conceptComponents = Object.entries(conceptsById)
        .filter(([conceptShapeId, shape]) => {
            const isBlacklisted = blacklistedShapeIds.has(conceptShapeId)
            return !isBlacklisted
        })
        .map(([conceptShapeId, shape]) => {
            const isDisabled = conceptShapeId === shapeId
            return (
                <button
                    key={conceptShapeId}
                    disabled={isDisabled}
                    onClick={() => onChange(conceptShapeId)}>{shape.name}</button>
            )
        })
    return (
        <div>
            Change to:
            {coreShapeIds
                .map(coreShapeId => {
                    const coreShape = queries.shapeById(coreShapeId)
                    const isDisabled = coreShape.shapeId === shapeId

                    return (
                        <button
                            key={coreShapeId}
                            disabled={isDisabled}
                            onClick={() => onChange(coreShapeId)}>{coreShape.name}</button>
                    )
                })}
            {conceptComponents}
        </div>
    )
}

function doShapeDescriptorsMatch(descriptor1, descriptor2) {
    // assuming fieldIds are the same or irrelevant
    if (descriptor1.FieldShapeFromShape && descriptor2.FieldShapeFromShape) {
        return descriptor1.FieldShapeFromShape.shapeId === descriptor2.FieldShapeFromShape.shapeId
    } else if (descriptor1.FieldShapeFromParameter && descriptor2.FieldShapeFromParameter) {
        return descriptor1.FieldShapeFromParameter.shapeParameterId === descriptor2.FieldShapeFromParameter.shapeParameterId
    } else {
        return false
    }
}

function FieldName({name}) {
    return <Typography variant="caption">{name}</Typography>
}

function getFieldParameters(queries, fieldShapeDescriptor) {
    if (fieldShapeDescriptor.FieldShapeFromParameter) {
        return []
    }
    if (fieldShapeDescriptor.FieldShapeFromShape) {
        const shape = queries.shapeById(fieldShapeDescriptor.FieldShapeFromShape.shapeId)
        return shape.parameters
    }
    return []
}

function getShapeParameters(queries, shapeId) {
    const shape = queries.shapeById(shapeId)
    const baseShapeParameters = shapeId === shape.baseShapeId ? [] : getShapeParameters(queries, shape.baseShapeId)
    return [...shape.parameters, ...baseShapeParameters]
}

function getProviderDescription(shapesState, shapeProvider) {
    if (!shapeProvider) {
        return null
    }
    if (shapeProvider.ShapeProvider) {
        return shapesState.shapes[shapeProvider.ShapeProvider.shapeId].descriptor.name
    } else if (shapeProvider.ParameterProvider) {
        return shapesState.shapeParameters[shapeProvider.ParameterProvider.shapeParameterId].descriptor.name
    }
    return null
}

function ParameterShapeChanger({cachedQueryResults, onChange, parameter, parametersAvailableForUse, shapeProvider}) {
    const {shapesState, conceptsById} = cachedQueryResults
    const providerDescription = getProviderDescription(shapesState, shapeProvider)
    const conceptComponents = Object.entries(conceptsById)
        .map(([conceptShapeId, shape]) => {

            return (
                <button
                    key={conceptShapeId}
                    onClick={() => onChange(ShapesCommands.ShapeProvider(conceptShapeId))}>{shape.name}</button>
            )
        })

    return (
        <div>
            <Tooltip interactive title={
                <React.Fragment>
                    {coreShapeIds.map(coreShapeId => {
                        return (
                            <button
                                key={coreShapeId}
                                onClick={() => onChange(ShapesCommands.ShapeProvider(coreShapeId))}
                            >{shapesState.shapes[coreShapeId].descriptor.name}</button>
                        )
                    })}
                    {parametersAvailableForUse.map(availableParameter => {
                        return (
                            <button
                                key={availableParameter.shapeParameterId}
                                onClick={() => onChange(ShapesCommands.ParameterProvider(availableParameter.shapeParameterId))}
                            >set parameter type to {availableParameter.name}
                            </button>
                        )
                    })}
                    {conceptComponents}
                </React.Fragment>
            } placement="top-start">
                <Typography>{parameter.name} ({providerDescription})</Typography>
            </Tooltip>
        </div>
    )
}

function FieldShapeChanger({queries, fieldId, parentParameters, cachedQueryResults, fieldShapeDescriptor, onChange}) {
    const {conceptsById} = cachedQueryResults
    const conceptComponents = Object.entries(conceptsById)
        .map(([conceptShapeId, shape]) => {
            const isDisabled = doShapeDescriptorsMatch({
                FieldShapeFromShape: {fieldId, shapeId: conceptShapeId}
            }, fieldShapeDescriptor)
            return (
                <button
                    key={conceptShapeId}
                    disabled={isDisabled}
                    onClick={() => onChange(ShapesCommands.FieldShapeFromShape(fieldId, conceptShapeId))}>{shape.name}</button>
            )
        })
    const parentParameterComponents = parentParameters
        .map(parentParameter => {
            const isDisabled = doShapeDescriptorsMatch({
                FieldShapeFromParameter: {
                    fieldId,
                    shapeParameterId: parentParameter.shapeParameterId
                }
            }, fieldShapeDescriptor)
            return (
                <button
                    key={parentParameter.shapeParameterId}
                    disabled={isDisabled}
                    onClick={() => onChange(ShapesCommands.FieldShapeFromParameter(fieldId, parentParameter.shapeParameterId))}
                >{parentParameter.name}</button>
            )
        })
    return (
        <div>
            Change to:
            {coreShapeIds.map(coreShapeId => {
                const coreShape = queries.shapeById(coreShapeId)
                const isDisabled = doShapeDescriptorsMatch({
                    FieldShapeFromShape: {fieldId, shapeId: coreShapeId}
                }, fieldShapeDescriptor)
                return (
                    <button
                        key={coreShapeId}
                        disabled={isDisabled}
                        onClick={() => onChange(ShapesCommands.FieldShapeFromShape(fieldId, coreShapeId))}
                    >{coreShape.name}</button>
                )
            })}
            {conceptComponents}
            {parentParameterComponents}
        </div>
    )
}

function getFieldDescription(shapesState, fieldShapeDescriptor) {
    if (!fieldShapeDescriptor) {
        return null
    }
    if (fieldShapeDescriptor.FieldShapeFromShape) {
        return shapesState.shapes[fieldShapeDescriptor.FieldShapeFromShape.shapeId].descriptor.name
    } else if (fieldShapeDescriptor.FieldShapeFromParameter) {
        return shapesState.shapeParameters[fieldShapeDescriptor.FieldShapeFromParameter.shapeParameterId].descriptor.name
    }
}

function ObjectFieldsViewer({queries, parentShapeId, setFieldShape, setShapeParameterInField, fields, cachedQueryResults}) {
    const parent = queries.shapeById(parentShapeId)
    const {shapesState} = cachedQueryResults
    const fieldComponents = fields
        .map(field => {
            const {fieldId, name, bindings, fieldShapeDescriptor} = field;
            const fieldDescription = getFieldDescription(shapesState, fieldShapeDescriptor)
            const availableParameters = getFieldParameters(queries, fieldShapeDescriptor)
            const parameterComponents = availableParameters
                .map(parameter => {
                    const shapeProvider = bindings[parameter.shapeParameterId]
                    return (
                        <ParameterShapeChanger
                            cachedQueryResults={cachedQueryResults}
                            parameter={parameter}
                            shapeProvider={shapeProvider}
                            parametersAvailableForUse={parent.parameters}
                            onChange={(shapeProvider) => setShapeParameterInField(fieldId, shapeProvider, parameter.shapeParameterId)}/>
                    )
                })
            return (
                <div key={fieldId}>
                    <Tooltip disableHoverListener interactive title={
                        <FieldShapeChanger
                            fieldId={fieldId}
                            onChange={(fieldShapeDescriptor) => setFieldShape(fieldShapeDescriptor)}
                            queries={queries}
                            fieldShapeDescriptor={fieldShapeDescriptor}
                            parentParameters={parent.parameters}
                            cachedQueryResults={cachedQueryResults}
                        />
                    } placement="top-start">
                        <Typography><FieldName name={name}/> : {fieldDescription}</Typography>
                    </Tooltip>
                    {parameterComponents}

                </div>
            )
        })

    return (
        <div>
            {fieldComponents}
        </div>
    )
}

class ParameterListViewer extends React.Component {
    render() {
        const {parameters} = this.props;
        const parameterComponents = parameters
            .map(parameter => {
                return (
                    <span>{parameter.name}</span>
                )
            })
        return (
            <div>
                [{parameterComponents}]
            </div>
        )
    }
}

let i = 1;
let t = 1;

function ShapeLinkBase({baseUrl, shape}) {
    return (
        <Link to={routerUrls.conceptPage(baseUrl, shape.shapeId)}>{shape.name}</Link>
    )
}

const ShapeLink = withEditorContext(ShapeLinkBase)

class ShapeViewer extends React.Component {
    addField = () => {
        const {handleCommand, shape} = this.props;
        const fieldId = ShapesHelper.newFieldId()
        const fieldShapeDescriptor = ShapesCommands.FieldShapeFromShape(fieldId, '$string')
        const command = ShapesCommands.AddField(fieldId, shape.shapeId, `f${i++}`, fieldShapeDescriptor)
        handleCommand(command)
    }

    addParameter = () => {
        const {handleCommand, shape} = this.props;
        const shapeParameterId = ShapesHelper.newShapeParameterId()
        const command = ShapesCommands.AddShapeParameter(shapeParameterId, shape.shapeId, `T${t++}`)
        handleCommand(command)
    }

    setFieldShape = (fieldShapeDescriptor) => {
        const {handleCommand} = this.props;
        const command = ShapesCommands.SetFieldShape(fieldShapeDescriptor)
        handleCommand(command)
    }

    setShapeParameterInField = (fieldId, shapeProvider, shapeParameterId) => {
        const {handleCommand} = this.props;
        const command = ShapesCommands.SetParameterShape(ShapesCommands.ProviderInField(fieldId, shapeProvider, shapeParameterId))
        handleCommand(command)
    }

    setShapeParameterInShape = (shapeId, shapeProvider, shapeParameterId) => {
        const {handleCommand} = this.props;
        const command = ShapesCommands.SetParameterShape(ShapesCommands.ProviderInShape(shapeId, shapeProvider, shapeParameterId))
        handleCommand(command)
    }

    setBaseShape = (shapeId, baseShapeId) => {
        const {handleCommand} = this.props;
        const command = ShapesCommands.SetBaseShape(shapeId, baseShapeId)
        handleCommand(command)
    }

    removeShape = (shapeId) => {
        const {handleCommand} = this.props;
        const command = ShapesCommands.RemoveShape(shapeId)
        handleCommand(command)
    }

    removeField = (fieldId) => {
        const {handleCommand} = this.props;
        const command = ShapesCommands.RemoveField(fieldId)
        handleCommand(command)
    }

    removeShapeParameter = (shapeParameterId) => {
        const {handleCommand} = this.props;
        const command = ShapesCommands.RemoveShapeParameter(shapeParameterId)
        handleCommand(command)
    }

    render() {
        const {baseUrl, shape, queries, cachedQueryResults} = this.props;
        const {shapeId, baseShapeId, name, coreShapeId, parameters, bindings, fields, isRemoved} = shape;
        if (shapeId === coreShapeId) {
            return <CoreShapeViewer coreShapeId={coreShapeId}/>
        }
        const baseShape = queries.shapeById(baseShapeId)
        return (
            <div>
                <Tooltip interactive title={
                    <ShapeChanger
                        onChange={(newShapeId) => this.setBaseShape(shapeId, newShapeId)}
                        cachedQueryResults={cachedQueryResults}
                        queries={queries}
                        blacklist={[shapeId, baseShapeId]}
                        shapeId={shapeId}
                    />
                } placement="top-start">
                    <Typography>{name}: <ShapeLink shape={baseShape}/></Typography>
                </Tooltip>
                <ParameterListViewer parameters={baseShape.parameters}/>
                {baseShape.parameters.map(parentParameter => {
                    const boundShapeId = bindings[parentParameter.shapeParameterId];
                    const shapeProvider = boundShapeId ? ({ShapeProvider: {shapeId: boundShapeId}}) : null
                    return (
                        <ParameterShapeChanger
                            cachedQueryResults={cachedQueryResults}
                            parameter={parentParameter}
                            shapeProvider={shapeProvider}
                            parametersAvailableForUse={parameters}
                            onChange={(shapeProvider) => this.setShapeParameterInShape(shapeId, shapeProvider, parentParameter.shapeParameterId)}
                        />
                    )
                })}
                {baseShapeId === '$object' ? (
                    <div>
                        <button onClick={this.addParameter}> + add parameter</button>
                        <ParameterListViewer parameters={parameters}/>


                        <button onClick={this.addField}> + add field</button>

                        <ObjectFieldsViewer
                            parentShapeId={shapeId}
                            cachedQueryResults={cachedQueryResults}
                            queries={queries}
                            fields={fields}
                            setShapeParameterInField={(fieldId, shapeProvider, shapeParameterId) => this.setShapeParameterInField(fieldId, shapeProvider, shapeParameterId)}
                            setFieldShape={this.setFieldShape}/>
                    </div>
                ) : null}
            </div>
        );
    }
}

ShapeViewer.propTypes = {};

export default withEditorContext(withRfcContext(ShapeViewer));