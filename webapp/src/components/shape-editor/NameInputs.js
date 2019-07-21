import React from 'react';
import AutosizeInput from 'react-input-autosize';
import classNames from 'classnames';
import withStyles from '@material-ui/core/styles/withStyles.js';
import {EditorModes, withEditorContext} from '../../contexts/EditorContext.js';
import {withShapeEditorContext} from '../../contexts/ShapeEditorContext.js';

const autoSizeInputStyles = (theme) => ({
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

function NameEditorBase({classes, name, mode, onSubmit}) {
    const isEditable = mode === EditorModes.DESIGN
    const [newName, setNewName] = React.useState(name)

    return (
        <AutosizeInput
            autoFocus={isEditable && newName === ''}
            placeholder="field"
            inputClassName={classNames(classes.fieldNameInput, {[classes.disabled]: !isEditable})}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            spellCheck="false"
            onBlur={(e) => {
                if (name !== newName) {
                    onSubmit(newName)
                }
            }}
        />
    )
}

function FieldNameBase({classes, name, fieldId, renameField, mode}) {
    return (
        <NameEditorBase
            classes={classes}
            name={name}
            mode={mode}
            onSubmit={(newName) => {
                renameField(fieldId, newName)
            }}
        />
    )
}

function ShapeParameterNameBase({classes, name, shapeParameterId, renameShapeParameter, mode}) {
    return (
        <NameEditorBase
            classes={classes}
            name={name}
            mode={mode}
            onSubmit={(newName) => {
                renameShapeParameter(shapeParameterId, newName)
            }}
        />
    )
}

const FieldName = withShapeEditorContext(withEditorContext(withStyles(autoSizeInputStyles)(FieldNameBase)))
const ShapeParameterName = withShapeEditorContext(withEditorContext(withStyles(autoSizeInputStyles)(ShapeParameterNameBase)))



export {
    FieldName,
    ShapeParameterName
}