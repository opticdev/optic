import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import makeStyles from '@material-ui/core/styles/makeStyles';
import withStyles from '@material-ui/core/styles/withStyles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import CancelIcon from '@material-ui/icons/Cancel';
import ExpandLessIcon from '@material-ui/icons/ExpandMore'
import ExpandMoreIcon from '@material-ui/icons/KeyboardArrowRight'
import React from 'react';
import {EditorModes, withEditorContext} from '../../contexts/EditorContext';
import {withExpansionContext} from '../../contexts/ExpansionContext.js';
import {withRfcContext} from '../../contexts/RfcContext';
import {withShapeEditorContext} from '../../contexts/ShapeEditorContext.js';
import BasicButton from './BasicButton.js';
import {
    listConceptChoicesForField,
    listConceptChoicesForParameter,
    listConceptChoicesForShape,
    listCoreShapeChoicesForField,
    listCoreShapeChoicesForParameter,
    listCoreShapeChoicesForShape,
    listParameterChoicesForField,
    listParameterChoicesForParameter,
} from './Choices.js';
import ConceptModal from './ConceptModal.js';
import CoreShapeViewer from './CoreShapeViewer.js';
import {FieldName} from './NameInputs.js';
import {ShapeUtilities} from './ShapeUtilities.js';
import {boundParameterColor, unboundParameterColor} from './Types.js';

export function cheapEquals(item1, item2) {
    return JSON.stringify(item1) === JSON.stringify(item2)
}

const buttonStyle = {paddingLeft: '.25em', paddingRight: '.25em'}

function Chooser({choices, parameterChoices, setShouldShowConceptModal, onSelect}) {
    const [shouldShowParameterChoices, setShouldShowParameterChoices] = React.useState(false)

    const list = shouldShowParameterChoices ? parameterChoices : choices
    return (
        <div>
            <div style={{display: 'flex'}}>
                <div>Change to:</div>
                {list
                    .map(choice => {
                        const {id, displayName, color} = choice
                        return (
                            <div key={id} style={buttonStyle}>
                                <BasicButton
                                    style={{
                                        color
                                    }}
                                    onClick={() => {
                                        onSelect(choice)
                                    }}>{displayName}</BasicButton>
                            </div>
                        )
                    })
                }
                <div style={{flex: 1}}>&nbsp;</div>
                <div>
                    {!shouldShowParameterChoices && parameterChoices.length > 0 ? (
                        <BasicButton
                            style={buttonStyle}
                            onClick={() => setShouldShowParameterChoices(true)}>Choose Parameter</BasicButton>
                    ) : null}
                    {shouldShowParameterChoices && parameterChoices.length > 0 ? (
                        <BasicButton
                            style={buttonStyle}
                            onClick={() => setShouldShowParameterChoices(false)}>Choose Shape</BasicButton>
                    ) : null}
                    <BasicButton
                        style={buttonStyle}
                        onClick={() => setShouldShowConceptModal(true)}
                    >Choose Concept</BasicButton>
                </div>
            </div>
        </div>
    )
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
        height: 32,
        lineHeight: '32px',
        margin: 0,
        borderBottom: '1px solid rgba(78,165,255,0.4)',
        backgroundColor: 'rgb(231,239,247)',
        color: '#666'
    },
    // this is to make the popover sit on top of its anchor
    noTransform: {
        width: '100%',
        transform: 'none !important',
        overflow: 'hidden',
        overflowX: 'auto',
        zIndex: 999
    }
}));

function ShapeLinksBase({shapeId, contextString, switchEditorMode, isShapeEditorReadOnly, onShapeSelected}) {
    return (
        <div style={{display: 'flex', height: '100%', alignItems: 'center'}}>
            {contextString}
            <BasicButton
                onClick={() => onShapeSelected(shapeId)}
                style={buttonStyle}
            >Go to Definition</BasicButton>
            {!isShapeEditorReadOnly && (
                <BasicButton
                    onClick={() => switchEditorMode(EditorModes.DESIGN)}
                    style={buttonStyle}
                >Change Shape</BasicButton>
            )}
        </div>
    )
}

const ShapeLinks = withShapeEditorContext(withEditorContext(ShapeLinksBase))

function TooltipWrapperBase({children, mode, queries, cachedQueryResults}) {
    const [launchContext, setLaunchContext] = React.useState(null)
    const [open, setOpen] = React.useState(false);
    const [shouldShowConceptModal, setShouldShowConceptModal] = React.useState(false)
    const [selectedItem, setSelectedItem] = React.useState(null)

    const classes = useStyles();

    function handleTooltipClose() {
        setOpen(false);
    }

    function handleTooltipOpen(launchContext) {
        setLaunchContext(launchContext)
        setOpen(true);
    }

    let widget = null;
    let conceptChoices = []
    let onSelect = () => {
    }
    if (launchContext) {

        switch (launchContext.type) {
            case 'field':
                const {fieldId, parentShapeId, setFieldShape} = launchContext.data
                const parentShape = queries.shapeById(parentShapeId)
                const field = parentShape.fields.find(x => x.fieldId === fieldId)
                if (mode === EditorModes.DOCUMENTATION) {
                    if (field.fieldShapeDescriptor.FieldShapeFromShape) {
                        const shapeId = field.fieldShapeDescriptor.FieldShapeFromShape.shapeId
                        const shape = cachedQueryResults.shapesState.shapes[shapeId]
                        widget =
                            <ShapeLinks shapeId={shapeId} contextString={`${field.name}: ${shape.descriptor.name}`}/>

                    } else if (field.fieldShapeDescriptor.FieldShapeFromParameter) {
                        const shapeParameterId = field.fieldShapeDescriptor.FieldShapeFromParameter.shapeParameterId
                        const parameter = cachedQueryResults.shapesState.shapeParameters[shapeParameterId]
                        const parentShapeId = parameter.descriptor.shapeId
                        const parentShape = cachedQueryResults.shapesState.shapes[parentShapeId]

                        widget = (
                            <ShapeLinks
                                shapeId={parentShapeId}
                                contextString={`${field.name}: ${parentShape.descriptor.name}.${parameter.name}`}/>
                        )
                    }
                } else {
                    const choices = listCoreShapeChoicesForField(fieldId, cachedQueryResults.shapesState)
                    const parameterChoices = listParameterChoicesForField(fieldId, parentShape)
                    conceptChoices = listConceptChoicesForField(fieldId, cachedQueryResults.conceptsById, [])
                    onSelect = (choice) => {
                        if (!cheapEquals(field.fieldShapeDescriptor, choice.value)) {
                            setFieldShape(choice.valueForSetting)
                        }
                        handleTooltipClose()
                        setShouldShowConceptModal(false)
                    }
                    widget = (
                        <Chooser
                            setShouldShowConceptModal={setShouldShowConceptModal}
                            choices={choices}
                            parameterChoices={parameterChoices}
                            onSelect={onSelect}
                        />
                    )
                }
                break;
            case 'shape':
                const {shapeId, setBaseShape} = launchContext.data
                const shape = queries.shapeById(shapeId)
                if (mode === EditorModes.DOCUMENTATION) {
                    widget = (
                        <ShapeLinks shapeId={shape.baseShapeId} contextString={shape.name}/>
                    )
                } else {
                    const choices = listCoreShapeChoicesForShape(cachedQueryResults.shapesState)
                    const parameterChoices = []
                    conceptChoices = listConceptChoicesForShape(cachedQueryResults.conceptsById, [shapeId])
                    onSelect = (choice) => {
                        if (!cheapEquals(shape.baseShapeId, choice.value)) {
                            setBaseShape(shapeId, choice.valueForSetting)
                        }
                        handleTooltipClose()
                        setShouldShowConceptModal(false)
                    }
                    widget = (
                        <Chooser
                            setShouldShowConceptModal={setShouldShowConceptModal}
                            choices={choices}
                            parameterChoices={parameterChoices}
                            onSelect={onSelect}
                        />
                    )

                }
                break;
            case 'parameter':
                const {contextShapeId, bindingInfo, setParameterShape} = launchContext.data
                if (mode === EditorModes.DOCUMENTATION) {
                    if (!bindingInfo.binding) {
                        const parameter = cachedQueryResults.shapesState.shapeParameters[bindingInfo.parameterId]
                        const parentShape = cachedQueryResults.shapesState.shapes[parameter.descriptor.shapeId]

                        widget = (
                            <ShapeLinks
                                shapeId={parentShape.shapeId}
                                contextString={`${parentShape.descriptor.name}.${bindingInfo.parameterName}`}/>
                        )
                    } else {

                        if (bindingInfo.binding.ParameterProvider) {
                            const parameterId = bindingInfo.binding.ParameterProvider.shapeParameterId
                            const parameter = cachedQueryResults.shapesState.shapeParameters[parameterId]
                            const parentShape = cachedQueryResults.shapesState.shapes[parameter.descriptor.shapeId]
                            widget = (
                                <ShapeLinks
                                    shapeId={parentShape.shapeId}
                                    contextString={`${parentShape.descriptor.name}.${parameter.descriptor.name}`}/>
                            )
                        } else if (bindingInfo.binding.ShapeProvider) {
                            const shapeId = bindingInfo.binding.ShapeProvider.shapeId
                            const shape = cachedQueryResults.shapesState.shapes[shapeId]
                            widget = (
                                <ShapeLinks
                                    shapeId={shapeId}
                                    contextString={shape.descriptor.name}/>
                            )
                        }
                    }
                } else {
                    const parentShape = queries.shapeById(contextShapeId)

                    const choices = listCoreShapeChoicesForParameter(cachedQueryResults.shapesState)
                    const parameterChoices = listParameterChoicesForParameter(parentShape)
                    conceptChoices = listConceptChoicesForParameter(cachedQueryResults.conceptsById, [])
                    onSelect = (choice) => {
                        if (!cheapEquals(bindingInfo.binding, choice.value)) {
                            setParameterShape(choice.valueForSetting)
                        }
                        handleTooltipClose()
                        setShouldShowConceptModal(false)
                    }
                    widget = (
                        <Chooser
                            setShouldShowConceptModal={setShouldShowConceptModal}
                            choices={choices}
                            parameterChoices={parameterChoices}
                            onSelect={onSelect}
                        />
                    )
                }
                break;
        }
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
                    TransitionProps={{timeout: 0}}
                >
                    <div>{children({handleTooltipClose, handleTooltipOpen})}</div>
                </Tooltip>

                <ConceptModal
                    open={shouldShowConceptModal}
                    onClose={() => setShouldShowConceptModal(false)}
                    choices={conceptChoices}
                    setSelectedItem={setSelectedItem}
                    selectedItem={selectedItem}
                    onSelect={(choice) => onSelect(choice)}
                />
            </div>
        </ClickAwayListener>
    )
}

const TooltipWrapper = withEditorContext(withShapeEditorContext(TooltipWrapperBase))

function Join({children, delimiter}) {
    return React.Children.toArray(children).reduce((acc, child) => {
        return acc.length === 0 ? [child] : [...acc, delimiter, child]
    }, [])
}

function ExpansionControlBase({trail, isTrailCollapsed, expandTrail, collapseTrail}) {
    const isCollapsed = isTrailCollapsed(trail)

    return (
        <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
            <BasicButton
                onClick={() => {
                    isCollapsed ? expandTrail(trail) : collapseTrail(trail)
                }}
            >
                {isCollapsed ? <ExpandMoreIcon style={{width: 15}}/> : <ExpandLessIcon style={{width: 15}}/>}
            </BasicButton>
        </div>
    )
}

const ExpansionControl = withExpansionContext(ExpansionControlBase)

class ShapeViewerBase extends React.Component {

    render() {
        const {classes, shape} = this.props;
        const {cachedQueryResults, queries} = this.props;
        const {
            addField, removeField,
            setFieldShape, setBaseShape,
            setShapeParameterInField, setShapeParameterInShape
        } = this.props;
        const {isTrailParentCollapsed} = this.props;
        const {onShapeSelected} = this.props;

        function ShapeNameButton({shapeName, onShapeSelected, children}) {
            return (
                <BasicButton
                    color={shapeName.color || '#8a558e'}
                    style={{fontWeight: 200}}
                    onClick={() => {
                        //if (!coreShapeIdsSet.has(shapeName.id)) {
                        onShapeSelected(shapeName.id)
                        //}
                    }}
                >{children}</BasicButton>
            )
        }

        function withDefaultPrevented(f) {
            if (!f) {
                throw new Error(`f is required`)
            }
            return function (e) {
                //e.preventDefault()
                e.stopPropagation()
                f(e)
            }
        }

        function BindingInfo({bindingInfo, onClick}) {
            if (bindingInfo.binding) {
                if (bindingInfo.binding.ShapeProvider) {
                    return (
                        <BasicButton
                            style={{color: bindingInfo.color}}
                            onClick={onClick}
                        >{bindingInfo.boundName}</BasicButton>)
                }
                return (
                    <BasicButton
                        style={{fontWeight: 'bold', color: bindingInfo.color}}
                        onClick={onClick}>{bindingInfo.boundName}</BasicButton>
                )
            }
            return (
                <BasicButton
                    style={{color: unboundParameterColor, borderBottom: `1px solid ${unboundParameterColor}`}}
                    onClick={onClick}>{bindingInfo.parameterName}</BasicButton>
            )
        }

        function ShapeName({shapeName, onShapeSelected, onParameterSelected}) {
            if (shapeName.bindingInfo.length === 0) {
                return (
                    <ShapeNameButton
                        shapeName={shapeName}
                        onShapeSelected={onShapeSelected}>{shapeName.baseShapeName || shapeName.parameterName}</ShapeNameButton>
                )
            }
            return (
                <ShapeNameButton
                    shapeName={shapeName}
                    onShapeSelected={onShapeSelected}
                >{shapeName.baseShapeName}[{
                    <Join delimiter={<span>, </span>}>{
                        shapeName.bindingInfo
                            .map(bindingInfo => (
                                <BindingInfo
                                    bindingInfo={bindingInfo}
                                    onClick={withDefaultPrevented(() => onParameterSelected(bindingInfo))}/>
                            ))
                    }</Join>
                }]</ShapeNameButton>
            )
        }


        const {shapeId, name, coreShapeId} = shape;
        const output = []
        ShapeUtilities.flatten(queries, shapeId, 0, [], output)
        console.log({output})
        function Colon() {
            return <Typography variant="caption" style={{padding: '0 .25em'}}>:</Typography>
        }

        const shapeDescription = output
            .filter(({trail}) => {
                const shouldHideRow = isTrailParentCollapsed(trail)
                return !shouldHideRow
            })
            .map(entry => {
                const {id, type, name, shapeName, trail, isExpandable} = entry

                return (
                    <TooltipWrapper>
                        {({handleTooltipOpen, handleTooltipClose, ...rest}) => {
                            return (
                                <div className={classes.row} key={id} {...rest}>
                                    <div className={classes.expansionControlContainer}>
                                        {isExpandable ? <ExpansionControl trail={trail}/> : null}
                                    </div>
                                    <div style={{paddingLeft: `${trail.length - 1}em`}}>&nbsp;</div>
                                    {type === 'field' ? (
                                        <div className={classes.fieldRow}>
                                            <FieldName name={name} fieldId={id}/>
                                            <Colon/>
                                            <ShapeName
                                                shapeName={shapeName}
                                                onShapeSelected={() => handleTooltipOpen({
                                                    type: 'field',
                                                    data: {
                                                        handleOpenSelectionModal: this.handleOpenSelectionModal,
                                                        parentShapeId: entry.parentShapeId,
                                                        fieldId: id,
                                                        setFieldShape
                                                    }
                                                })}
                                                onParameterSelected={(bindingInfo) => {
                                                    handleTooltipOpen({
                                                        type: 'parameter',
                                                        data: {
                                                            handleOpenSelectionModal: this.handleOpenSelectionModal,
                                                            contextShapeId: entry.parentShapeId,
                                                            setParameterShape: (provider) => setShapeParameterInField(id, provider, bindingInfo.parameterId),
                                                            bindingInfo: bindingInfo
                                                        }
                                                    })
                                                }}
                                            />
                                            <WriteOnly>
                                                <div style={{padding: '.25em'}}>&nbsp;</div>
                                                {isExpandable && (
                                                    <BasicButton
                                                        className={classes.addFieldButton}
                                                        onClick={() => addField(entry.fieldShapeId)}>
                                                        + Add Field
                                                    </BasicButton>
                                                )}
                                            </WriteOnly>
                                            <div style={{flex: 1}}>&nbsp;</div>
                                            <WriteOnly>
                                                <BasicButton
                                                    className={classes.hiddenByDefault}
                                                    onClick={() => removeField(id)}>
                                                    <CancelIcon style={{width: 15, color: '#a6a6a6'}}/>
                                                </BasicButton>
                                            </WriteOnly>
                                        </div>
                                    ) : (
                                        <div className={classes.shapeRow}>
                                            <ShapeName
                                                shapeName={shapeName}
                                                onShapeSelected={() => {
                                                    handleTooltipOpen({
                                                        type: 'shape',
                                                        data: {
                                                            handleOpenSelectionModal: this.handleOpenSelectionModal,
                                                            shapeId: id,
                                                            setBaseShape
                                                        }
                                                    })
                                                }}

                                                onParameterSelected={(bindingInfo) => {
                                                    handleTooltipOpen({
                                                        type: 'parameter',
                                                        data: {
                                                            handleOpenSelectionModal: this.handleOpenSelectionModal,
                                                            contextShapeId: id,
                                                            setParameterShape: (provider) => setShapeParameterInShape(id, provider, bindingInfo.parameterId),
                                                            bindingInfo: bindingInfo
                                                        }
                                                    })
                                                }}
                                            />
                                            <WriteOnly>
                                                <div style={{padding: '.25em'}}>&nbsp;</div>
                                                {isExpandable && (
                                                    <BasicButton
                                                        className={classes.addFieldButton}
                                                        onClick={() => addField(id)}>
                                                        + Add Field
                                                    </BasicButton>
                                                )}
                                            </WriteOnly>
                                        </div>
                                    )}
                                </div>
                            )
                        }}
                    </TooltipWrapper>
                )
            })

        if (shapeId === coreShapeId) {
            return <CoreShapeViewer coreShapeId={coreShapeId}/>
        }


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
            </div>
        );
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
    shapeRow: {
        display: 'flex',
        flex: 1
    },
    addFieldButton: {
        color: '#3682e3'
    },
    hiddenByDefault: {
        visibility: 'hidden'
    },
    expansionControlContainer: {
        flexBasis: '2em',
        display: 'flex',

    }
})
ShapeViewerBase.propTypes = {};
const ShapeViewer =
    withExpansionContext(withShapeEditorContext(withEditorContext(withRfcContext(withStyles(styles)(ShapeViewerBase)))));
export default ShapeViewer