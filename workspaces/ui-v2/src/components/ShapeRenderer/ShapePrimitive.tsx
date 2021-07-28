import * as React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { useSharedStyles } from './SharedStyles';
import { IShapeRenderer, JsonLike } from '<src>/types';
import classNames from 'classnames';

export const ShapePrimitiveRender = ({ jsonType }: IShapeRenderer) => {
  const classes = useStyles();
  const sharedClasses = useSharedStyles();

  if (jsonType === JsonLike.STRING)
    return (
      <span
        className={classNames(sharedClasses.valueFont, classes.stringClass)}
      >
        string
      </span>
    );
  if (jsonType === JsonLike.NUMBER)
    return (
      <span
        className={classNames(sharedClasses.valueFont, classes.numberClass)}
      >
        number
      </span>
    );

  if (jsonType === JsonLike.BOOLEAN)
    return (
      <span
        className={classNames(sharedClasses.valueFont, classes.booleanClass)}
      >
        boolean
      </span>
    );

  if (jsonType === JsonLike.NULL)
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
    color: '#09825d',
    whiteSpace: 'pre-line',
  },
  numberClass: {
    color: '#e56f4a',
  },
  unknownClass: {
    color: '#857b79',
  },
  booleanClass: {
    color: '#067ab8',
    fontWeight: 600,
  },
  nullClass: {
    color: '#8792a2',
  },
}));
