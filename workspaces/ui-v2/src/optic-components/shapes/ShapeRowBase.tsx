import * as React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { IndentSpaces, useSharedStyles } from './SharedStyles';
import {
  IFieldRenderer,
  IShapeRenderer,
  JsonLike,
} from './ShapeRenderInterfaces';
import { ShapePrimitiveRender, UnknownPrimitiveRender } from './ShapePrimitive';
import { useDepth } from './DepthContext';
import classNames from 'classnames';
import { useShapeRenderContext } from './ShapeRenderContext';
import { OneOfTabs, OneOfTabsProps } from './OneOfTabs';
import { IChanges } from '../changelog/IChanges';

type ShapeRowBaseProps = {
  children: any;
  depth: number;
  style?: any;
  changes?: IChanges;
};
export const ShapeRowBase = ({
  children,
  depth = 0,
  style,
  changes,
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
          { [sharedClasses.added]: changes && changes.added },
          // { [sharedClasses.removed]: changes && changes.removed },
          { [sharedClasses.changed]: changes && changes.changed },
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
  parentId,
  changes,
}: IFieldRenderer) => {
  const sharedClasses = useSharedStyles();
  const { depth } = useDepth();

  const { getChoice } = useShapeRenderContext();

  if (shapeChoices.length === 1) {
    return (
      <>
        <ShapeRowBase depth={depth} changes={changes}>
          <span className={sharedClasses.shapeFont}>"{name}"</span>
          <span className={sharedClasses.symbolFont}>: </span>
          <RenderFieldLeadingValue
            parentId={parentId}
            shapeRenderers={shapeChoices}
          />
          {!required && (
            <span className={sharedClasses.symbolFont}> (optional) </span>
          )}
        </ShapeRowBase>
        <RenderFieldRowValues
          parentId={parentId}
          shapeRenderers={shapeChoices}
        />
      </>
    );
  } else if (shapeChoices.length === 0) {
    return (
      <ShapeRowBase depth={depth} changes={changes}>
        <span className={sharedClasses.shapeFont}>"{name}"</span>
        <span className={sharedClasses.symbolFont}>: </span>
        <UnknownPrimitiveRender />
      </ShapeRowBase>
    );
  } else {
    const tabprops: OneOfTabsProps = {
      parentShapeId: parentId,
      choices: shapeChoices.map((i) => ({
        label: i.jsonType,
        id: i.shapeId,
      })),
    };
    const current = getChoice(tabprops);
    const toRenderShape =
      shapeChoices.find((i) => i.shapeId === current) || shapeChoices[0];
    //one of
    return (
      <>
        <ShapeRowBase depth={depth} changes={changes}>
          <span className={sharedClasses.shapeFont}>"{name}"</span>
          <span className={sharedClasses.symbolFont}>: </span>
          {toRenderShape && (
            <RenderFieldLeadingValue
              parentId={parentId}
              shapeRenderers={[toRenderShape]}
            />
          )}
          {!required && (
            <span className={sharedClasses.symbolFont}> (optional) </span>
          )}
          <div style={{ flex: 1 }} />
          <OneOfTabs {...tabprops} />
        </ShapeRowBase>
        {toRenderShape && (
          <RenderFieldRowValues
            parentId={parentId}
            shapeRenderers={[toRenderShape]}
          />
        )}
      </>
    );
  }
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
        <RenderFieldLeadingValue shapeRenderers={shape} parentId={'root'} />
        {right ? (
          <>
            <div style={{ flex: 1 }} />
            {right}
          </>
        ) : null}
      </ShapeRowBase>
      <RenderFieldRowValues shapeRenderers={shape} parentId={'root'} />
    </>
  );
};

type RenderFieldValueProps = {
  parentId: string;
  shapeRenderers: IShapeRenderer[];
};

export const RenderFieldLeadingValue = ({
  shapeRenderers,
  parentId,
}: RenderFieldValueProps) => {
  const sharedClasses = useSharedStyles();
  const shape = shapeRenderers[0];

  if (!shape) {
    return null;
  }

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
              <RenderField {...i} key={i.fieldId} parentId={shape.shapeId} />
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
        return (
          <>
            <ShapePrimitiveRender {...shape} />
            <ShapeRowBase depth={depth}>
              <span className={sharedClasses.symbolFont}>{']'}</span>
            </ShapeRowBase>
          </>
        );
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
    return null;
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
