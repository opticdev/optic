import React, { FC } from 'react';
import { makeStyles, ThemeProvider } from '@material-ui/core';

import { IFieldDetails, IShapeRenderer } from '<src>/types';
import * as Theme from '<src>/styles/theme';

export const ShapeEditor: FC<{
  fields: IFieldDetails[];
  selectedFieldId: string | null;
  setSelectedField: (fieldId: string | null) => void;
}> = ({ fields, selectedFieldId, setSelectedField }) => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      {fields.length > 0 && (
        <ul className={classes.rowsList}>
          {fields.map((field) => (
            <li className={classes.rowListItem}>
              <Row field={field} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Row: FC<{
  field: IFieldDetails;
}> = function ShapeEditorRow({ field }) {
  const classes = useStyles();

  return (
    <div className={classes.row}>
      <Field
        depth={field.depth}
        name={field.name}
        required={field.required}
        shapes={field.shapes}
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
}));

const Field: FC<{
  depth: number;
  name: string;
  required: boolean;
  shapes: IShapeRenderer[];
}> = function ShapeEditorField({ name, shapes, required, depth }) {
  const classes = useFieldStyles();

  return (
    <div className={classes.container}>
      <header
        className={classes.header}
        style={{ marginLeft: depth * INDENT_WIDTH }}
      >
        <div className={classes.description}>
          <div className={classes.fieldName}>{name}</div>
          <div className={classes.typesSummary}>
            {summarizeTypes(shapes, required)}
          </div>
        </div>
      </header>
    </div>
  );
};

function summarizeTypes(shapes: IShapeRenderer[], required: boolean) {
  const optionalText = required ? '' : ' (optional)';
  if (shapes.length === 1) {
    return shapes[0].jsonType.toString().toLowerCase() + optionalText;
  } else {
    const allShapes = shapes.map((i) => i.jsonType.toString().toLowerCase());
    const last = allShapes.pop();
    return allShapes.join(', ') + ' or ' + last + optionalText;
  }
}

const INDENT_WIDTH = 8 * 3;
const INDENT_MARKER_WIDTH = 1;
const useFieldStyles = makeStyles((theme) => ({
  container: {
    fontFamily: Theme.FontFamily,
    padding: theme.spacing(0, 0, 0, 1),
    backgroundColor: '#fafafa',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${INDENT_WIDTH}' height='1' viewBox='0 0 ${INDENT_WIDTH} 1'%3E%3Cg stroke='%23CCC' stroke-width='0' %3E%3Crect fill='%23E4E8ED' x='0' y='0' width='${INDENT_MARKER_WIDTH}' height='1'/%3E%3C/g%3E%3C/svg%3E")`,
    backgroundPositionX: theme.spacing(1) + 1,
  },
  header: {
    display: 'flex',
    backgroundColor: '#fafafa',
    padding: theme.spacing(1, 0),
  },
  description: {
    display: 'flex',
    alignItems: 'baseline',
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
}));
