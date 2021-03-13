import * as React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { useSharedStyles, IndentSpaces } from './SharedStyles';
import {
  IChangeLog,
  IFieldRenderer,
  IShapeRenderer,
  JsonLike,
} from './ShapeRenderInterfaces';
import { ShapePrimitiveRender } from './ShapePrimitive';
import { useDepth } from './DepthContext';
import classNames from 'classnames';
import { useShapeRenderContext } from './ShapeRenderContext';
import { OneOfTabs } from './OneOfTabs';

type ShapeRowBaseProps = {
  children: any;
  depth: number;
  style?: any;
  changelog?: IChangeLog;
};
export const ShapeRowBase = ({
  children,
  depth = 0,
  style,
  changelog,
}: ShapeRowBaseProps) => {
  const classes = useStyles();
  const sharedClasses = useSharedStyles();
  return (
    <div
      style={style}
      className={classNames(classes.rowWrap, { [classes.allowHover]: false })}
    >
      <div
        className={classNames(
          classes.row,
          { [sharedClasses.added]: changelog && changelog.added },
          { [sharedClasses.removed]: changelog && changelog.removed },
          { [sharedClasses.changed]: changelog && changelog.changed }
        )}
        style={{ paddingLeft: depth * IndentSpaces + 4 }}
      >
        {children}
      </div>
    </div>
  );
};

export const RenderField = ({
  name,
  shapeChoices,
  required,
  changelog,
}: IFieldRenderer) => {
  const sharedClasses = useSharedStyles();
  const { depth } = useDepth();

  return (
    <>
      <ShapeRowBase depth={depth} changelog={changelog}>
        <span className={sharedClasses.shapeFont}>"{name}"</span>
        <span className={sharedClasses.symbolFont}>: </span>
        <RenderFieldLeadingValue shapeRenderers={shapeChoices} />
        {!required && (
          <span className={sharedClasses.symbolFont}> (optional) </span>
        )}
      </ShapeRowBase>
      <RenderFieldRowValues shapeRenderers={shapeChoices} />
    </>
  );
};

export const RenderRootShape = ({
  shape,
  right,
}: {
  shape: IShapeRenderer[];
  right?: any[];
}) => {
  const { depth } = useDepth();
  return (
    <>
      <ShapeRowBase depth={depth}>
        <RenderFieldLeadingValue shapeRenderers={shape} />
        {right ? (
          <>
            <div style={{ flex: 1 }} />
            {right}
          </>
        ) : null}
      </ShapeRowBase>
      <RenderFieldRowValues shapeRenderers={shape} />
    </>
  );
};

type RenderFieldValueProps = {
  shapeRenderers: IShapeRenderer[];
};

export const RenderFieldLeadingValue = ({
  shapeRenderers,
}: RenderFieldValueProps) => {
  const sharedClasses = useSharedStyles();
  if (shapeRenderers.length === 1) {
    const shape = shapeRenderers[0];
    if (shape.jsonType === JsonLike.OBJECT) {
      return (
        <>
          <span className={sharedClasses.symbolFont}>{'{'}</span>
        </>
      );
    }
    if (shape.jsonType === JsonLike.ARRAY && shape.asArray) {
      return (
        <>
          <span className={sharedClasses.symbolFont}>{'['}</span>
        </>
      );
    }

    return (
      <>
        <ShapePrimitiveRender {...shape} />
      </>
    );
  } else {
    return <span>'invariant, one of'</span>;
  }
};

export const RenderFieldRowValues = ({
  shapeRenderers,
}: RenderFieldValueProps) => {
  const sharedClasses = useSharedStyles();
  const { Indent, depth } = useDepth();
  if (shapeRenderers.length === 1) {
    const shape = shapeRenderers[0];
    if (shape.asObject) {
      return (
        <>
          {shape.asObject.fields.map((i, index) => (
            <Indent key={index}>
              <RenderField {...i} key={i.fieldId} />
            </Indent>
          ))}
          <ShapeRowBase depth={depth}>
            <span className={sharedClasses.symbolFont}>{'}'}</span>
          </ShapeRowBase>
        </>
      );
    }

    if (shape.asArray) {


      if (shape.asArray.shapeChoices.length === 0) {
        return <ShapePrimitiveRender {...shape} />
      }

      const inner =
        shape.asArray.shapeChoices.length > 1 ? (
          <OneOfRender
            parentShapeId={shape.shapeId}
            shapes={shape.asArray.shapeChoices}
          />
        ) : (
          <RenderRootShape shape={shape.asArray.shapeChoices} />
        );

      return (
        <>
          <Indent>{inner}</Indent>
          <ShapeRowBase depth={depth}>
            <span className={sharedClasses.symbolFont}>{']'}</span>
          </ShapeRowBase>
        </>
      );
    }

    return <></>;
  } else {
    return <span>'invariant, one of'</span>;
  }
};

export function OneOfRender({
  shapes,
  parentShapeId,
}: {
  shapes: IShapeRenderer[];
  parentShapeId: string;
}) {
  const { getChoice } = useShapeRenderContext();
  if (shapes.length === 1) {
    throw new Error('This is not a one of');
  }

  const choices = shapes.map((i) => ({
    label: i.jsonType.toString().toLowerCase(),
    id: i.shapeId,
  }));

  const tabProps = {
    choices,
    parentShapeId,
  };

  const chosenShapeToRender = choices.find((i) => i.id === getChoice(tabProps));
  if (!chosenShapeToRender) {
    throw new Error(`expected a shape to be chosen for rendering`);
  }
  const shape = shapes.find((i) => chosenShapeToRender.id === i.shapeId);
  if (!shape) {
    throw new Error(`expected to find the chosen shape`);
  }
  return (
    <RenderRootShape right={[<OneOfTabs {...tabProps} />]} shape={[shape]} />
  );
}

const useStyles = makeStyles((theme) => ({
  rowWrap: {
    display: 'flex',
  },
  allowHover: {
    '&:hover $row': {
      backgroundColor: '#e4ebf1',
    },
  },
  row: {
    flex: 1,
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'flex-start',
    minHeight: 17,
  },
}));
