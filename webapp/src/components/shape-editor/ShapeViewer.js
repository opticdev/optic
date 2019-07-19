import withStyles from '@material-ui/core/styles/withStyles';
import CancelIcon from '@material-ui/icons/Cancel';
import classNames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';
import AutosizeInput from 'react-input-autosize';
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
import BasicButton from './BasicButton.js';
import {listChoicesForField, listChoicesForParameter, listChoicesForShape} from './Choices.js';
import CoreShapeViewer from './CoreShapeViewer.js';

import {coreShapeIdsSet, ShapeUtilities} from './ShapeUtilities.js';
import {primitiveColors} from './Types.js';

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

function FieldNameBase({classes, name, fieldId, renameField, mode}) {
    return (
        <AutosizeInput
            placeholder="field"
            inputClassName={classNames(classes.fieldNameInput, {[classes.disabled]: mode !== EditorModes.DESIGN})}
            defaultValue={name}
            spellCheck="false"
            onBlur={(e) => {
                renameField(fieldId, e.target.value)
            }}
        />
    )
}

const fieldNameStyles = (theme) => ({
    fieldNameInput: {
        ...theme.typography.caption,
        lineHeight: 1,
        fontSize: 12,
        padding: 2,
        fontWeight: 400,
        backgroundColor: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        '&:hover': {
            borderBottom: '1px solid black',
        },
        '&:focus': {
            borderBottom: '1px solid black',
        },
        borderBottom: '1px solid transparent'
    },
    disabled: {
        borderBottom: '1px solid transparent',
        pointerEvents: 'none',
        userSelect: 'none'
    },
})

const FieldName = withShapeEditorContext(withEditorContext(withStyles(fieldNameStyles)(FieldNameBase)))

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
        const {classes, shape, queries, onShapeSelected, removeField} = this.props;

        function ShapeNameButton({shapeName, children}) {
            return (
                <BasicButton
                    color={primitiveColors[shapeName.id] || '#8a558e'}
                    onClick={() => {
                        if (!coreShapeIdsSet.has(shapeName.id)) {
                            onShapeSelected(shapeName.id)
                        }
                    }}
                >{children}</BasicButton>
            )
        }

        function BindingInfo({bindingInfo, onShapeSelected}) {
            if (bindingInfo.binding) {
                if (bindingInfo.binding.ShapeProvider) {
                    return (
                        <BasicButton
                            onClick={() => onShapeSelected(bindingInfo.binding.ShapeProvider.shapeId)}
                        >{bindingInfo.boundName}</BasicButton>)
                }
                return <span style={{fontWeight: 'bold'}}>{bindingInfo.boundName}</span>
            }
            return <span>{bindingInfo.parameterName}</span>
        }

        function ShapeName({shapeName, onShapeSelected}) {
            if (shapeName.bindingInfo.length === 0) {
                return <ShapeNameButton shapeName={shapeName}>{shapeName.baseShapeName}</ShapeNameButton>
            }
            return (
                <ShapeNameButton shapeName={shapeName}>{shapeName.baseShapeName}[{
                    shapeName.bindingInfo.map(x => (
                        <BindingInfo bindingInfo={x} onShapeSelected={onShapeSelected}/>
                    ))
                }]</ShapeNameButton>
            )
        }

        const {shapeId, baseShapeId, name, coreShapeId, parameters, bindings, fields, isRemoved} = shape;
        const output = []
        ShapeUtilities.flatten(queries, shapeId, 0, [], output)
        console.log(output);
        const shapeDescription = output
            .map(entry => {
                const {id, type, name, shapeName, trail} = entry
                return (
                    <div className={classes.row} key={id} style={{paddingLeft: `${trail.length + 1}em`}}>
                        {type === 'field' ? (
                            <div className={classes.fieldRow}>
                                <FieldName name={name} fieldId={id}/> :
                                <ShapeName shapeName={shapeName} onShapeSelected={onShapeSelected}/>
                                <div style={{flex: 1}}></div>
                                <WriteOnly>
                                    <BasicButton className={classes.hiddenByDefault} onClick={() => removeField(id)}>
                                        <CancelIcon style={{width: 15, color: '#a6a6a6'}}/>
                                    </BasicButton>
                                </WriteOnly>
                            </div>
                        ) : (
                            <ShapeName shapeName={shapeName} onShapeSelected={onShapeSelected}/>
                        )}
                    </div>
                )
            })

        if (shapeId === coreShapeId) {
            return <CoreShapeViewer coreShapeId={coreShapeId}/>
        }


        const {cachedQueryResults} = this.props;
        //@TODO build usages projection
        const usages = Object.entries(cachedQueryResults.shapesState.fields)
            .filter(([fieldId, field]) => {
                if (field.descriptor.shapeDescriptor.FieldShapeFromShape) {
                    const shapeId = field.descriptor.shapeDescriptor.FieldShapeFromShape.shapeId
                    return shapeId === shape.shapeId
                }
            })
            .map(([fieldId, field]) => {
                const shapeId = field.descriptor.shapeId
                return {
                    shapeId,
                    fieldId
                }
            })

        return (
            <div>
                {name === '' && usages.length === 1 ? (
                    <Typography>
                        Inline Shape
                        (<BasicButton onClick={() => onShapeSelected(usages[0].shapeId)}>view usage</BasicButton>)
                    </Typography>
                ) : null}

                {shapeDescription}

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

const styles = (theme) => ({
    row: {
        height: 32,
        borderRadius: 2,
        paddingRight: 10,
        display: 'flex',
        '&:hover': {
            backgroundColor: 'rgba(78,165,255,0.08)'
        },
        '&:hover $hiddenByDefault': {
            visibility: 'visible'
        },
    },
    fieldRow: {
        display: 'flex',
        flex: 1,
        alignItems: 'center'
    },
    hiddenByDefault: {
        visibility: 'hidden'
    },
})
ShapeViewerBase.propTypes = {};
const ShapeViewer = withShapeEditorContext(withEditorContext(withRfcContext(withStyles(styles)(ShapeViewerBase))));
export default ShapeViewer