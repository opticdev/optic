import {Dialog} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Tooltip from '@material-ui/core/Tooltip';
import {EditorModes, withEditorContext} from '../../contexts/EditorContext';
import {withRfcContext} from '../../contexts/RfcContext';
import {ShapesCommands, ShapesHelper} from '../../engine';
import {routerUrls} from '../../routes.js';
import ContributionWrapper from '../contributions/ContributionWrapper.js';
import RequestPageHeader from '../requests/RequestPageHeader.js';
import CoreShapeViewer from './CoreShapeViewer.js';

const coreShapeIds = ['$string', '$number', '$boolean', '$object', '$list', '$map', '$oneOf', '$identifier', '$reference', '$any']

function listChoicesForShape(cachedQueryResults, shapeId, blacklist) {
    const {conceptsById, shapesState} = cachedQueryResults
    const coreShapeChoices = coreShapeIds.map(coreShapeId => {
        return {
            displayName: shapesState.shapes[coreShapeId].descriptor.name,
            value: coreShapeId,
            id: coreShapeId,
            valueForSetting: coreShapeId,
        }
    })
    const blacklistedShapeIds = new Set(blacklist);
    const conceptChoices = Object.entries(conceptsById)
        .filter(([conceptShapeId, shape]) => {
            const isBlacklisted = blacklistedShapeIds.has(conceptShapeId)
            return !isBlacklisted
        })
        .map(([conceptShapeId, shape]) => {
            return {
                displayName: shape.name,
                value: conceptShapeId,
                id: conceptShapeId,
                valueForSetting: conceptShapeId,
            }
        })
    return [
        ...coreShapeChoices,
        ...conceptChoices,
    ]
}

function listChoicesForParameter(cachedQueryResults, parametersAvailableForUse) {
    const {shapesState, conceptsById} = cachedQueryResults
    const coreShapeChoices = coreShapeIds.map(coreShapeId => {
        return {
            displayName: shapesState.shapes[coreShapeId].descriptor.name,
            id: coreShapeId,
            value: {ShapeProvider: {shapeId: coreShapeId}},
            valueForSetting: ShapesCommands.ShapeProvider(coreShapeId)
        }
    })
    const parameterChoices = parametersAvailableForUse.map(availableParameter => {
        const parameter = shapesState.shapeParameters[availableParameter.shapeParameterId]
        const shape = shapesState.shapes[parameter.descriptor.shapeId]
        return {
            displayName: `${shape.descriptor.name}.${availableParameter.name}`,
            id: availableParameter.shapeParameterId,
            value: {ParameterProvider: {shapeParameterId: availableParameter.shapeParameterId}},
            valueForSetting: ShapesCommands.ParameterProvider(availableParameter.shapeParameterId)
        }
    })
    const conceptChoices = Object.entries(conceptsById)
        .map(([conceptShapeId, shape]) => {
            return {
                displayName: shape.name,
                id: conceptShapeId,
                value: {ShapeProvider: {shapeId: conceptShapeId}},
                valueForSetting: ShapesCommands.ShapeProvider(conceptShapeId)
            }
        })
    return [
        ...coreShapeChoices,
        ...parameterChoices,
        ...conceptChoices
    ]
}

function listChoicesForField(cachedQueryResults, fieldId, parametersAvailableForUse) {
    const {shapesState, conceptsById} = cachedQueryResults
    const coreShapeChoices = coreShapeIds.map(coreShapeId => {
        return {
            displayName: shapesState.shapes[coreShapeId].descriptor.name,
            id: coreShapeId,
            value: {FieldShapeFromShape: {fieldId, shapeId: coreShapeId}},
            valueForSetting: ShapesCommands.FieldShapeFromShape(fieldId, coreShapeId)
        }
    })
    const parameterChoices = parametersAvailableForUse.map(availableParameter => {
        const parameter = shapesState.shapeParameters[availableParameter.shapeParameterId]
        const shape = shapesState.shapes[parameter.descriptor.shapeId]
        return {
            displayName: `${shape.descriptor.name}.${availableParameter.name}`,
            id: availableParameter.shapeParameterId,
            value: {FieldShapeFromParameter: {fieldId, shapeParameterId: availableParameter.shapeParameterId}},
            valueForSetting: ShapesCommands.FieldShapeFromParameter(fieldId, availableParameter.shapeParameterId)
        }
    })
    const conceptChoices = Object.entries(conceptsById)
        .map(([conceptShapeId, shape]) => {
            return {
                displayName: shape.name,
                id: conceptShapeId,
                value: {FieldShapeFromShape: {fieldId, shapeId: conceptShapeId}},
                valueForSetting: ShapesCommands.FieldShapeFromShape(fieldId, conceptShapeId)
            }
        })
    return [
        ...coreShapeChoices,
        ...parameterChoices,
        ...conceptChoices
    ]
}

function ShapeChanger({onOpenSelectionModal, cachedQueryResults, blacklist, shapeId, baseShapeId, onChange}) {
    const choices = listChoicesForShape(cachedQueryResults, shapeId, blacklist)
    return (
        <div>
            Change to:
            {choices
                .map(({id, displayName, value, valueForSetting}) => {
                    const isDisabled = value === baseShapeId || value === shapeId

                    return (
                        <button
                            key={id}
                            disabled={isDisabled}
                            onClick={() => onChange(valueForSetting)}>{displayName}</button>
                    )
                })}


            <Button
                onClick={() => onOpenSelectionModal(choices, (choice) => onChange(choice.valueForSetting))}
            >&hellip;</Button>
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

function doShapeProvidersMatch(descriptor1, descriptor2) {
    if (!descriptor1 || !descriptor2) {
        return false
    }
    if (descriptor1.ShapeProvider && descriptor2.ShapeProvider) {
        return descriptor1.ShapeProvider.shapeId === descriptor2.ShapeProvider.shapeId
    } else if (descriptor1.ParameterProvider && descriptor2.ParameterProvider) {
        return descriptor1.ParameterProvider.shapeParameterId === descriptor2.ParameterProvider.shapeParameterId
    }
    return false
}

function ParameterShapeChanger({onOpenSelectionModal, cachedQueryResults, onChange, parameter, parametersAvailableForUse, shapeProvider}) {
    const {shapesState} = cachedQueryResults
    const providerDescription = getProviderDescription(shapesState, shapeProvider)
    const choices = listChoicesForParameter(cachedQueryResults, parametersAvailableForUse)

    return (
        <div>
            <TooltipWrapper widget={
                <div>
                    {choices.map(choice => {
                        const isDisabled = doShapeProvidersMatch(shapeProvider, choice.value)
                        return (
                            <Button
                                key={choice.id}
                                disabled={isDisabled}
                                onClick={() => onChange(choice.valueForSetting)}
                            >{choice.displayName}</Button>
                        )
                    })}
                    <Button
                        onClick={() => onOpenSelectionModal(choices, (choice) => onChange(choice.valueForSetting))}
                    >&hellip;</Button>
                </div>
            }>
                <Typography>{parameter.name} ({providerDescription})</Typography>
            </TooltipWrapper>
        </div>
    )
}

function FieldShapeChanger({fieldId, parentParameters, onOpenSelectionModal, cachedQueryResults, fieldShapeDescriptor, onChange, onRemove}) {

    const choices = listChoicesForField(cachedQueryResults, fieldId, parentParameters)
    return (
        <div>
            <div>
                Change to:
                {choices.map(choice => {
                    const isDisabled = doShapeDescriptorsMatch(fieldShapeDescriptor, choice.value)
                    return (
                        <Button
                            key={choice.id}
                            disabled={isDisabled}
                            onClick={() => onChange(choice.valueForSetting)}
                        >{choice.displayName}</Button>
                    )
                })}
            </div>
            <div>
                <Button
                    onClick={() => onOpenSelectionModal(choices, (choice) => onChange(choice.valueForSetting))}
                >&hellip;</Button>
                <Button onClick={() => onRemove(fieldId)}>&times;</Button>
            </div>
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

function WriteOnlyBase({mode, children}) {
    if (mode === EditorModes.DESIGN) {
        return children
    }
    return null
}

export const WriteOnly = withEditorContext(WriteOnlyBase)
const useStyles = makeStyles(theme => ({
    maxWidth: {
        maxWidth: '100%',
        margin: 0
    },
    // this is to make the popover sit on top of its anchor
    noTransform: {
        transform: 'none !important',
        zIndex: 999
    }
}));

function TooltipWrapper({children, widget}) {
    const [open, setOpen] = React.useState(false);
    const classes = useStyles();


    function handleTooltipClose() {
        setOpen(false);
    }

    function handleTooltipOpen() {
        setOpen(true);
    }

    return (
        <ClickAwayListener onClickAway={handleTooltipClose}>
            <div style={{position: 'relative'}}>
                <Tooltip
                    classes={{
                        tooltip: classes.maxWidth
                    }}
                    PopperProps={{
                        disablePortal: true,
                        className: classes.noTransform
                    }}
                    onClose={handleTooltipClose}
                    open={open}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    interactive
                    title={widget}
                    placement="left-start"
                >
                    <div onClick={handleTooltipOpen}>{children}</div>
                </Tooltip>
            </div>
        </ClickAwayListener>
    )
}

function ObjectFieldsViewer({onOpenSelectionModal, queries, parentShapeId, removeField, setFieldShape, setShapeParameterInField, fields, cachedQueryResults}) {
    const parent = queries.shapeById(parentShapeId)
    const {shapesState} = cachedQueryResults
    const fieldComponents = fields
        .filter(field => !field.isRemoved)
        .map(field => {
            const {fieldId, name, bindings, fieldShapeDescriptor} = field;
            const fieldDescription = getFieldDescription(shapesState, fieldShapeDescriptor)
            const availableParameters = getFieldParameters(queries, fieldShapeDescriptor)
            const parameterComponents = availableParameters
                .map(parameter => {
                    const shapeProvider = bindings[parameter.shapeParameterId]
                    return (
                        <ParameterShapeChanger
                            key={parameter.shapeParameterId}
                            cachedQueryResults={cachedQueryResults}
                            parameter={parameter}
                            shapeProvider={shapeProvider}
                            parametersAvailableForUse={parent.parameters}
                            onOpenSelectionModal={onOpenSelectionModal}
                            onChange={(shapeProvider) => setShapeParameterInField(fieldId, shapeProvider, parameter.shapeParameterId)}/>
                    )
                })
            return (
                <div key={fieldId}>
                    <TooltipWrapper widget={
                        <FieldShapeChanger
                            fieldId={fieldId}
                            onChange={(fieldShapeDescriptor) => setFieldShape(fieldShapeDescriptor)}
                            onRemove={(fieldId) => removeField(fieldId)}
                            queries={queries}
                            onOpenSelectionModal={onOpenSelectionModal}
                            fieldShapeDescriptor={fieldShapeDescriptor}
                            parentParameters={parent.parameters}
                            cachedQueryResults={cachedQueryResults}
                        />
                    }>
                        <Typography><FieldName name={name}/> : {fieldDescription}</Typography>
                    </TooltipWrapper>
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

function Join({children, delimiter}) {
    return React.Children.toArray(children).reduce((acc, child) => {
        return acc.length === 0 ? [child] : [...acc, delimiter, child]
    }, [])
}

function ParameterListViewerBase({cachedQueryResults, parameters}) {
    if (parameters.length === 0) {
        return null
    }
    const parameterComponents = parameters
        .filter(parameter => !parameter.isRemoved)
        .map(parameter => {
            return (
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <Typography>{parameter.name}</Typography>
                    <ContributionWrapper
                        value={parameter.name}
                        defaultText={''}
                        variant="inline"
                        cachedQueryResults={cachedQueryResults}
                        contributionKey="description"
                        contributionParentId={parameter.shapeParameterId}
                    />
                </div>
            )
        })
    return (
        <div>
            {parameterComponents}
        </div>
    )
}

const ParameterListViewer = withRfcContext(ParameterListViewerBase)

function ParameterListManager({cachedQueryResults, parameters, onAdd, onRemove}) {
    const parameterComponents = parameters
        .filter(parameter => !parameter.isRemoved)
        .map(parameter => {
            return (
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <div>{parameter.name}</div>
                    <ContributionWrapper
                        value={parameter.name}
                        defaultText={''}
                        variant="inline"
                        cachedQueryResults={cachedQueryResults}
                        contributionKey="description"
                        contributionParentId={parameter.shapeParameterId}
                    />
                    <WriteOnly><Button onClick={() => onRemove(parameter.shapeParameterId)}>&times;</Button></WriteOnly>
                </div>
            )
        })
    return (
        <div>
            <RequestPageHeader forType={'Parameter'} addAction={onAdd}/>
            {parameterComponents.length === 0 ? <Typography>No Parameters</Typography> : parameterComponents}
        </div>
    )
}

let i = 1;
let t = 1;

function ShapeLinkBase({baseUrl, shape}) {
    return (
        <Link style={{textDecoration: 'none'}} to={routerUrls.conceptPage(baseUrl, shape.shapeId)}>{shape.name}</Link>
    )
}

const ShapeLink = withEditorContext(ShapeLinkBase)

class ShapeViewerBase extends React.Component {

    state = {
        selectionModal: {
            open: false
        }
    }
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

    handleOpenSelectionModal = (choices, onSelect) => {
        this.setState({
            selectionModal: {
                open: true,
                choices,
                onSelect
            }
        })
    }

    handleCloseSelectionModal = () => {
        this.setState({
            selectionModal: {
                open: false
            }
        })
    }

    render() {
        const {shape, queries, cachedQueryResults} = this.props;
        const {shapeId, baseShapeId, name, coreShapeId, parameters, bindings, fields, isRemoved} = shape;

        if (shapeId === coreShapeId) {
            return <CoreShapeViewer coreShapeId={coreShapeId}/>
        }
        const canAddParameters = baseShapeId === '$object'
        const canAddFields = baseShapeId === '$object'
        console.log({baseShapeId})
        const baseShape = queries.shapeById(baseShapeId)
        return (
            <div>
                {canAddParameters ? (
                    <React.Fragment>
                        <ParameterListManager
                            parameters={parameters}
                            onAdd={this.addParameter}
                            onRemove={this.removeShapeParameter}
                        />
                    </React.Fragment>
                ) : null}
                <TooltipWrapper widget={
                    <ShapeChanger
                        cachedQueryResults={cachedQueryResults}
                        blacklist={[shapeId, baseShapeId]}
                        shapeId={shapeId}
                        baseShapeId={baseShapeId}
                        onOpenSelectionModal={this.handleOpenSelectionModal}
                        onChange={(newShapeId) => this.setBaseShape(shapeId, newShapeId)}
                    />
                }>
                    {name ? (
                        <Typography>{name}: <ShapeLink shape={baseShape}/></Typography>
                    ) : (
                        <Typography><ShapeLink shape={baseShape}/></Typography>
                    )}
                </TooltipWrapper>
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
                            onOpenSelectionModal={this.handleOpenSelectionModal}
                            onChange={(shapeProvider) => this.setShapeParameterInShape(shapeId, shapeProvider, parentParameter.shapeParameterId)}
                        />
                    )
                })}
                {canAddFields ? (
                    <div>
                        <RequestPageHeader forType="Field" addAction={this.addField}/>

                        <ObjectFieldsViewer
                            parentShapeId={shapeId}
                            cachedQueryResults={cachedQueryResults}
                            queries={queries}
                            fields={fields}
                            removeField={this.removeField}
                            onOpenSelectionModal={this.handleOpenSelectionModal}
                            setShapeParameterInField={(fieldId, shapeProvider, shapeParameterId) => this.setShapeParameterInField(fieldId, shapeProvider, shapeParameterId)}
                            setFieldShape={this.setFieldShape}/>
                    </div>
                ) : null}

                {this.renderSelectionModal()}
            </div>
        );
    }

    setSelectedItem(choice) {
        this.setState({
            selectionModal: {
                ...this.state.selectionModal,
                selectedItem: choice
            },
        })
    }

    renderSelectionModal() {
        const {selectionModal} = this.state;
        const {
            choices = [],
            onSelect = () => {
            },
            selectedItem = null
        } = selectionModal

        const {cachedQueryResults, queries} = this.props
        const {shapesState} = cachedQueryResults
        const selectedShape = selectedItem && shapesState.shapes[selectedItem.id] ? queries.shapeById(selectedItem.id) : null
        return (
            <Dialog open={selectionModal.open} onClose={this.handleCloseSelectionModal}>
                <DialogTitle>Choose a Shape</DialogTitle>
                <DialogContent>
                    <DialogContentText>{
                        choices
                            .map(choice => {
                                return (
                                    <Button
                                        disabled={selectedItem && (choice.id === selectedItem.id)}
                                        onClick={() => this.setSelectedItem(choice)}
                                    >{choice.displayName}</Button>
                                )
                            })
                    }</DialogContentText>
                    {selectedShape && <ShapeViewer shape={selectedShape}/>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleCloseSelectionModal}>Cancel</Button>
                    <Button disabled={!selectedItem} onClick={() => {
                        onSelect(selectedItem)
                        this.handleCloseSelectionModal()
                    }}>Select</Button>
                </DialogActions>
            </Dialog>
        )
    }
}

ShapeViewerBase.propTypes = {};
const ShapeViewer = withEditorContext(withRfcContext(ShapeViewerBase));
export default ShapeViewer