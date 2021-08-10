import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core';

import { IFieldDetails, IShapeRenderer } from '<src>/types';

export const ShapeEditor: FC<{
  fields: IFieldDetails[];
  shapes: IShapeRenderer[];
  selectedFieldId: string | null;
  setSelectedField: (fieldId: string | null) => void;
}> = ({ fields, shapes, selectedFieldId, setSelectedField }) => {
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
      <Field name={field.name} />
    </div>
  );
};

const Field: FC<{ name: string }> = function ShapeEditorField({ name }) {
  return <div>{name}</div>;
};

const useStyles = makeStyles((theme) => ({
  container: {},
  rowsList: {
    listStyleType: 'none',
  },
  rowListItem: {},
  row: {},
}));
