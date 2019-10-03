import React from 'react';
import {ShapesCommands, ShapesHelper} from '../engine';
import {GenericContextFactory} from './GenericContextFactory.js';
import {withRfcContext} from './RfcContext.js';

const {
    Context: ShapeEditorContext,
    withContext: withShapeEditorContext
} = GenericContextFactory(null)

class ShapeEditorStoreBase extends React.Component {
    addField = (shapeId) => {
        const {handleCommand} = this.props;
        const fieldId = ShapesHelper.newFieldId()
        const fieldShapeDescriptor = ShapesCommands.FieldShapeFromShape(fieldId, '$string')
        const command = ShapesCommands.AddField(fieldId, shapeId, '', fieldShapeDescriptor)
        handleCommand(command)
    }

    addParameter = (shapeId) => {
        const {handleCommand} = this.props;
        const shapeParameterId = ShapesHelper.newShapeParameterId()
        const command = ShapesCommands.AddShapeParameter(shapeParameterId, shapeId, ``)
        handleCommand(command)
    }

    setFieldShape = (fieldShapeDescriptor) => {
        const {fieldId, shapeId$1} = fieldShapeDescriptor
        const {handleCommand, handleCommands} = this.props;
        if (shapeId$1 === '$object' || shapeId$1 === '$oneOf') {
            const inlineShapeId = ShapesHelper.newShapeId()
            const addInlineShape = ShapesCommands.AddShape(inlineShapeId, shapeId$1, '')
            const setFieldShape = ShapesCommands.SetFieldShape(ShapesCommands.FieldShapeFromShape(fieldId, inlineShapeId))
            handleCommands(addInlineShape, setFieldShape)
        } else {
            const command = ShapesCommands.SetFieldShape(fieldShapeDescriptor)
            handleCommand(command)
        }
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

    renameField = (fieldId, name) => {
        const {handleCommand} = this.props;
        const command = ShapesCommands.RenameField(fieldId, name)
        handleCommand(command)
    }

    renameShapeParameter = (shapeParameterId, name) => {
        const {handleCommand} = this.props;
        const command = ShapesCommands.RenameShapeParameter(shapeParameterId, name)
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
        const context = {
            addField: this.addField,
            addParameter: this.addParameter,
            setFieldShape: this.setFieldShape,
            setShapeParameterInField: this.setShapeParameterInField,
            setShapeParameterInShape: this.setShapeParameterInShape,
            setBaseShape: this.setBaseShape,
            renameField: this.renameField,
            removeShape: this.removeShape,
            removeField: this.removeField,
            renameShapeParameter: this.renameShapeParameter,
            removeShapeParameter: this.removeShapeParameter,
            queries: this.props.queries,
            cachedQueryResults: this.props.cachedQueryResults,
            onShapeSelected: this.props.onShapeSelected,
            isShapeEditorReadOnly: this.props.readOnly || false,
        }
        return (
            <ShapeEditorContext.Provider value={context}>
                {this.props.children}
            </ShapeEditorContext.Provider>
        )
    }
}

const ShapeEditorStore = withRfcContext(ShapeEditorStoreBase)

export {
    withShapeEditorContext,
    ShapeEditorContext,
    ShapeEditorStore
}
