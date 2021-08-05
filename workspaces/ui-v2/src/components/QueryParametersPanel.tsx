import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core';
import classnames from 'classnames';

import {
  FontFamily,
  FontFamilyMono,
  AddedGreenBackground,
  ChangedYellowBackground,
  RemovedRedBackground,
} from '<src>/styles';
import { QueryParameters } from '<src>/types';
import { ShapeRenderer } from './ShapeRenderer';
import { Panel } from './Panel';

type QueryParametersPanelProps = {
  parameters: QueryParameters;
};

export const QueryParametersPanel: FC<QueryParametersPanelProps> = ({
  parameters,
}) => {
  const classes = useStyles();
  return (
    <Panel header={<span>query string</span>}>
      {Object.entries(parameters).map(([key, field]) => (
        <div
          className={classnames(classes.queryComponentContainer, [
            ...[field.changes === 'added' && classes.added],
            ...[field.changes === 'updated' && classes.changed],
            ...[field.changes === 'removed' && classes.removed],
          ])}
          key={key}
        >
          <div className={classes.queryKey}>
            {key}
            {!field.required && (
              <span className={classes.attribute}> (optional) </span>
            )}

            {field.additionalAttributes &&
              field.additionalAttributes.map((attribute) => (
                <span key={attribute} className={classes.attribute}>
                  {' '}
                  ({attribute}){' '}
                </span>
              ))}
          </div>
          <div className={classes.shapeContainer}>
            <ShapeRenderer showExamples={false} shapes={field.shapeChoices} />
          </div>
        </div>
      ))}
    </Panel>
  );
};

const useStyles = makeStyles((theme) => ({
  queryTooltipContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  queryTooltipIcon: {
    margin: theme.spacing(0, 1),
  },
  queryComponentContainer: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    display: 'flex',
    '&:not(:first-child)': {
      borderTop: '1px solid #e4e8ed',
    },
  },
  queryKey: {
    fontFamily: FontFamily,
    fontWeight: 600,
    fontSize: theme.typography.fontSize - 1,
  },
  shapeContainer: {
    flexGrow: 1,
  },
  attribute: {
    fontSize: theme.typography.fontSize - 1,
    fontFamily: FontFamilyMono,
    fontWeight: 400,
    color: '#a3acb9',
  },
  added: {
    backgroundColor: `${AddedGreenBackground}`,
  },
  changed: {
    backgroundColor: `${ChangedYellowBackground}`,
  },
  removed: {
    backgroundColor: `${RemovedRedBackground}`,
  },
}));
