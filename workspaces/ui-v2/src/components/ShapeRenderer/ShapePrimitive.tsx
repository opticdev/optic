import * as React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { JsonType } from '@useoptic/optic-domain';
import * as Theme from '<src>/styles/theme';

import { useSharedStyles } from './SharedStyles';
import { IShapeRenderer } from '<src>/types';
import classNames from 'classnames';

export const ShapePrimitiveRender = ({ jsonType }: IShapeRenderer) => {
  const classes = useStyles();
  const sharedClasses = useSharedStyles();

  if (jsonType === JsonType.STRING)
    return (
      <span
        className={classNames(sharedClasses.valueFont, classes.stringClass)}
      >
        string
      </span>
    );
  if (jsonType === JsonType.NUMBER)
    return (
      <span
        className={classNames(sharedClasses.valueFont, classes.numberClass)}
      >
        number
      </span>
    );

  if (jsonType === JsonType.BOOLEAN)
    return (
      <span
        className={classNames(sharedClasses.valueFont, classes.booleanClass)}
      >
        boolean
      </span>
    );

  if (jsonType === JsonType.NULL)
    return (
      <span className={classNames(sharedClasses.valueFont, classes.nullClass)}>
        null
      </span>
    );

  return null;
};

export const UnknownPrimitiveRender = ({ props }: any) => {
  const classes = useStyles();
  const sharedClasses = useSharedStyles();

  return (
    <span className={classNames(sharedClasses.valueFont, classes.stringClass)}>
      Unknown
    </span>
  );
};

const useStyles = makeStyles((theme) => ({
  stringClass: {
    color: Theme.jsonTypeColors[JsonType.STRING],
    whiteSpace: 'pre-line',
  },
  numberClass: {
    color: Theme.jsonTypeColors[JsonType.NUMBER],
  },
  unknownClass: {
    color: Theme.jsonTypeColors[JsonType.UNDEFINED],
  },
  booleanClass: {
    color: Theme.jsonTypeColors[JsonType.BOOLEAN],
    fontWeight: 600,
  },
  nullClass: {
    color: Theme.jsonTypeColors[JsonType.NULL],
  },
}));
