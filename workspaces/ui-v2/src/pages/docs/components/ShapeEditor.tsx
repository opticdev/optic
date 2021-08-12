import React, { ComponentProps, FC, useCallback, useState } from 'react';
import {
  makeStyles,
  lighten,
  IconButton,
  ButtonGroup,
  Button,
  TextField,
} from '@material-ui/core';
import { Check as CheckIcon } from '@material-ui/icons';
import ClassNames from 'classnames';
import Color from 'color';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';

import { setEquals } from '<src>/lib/set-ops';
import { IFieldDetails, IShapeRenderer } from '<src>/types';
import { JsonType } from '@useoptic/optic-domain';
import * as Theme from '<src>/styles/theme';

export const ShapeEditor: FC<{
  fields: IFieldDetails[];
  selectedFieldId?: string | null;
  setSelectedField?: (fieldId: string | null) => void;
  onChangeDescription?: (
    fieldId: string,
    description: string,
    isDescriptionDifferent: boolean
  ) => void;
  onChangeFieldType?: (
    fieldId: string,
    requestedFieldTypes: Set<JsonType>,
    isFieldTypeDifferent: boolean
  ) => void;
}> = ({
  fields,
  selectedFieldId,
  setSelectedField,
  onChangeDescription,
  onChangeFieldType,
}) => {
  const classes = useStyles();

  const onFieldSelect = (fieldId: string) => () => {
    if (setSelectedField) {
      // Deselect the field if the field is already the currently selected field
      setSelectedField(fieldId === selectedFieldId ? null : fieldId);
    }
  };

  return (
    <div className={classes.container}>
      {fields.length > 0 && (
        <ul className={classes.rowsList}>
          {fields.map((field) => (
            <li key={field.fieldId} className={classes.rowListItem}>
              <Row
                field={field}
                selected={selectedFieldId === field.fieldId}
                onChangeDescription={onChangeDescription}
                onSelect={onFieldSelect(field.fieldId)}
                onChangeFieldType={onChangeFieldType}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const editableTypes: Set<JsonType> = new Set([
  JsonType.UNDEFINED,
  JsonType.NULL,
]);
const getInitialTypes = (fields: IFieldDetails): Set<JsonType> => {
  const initialTypes: Set<JsonType> = new Set();
  for (const type of editableTypes) {
    if (type === JsonType.UNDEFINED && !fields.required) {
      initialTypes.add(type);
    } else if (fields.shapes.find((shape) => shape.jsonType === type)) {
      initialTypes.add(type);
    }
  }
  return initialTypes;
};

const Row: FC<{
  field: IFieldDetails;
  selected: boolean;

  onChangeDescription?: ComponentProps<
    typeof ShapeEditor
  >['onChangeDescription'];
  onChangeFieldType?: ComponentProps<typeof ShapeEditor>['onChangeFieldType'];
  onSelect?: () => void;
}> = function ShapeEditorRow({
  field,
  selected,
  onChangeDescription,
  onChangeFieldType,
  onSelect,
}) {
  const classes = useStyles();
  const initialDescription = field.contribution['value'];
  const initialFieldTypes = getInitialTypes(field);
  const [description, setDescription] = useState(initialDescription);
  const [jsonTypes, setJsonTypes] = useState<Set<JsonType>>(initialFieldTypes);

  const onChangeTypeHandler = useCallback(
    (type: JsonType, enabled: boolean) => {
      const newJsonTypes = new Set(jsonTypes);
      if (enabled) {
        newJsonTypes.add(type);
      } else {
        newJsonTypes.delete(type);
      }
      setJsonTypes(newJsonTypes);

      onChangeFieldType &&
        onChangeFieldType(
          field.fieldId,
          newJsonTypes,
          !setEquals(initialFieldTypes, newJsonTypes)
        );
    },
    [field.fieldId, onChangeFieldType, initialFieldTypes, jsonTypes]
  );

  const onChangeDescriptionHandler = useCallback(
    (description: string) => {
      setDescription(description);
      if (onChangeDescription) {
        onChangeDescription(
          field.fieldId,
          description,
          description !== initialDescription
        );
      }
    },
    [field.fieldId, onChangeDescription, initialDescription]
  );

  return (
    <div className={classes.row}>
      <Field
        depth={field.depth}
        name={field.name}
        required={field.required}
        shapes={field.shapes}
        selected={selected}
        onClickHeader={onSelect}
      >
        {selected && (
          <FieldEditor
            field={field}
            description={description}
            currentJsonTypes={[...jsonTypes]}
            onChangeType={onChangeTypeHandler}
            onChangeDescription={onChangeDescriptionHandler}
          />
        )}
      </Field>
    </div>
  );
};

const FieldEditor: FC<{
  field: IFieldDetails;
  description: string;
  currentJsonTypes: JsonType[];

  onChangeDescription?: (description: string) => void;
  onChangeType?: (type: JsonType, enabled: boolean) => void;
}> = function ShapeEditorFieldEditor({
  field,
  description,
  currentJsonTypes,
  onChangeDescription,
  onChangeType,
}) {
  const classes = useStyles();
  const nonEditableTypes = field.shapes
    .map((shape) => shape.jsonType)
    .filter((jsonType) => !editableTypes.has(jsonType));

  let onClickTypeButton = useCallback(
    (type: JsonType) => (e: React.MouseEvent) => {
      e.preventDefault();
      if (onChangeType) onChangeType(type, !currentJsonTypes.includes(type));
    },
    [currentJsonTypes, onChangeType]
  );

  let onChangeDescriptionField = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChangeDescription) onChangeDescription(e.target.value);
    },
    [onChangeDescription]
  );

  return (
    <div className={classes.editor}>
      <ButtonGroup className={classes.typeSelector}>
        {[...editableTypes].map((editableType) => (
          <Button
            key={editableType}
            disableElevation
            variant={
              currentJsonTypes.includes(editableType) ? 'contained' : 'outlined'
            }
            startIcon={
              currentJsonTypes.includes(editableType) ? <CheckIcon /> : null
            }
            onClick={onClickTypeButton(editableType)}
          >
            {editableType === JsonType.UNDEFINED ? 'Optional' : editableType}
          </Button>
        ))}

        {nonEditableTypes.map((jsonType) => (
          <Button
            color="primary"
            variant="contained"
            disabled
            startIcon={<CheckIcon />}
          >
            {jsonType}
          </Button>
        ))}
      </ButtonGroup>

      <TextField
        value={description}
        label="Field description"
        placeholder={`What is ${field.name}? How is it used?`}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        onChange={onChangeDescriptionField}
      />
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {},
  rowsList: {
    listStyleType: 'none',
    paddingLeft: 0,
  },
  rowListItem: {},
  row: {},

  editor: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3, 2),

    color: lighten('#6b7384', 0.2),

    boxShadow: 'inset 0px 13px 10px -10px rgba(0, 0, 0, 0.07)',
  },

  typeSelector: {
    marginBottom: theme.spacing(4),
  },
}));

const Field: FC<{
  children?: React.ReactNode;
  depth: number;
  name: string;
  required: boolean;
  selected: boolean;
  shapes: IShapeRenderer[];

  onClickHeader?: () => void;
}> = function ShapeEditorField({
  name,
  shapes,
  required,
  depth,
  children,
  selected,
  onClickHeader,
}) {
  const classes = useFieldStyles();

  const onClickHeaderHandler = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (onClickHeader) onClickHeader();
    },
    [onClickHeader]
  );

  const onClickRemove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('clicked remove');
  }, []);

  return (
    <div
      className={ClassNames(classes.container, {
        [classes.isSelected]: selected,
        [classes.isIndented]: depth > 0,
      })}
    >
      <header
        className={classes.header}
        onClick={onClickHeaderHandler}
        style={{
          paddingLeft: Math.max(depth - 1, 0) * INDENT_WIDTH,
          backgroundImage: `url("${indentsImageUrl(depth - 1)}")`,
        }}
      >
        <div className={classes.description}>
          <div className={classes.fieldName}>{name}</div>
          <div className={classes.typesSummary}>
            {summarizeTypes(shapes, required)}
          </div>
        </div>
        <div className={classes.controls}>
          {selected && (
            <IconButton
              className={classes.removeControl}
              size="small"
              onClick={onClickRemove}
            >
              <DeleteOutlineIcon />
            </IconButton>
          )}
        </div>
      </header>

      <div className={classes.stage}>{children}</div>
    </div>
  );
};

function summarizeTypes(shapes: IShapeRenderer[], required: boolean) {
  const optionalText = required ? '' : ' (optional)';
  let components = shapes.map(({ jsonType }: { jsonType: JsonType }) => (
    <span key={jsonType} style={{ color: Theme.jsonTypeColors[jsonType] }}>
      {jsonType.toString().toLowerCase()}
    </span>
  ));
  if (shapes.length === 1) {
    return (
      <>
        {components} {optionalText}
      </>
    );
  } else {
    const last = components.pop();
    return (
      <>
        {components.map((component, i) => (
          <span key={component.key}>{component},</span>
        ))}{' '}
        or {last} {optionalText}
      </>
    );
  }
}

const INDENT_WIDTH = 8 * 3;
const INDENT_MARKER_WIDTH = 1;
const INDENT_COLOR = '#E4E8ED';
function indentsImageUrl(depth: number = 0) {
  let range = Array(Math.max(depth, 0))
    .fill(0)
    .map((val, n) => n);
  let width = INDENT_WIDTH * depth;
  return (
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='1' viewBox='0 0 ${width} 1'>
        ${range
          .map(
            (n) => `
            <rect fill="${INDENT_COLOR}" x="${
              INDENT_WIDTH * n
            }" y="0" height="1" width="${INDENT_MARKER_WIDTH}" />;
          `
          )
          .join('')}
      </svg>`
    )
  );
}

const useFieldStyles = makeStyles((theme) => ({
  container: {
    fontFamily: Theme.FontFamily,

    '&$isSelected': {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      marginLeft: -1, // account for the added border
      boxShadow: '0px 8px 8px -5px rgb(0 0 0 / 12%)',
      borderRadius: theme.shape.borderRadius,
      border: `1px solid ${Color(Theme.OpticBlueReadable)
        .saturate(0.8)
        .lighten(0.58)
        .hsl()
        .string()}`,
    },
  },
  isSelected: {},
  isIndented: {},

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    cursor: 'pointer',
    backgroundPositionX: theme.spacing(1),
    backgroundRepeat: 'repeat-y',

    '&:hover': {
      backgroundColor: lighten(Theme.OpticBlueReadable, 0.9),
    },

    '$isSelected &': {
      background: `${Color(Theme.OpticBlueReadable)
        .saturate(0.8)
        .lighten(0.63)
        .hsl()
        .string()} !important`,
      borderBottom: `1px solid ${Color(Theme.OpticBlueReadable)
        .saturate(0.8)
        .lighten(0.55)
        .hsl()
        .string()}`,

      // '&:hover': {
      //   borderBottom: `1px solid ${lighten(Theme.OpticBlueReadable, 0.2)}`,
      // },
    },
  },

  description: {
    display: 'flex',
    padding: theme.spacing(1, 0),
    marginLeft: theme.spacing(1),
    alignItems: 'baseline',
    borderLeft: `1px solid #E4E8ED`,
    borderLeftWidth: 0,

    '$isIndented &': {
      paddingLeft: INDENT_WIDTH,
      borderLeftWidth: '1px',
    },

    '$isIndented $header:hover &': {
      borderLeftColor: Color(Theme.OpticBlueReadable)
        .saturate(0.8)
        .lighten(0.43)
        .hsl()
        .string(),
    },

    '$isIndented$isSelected &': {
      borderLeftWidth: '1px',
      borderLeftColor: Color(Theme.OpticBlueReadable)
        .saturate(0.8)
        .lighten(0.53)
        .hsl()
        .string(),
    },
  },

  fieldName: {
    color: '#3c4257',
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.fontSize - 1,
    marginRight: theme.spacing(1),
  },
  typesSummary: {
    fontFamily: Theme.FontFamilyMono,
    color: '#8792a2',
  },

  // Controls
  //
  controls: {
    display: 'flex',
    color: '#ccc',
    marginRight: theme.spacing(1),
  },

  removeControl: {
    color: Color(Theme.OpticBlueReadable)
      .saturate(0.8)
      .lighten(0.2)
      .hsl()
      .string(),
  },

  stage: {},
}));
