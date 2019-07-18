import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {Dialog} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Tooltip from '@material-ui/core/Tooltip';
import {EditorModes, withEditorContext} from '../../contexts/EditorContext';
import {GenericContextFactory} from '../../contexts/GenericContextFactory.js';
import {withRfcContext} from '../../contexts/RfcContext';
import {withShapeEditorContext} from '../../contexts/ShapeEditorContext.js';
import {routerUrls} from '../../routes.js';
import ContributionWrapper from '../contributions/ContributionWrapper.js';
import RequestPageHeader from '../requests/RequestPageHeader.js';
import {listChoicesForField, listChoicesForParameter, listChoicesForShape} from './Choices.js';
import CoreShapeViewer from './CoreShapeViewer.js';
import {ShapeUtilities} from './ShapeUtilities.js';

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
    const providerDescription = '';//getProviderDescription(shapesState, shapeProvider)
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

function getFieldDescription(queries, shapesState, fieldShapeDescriptor) {
    console.log({fieldShapeDescriptor})
    if (!fieldShapeDescriptor) {
        return null
    }
    if (fieldShapeDescriptor.FieldShapeFromShape) {
        const shape = queries.shapeById(fieldShapeDescriptor.FieldShapeFromShape.shapeId)
        const name = shape.name
        if (!name) {
            return queries.shapeById(shape.baseShapeId).name
        }
        return name
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

function FieldLinkBase({queries, baseUrl, field, children}) {
    if (field.fieldShapeDescriptor.FieldShapeFromShape) {
        const shapeId = field.fieldShapeDescriptor.FieldShapeFromShape.shapeId
        const shape = queries.shapeById(shapeId)
        return <Link to={routerUrls.conceptPage(baseUrl, shape.name ? shapeId : shape.baseShapeId)}>{children}</Link>
    }
    return children
}

const FieldLink = withRfcContext(withEditorContext(FieldLinkBase))

const {
    Context: DepthContext,
    withContext: withDepthContext
} = GenericContextFactory({depth: 0})

function ObjectFieldsViewerBase({onOpenSelectionModal, queries, parentShapeId, removeField, renameField, setFieldShape, setShapeParameterInField, fields, cachedQueryResults}) {

    const parent = queries.shapeById(parentShapeId)
    const {shapesState} = cachedQueryResults
    const fieldComponents = fields
        .filter(field => !field.isRemoved)
        .map(field => {
            const {fieldId, name, bindings, fieldShapeDescriptor} = field;
            const fieldDescription = getFieldDescription(queries, shapesState, fieldShapeDescriptor)
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
                        <Typography>
                            <FieldName name={name} onChange={(name) => renameField(fieldId, name)}/> :
                            <FieldLink field={field}>{fieldDescription}</FieldLink>
                        </Typography>
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

const ObjectFieldsViewer = withShapeEditorContext(ObjectFieldsViewerBase);

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
        const output = []
        ShapeUtilities.flatten(cachedQueryResults, queries, shapeId, 0, output)
        console.log(output);
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
                            onAdd={() => this.props.addParameter(shapeId)}
                            onRemove={this.props.removeShapeParameter}
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
                            onChange={(shapeProvider) => this.props.setShapeParameterInShape(shapeId, shapeProvider, parentParameter.shapeParameterId)}
                        />
                    )
                })}
                {canAddFields ? (
                    <div>
                        <RequestPageHeader forType="Field" addAction={() => this.props.addField(shapeId)}/>

                        <ObjectFieldsViewer
                            parentShapeId={shapeId}
                            fields={fields}
                            onOpenSelectionModal={this.handleOpenSelectionModal}
                        />
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
const ShapeViewer = withShapeEditorContext(withEditorContext(withRfcContext(ShapeViewerBase)));
export default ShapeViewer