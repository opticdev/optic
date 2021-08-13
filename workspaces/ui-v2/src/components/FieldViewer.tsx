import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core';

import * as Theme from '<src>/styles/theme';
import { IFieldDetails } from '<src>/types';
import { ShapeTypeSummary } from './ShapeTypeSummary';

type FieldViewerProps = {
  fields: IFieldDetails[];
};

export const FieldViewer: FC<FieldViewerProps> = ({ fields }) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      {fields.length > 0 && (
        <ul className={classes.rowsList}>
          {fields.map((field) => (
            <li key={field.fieldId} className={classes.rowListItem}>
              <FieldViewerRow field={field} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const FieldViewerRow: FC<{
  field: IFieldDetails;
}> = ({ field }) => {
  const classes = useStyles();

  return (
    <div
      className={classes.fieldRowContainer}
      style={{
        paddingLeft: INDENT_WIDTH * field.depth,
      }}
    >
      <div className={classes.fieldSummary}>
        <div className={classes.fieldName}>{field.name}</div>
        <div className={classes.fieldShape}>
          <ShapeTypeSummary shapes={field.shapes} required={field.required} />
        </div>
      </div>
      {field.contribution.value !== '' && (
        <div className={classes.fieldContribution}>
          {field.contribution.value}
        </div>
      )}
    </div>
  );
};

const INDENT_WIDTH = 8 * 3;

const useStyles = makeStyles((theme) => ({
  container: {},
  rowsList: {
    listStyleType: 'none',
    paddingLeft: 0,
  },
  rowListItem: {},
  row: {},

  fieldRowContainer: {
    borderTop: '1px solid #e4e8ed',
    padding: theme.spacing(1, 0),
  },
  fieldSummary: {
    display: 'flex',
    alignItems: 'center',
  },
  fieldName: {
    color: '#3c4257',
    fontFamily: Theme.FontFamily,
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.fontSize - 1,
    marginRight: theme.spacing(1),
  },
  fieldShape: {
    fontFamily: Theme.FontFamilyMono,
    fontWeight: theme.typography.fontWeightLight,
    fontSize: theme.typography.fontSize - 2,
  },
  fieldContribution: {
    padding: theme.spacing(1, 0, 0, 1),
  },
}));
