import React, { FC } from 'react';
import { makeStyles, Tooltip } from '@material-ui/core';
import { Help as HelpIcon } from '@material-ui/icons';
import classnames from 'classnames';

import {
  FontFamily,
  AddedGreenBackground,
  ChangedYellowBackground,
  RemovedRedBackground,
} from '<src>/styles';
import { IFieldRenderer, IShapeRenderer, ShapeRenderer } from './ShapeRenderer';
import { Panel } from './Panel';

type QueryParameters = Record<string, IFieldRenderer>;

type QueryParametersPanelProps = {
  parameters: QueryParameters;
};

// TODO QPB this should move into redux
export const convertShapeToQueryParameters = (
  shapes: IShapeRenderer[]
): QueryParameters => {
  const queryParameters: QueryParameters = {};
  if (shapes.length !== 1 || !shapes[0].asObject) {
    if (shapes.length > 1) {
      console.error('unexpected format for query parameters');
    }
    // otherwise loading
    return {};
  }

  for (const field of shapes[0].asObject.fields) {
    queryParameters[field.name] = field;
  }

  return queryParameters;
};

export const QueryParametersPanel: FC<QueryParametersPanelProps> = ({
  parameters,
}) => {
  const classes = useStyles();
  return (
    <Panel
      header={
        <Tooltip title="?key=value1&key=value2 is treated as an array of key=[value1, value2]">
          <div className={classes.queryTooltipContainer}>
            Query string parsing strategy
            <HelpIcon fontSize="small" className={classes.queryTooltipIcon} />
          </div>
        </Tooltip>
      }
    >
      {Object.entries(parameters).map(([key, field]) => (
        <div
          className={classnames(classes.queryComponentContainer, [
            ...[field.changes?.added && classes.added],
            ...[field.changes?.changed && classes.changed],
          ])}
          key={classes.queryKey}
        >
          <div className={classes.queryKey}>{key}</div>
          <div>
            <ShapeRenderer showExamples={false} shape={field.shapeChoices} />
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
    padding: theme.spacing(1, 0),
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
