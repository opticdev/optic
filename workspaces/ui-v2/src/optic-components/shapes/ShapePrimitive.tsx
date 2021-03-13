import * as React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { useSharedStyles } from './SharedStyles';
import { IShapeRenderer, JsonLike } from './ShapeRenderInterfaces';
import { useShapeRenderContext } from './ShapeRenderContext';
import classNames from 'classnames';

export const ShapePrimitiveRender = ({ jsonType, value }: IShapeRenderer) => {
  const classes = useStyles();
  const sharedClasses = useSharedStyles();

  const { showExamples } = useShapeRenderContext();

  if (jsonType === JsonLike.STRING)
    return (
      <span
        className={classNames(sharedClasses.valueFont, classes.stringClass)}
      >
        {'"'}
        {showExamples && typeof value === 'string' ? value : 'string'}
        {'"'}
      </span>
    );
  if (jsonType === JsonLike.NUMBER)
    return (
      <span
        className={classNames(sharedClasses.valueFont, classes.numberClass)}
      >
        {showExamples && typeof value === 'number'
          ? value.toString()
          : 'number'}
      </span>
    );

  if (jsonType === JsonLike.BOOLEAN)
    return (
      <span
        className={classNames(sharedClasses.valueFont, classes.booleanClass)}
      >
        {showExamples && typeof value === 'boolean'
          ? value.toString()
          : 'boolean'}
      </span>
    );

  if (jsonType === JsonLike.NULL)
    return (
      <span className={classNames(sharedClasses.valueFont, classes.nullClass)}>
        {/*{showExamples ? '' : 'boolean'}*/}
        null
      </span>
    );

  return null;
};

export const UnknownPrimitiveRender = ({ props }: any) => {
  const classes = useStyles();
  const sharedClasses = useSharedStyles();

    return (
      <span
        className={classNames(sharedClasses.valueFont, classes.stringClass)}
      >
        Unknown
      </span>
    );
}

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
