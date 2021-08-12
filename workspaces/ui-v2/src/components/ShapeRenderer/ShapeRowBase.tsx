import * as React from 'react';
import { useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { JsonType } from '@useoptic/optic-domain';

import { IndentSpaces, useSharedStyles } from './SharedStyles';
import { IFieldRenderer, IShapeRenderer } from '<src>/types';
import { ShapePrimitiveRender, UnknownPrimitiveRender } from './ShapePrimitive';
import { useDepth } from './DepthContext';
import classNames from 'classnames';
import { useShapeRenderContext } from './ShapeRenderContext';
import { OneOfTabs, OneOfTabsProps } from './OneOfTabs';
import { ChangeType } from '<src>/types';

type ShapeRowBaseProps = {
  children: any;
  depth: number;
  style?: any;
  changes?: ChangeType | null;
  focused?: boolean;
  clickable?: boolean;
  onClick?: () => void;
} & React.HtmlHTMLAttributes<HTMLDivElement>;
export const ShapeRowBase = ({
  children,
  depth = 0,
  style,
  changes,
  focused,
  clickable,
  onClick,
  ...props
}: ShapeRowBaseProps) => {
  const classes = useStyles();
  const sharedClasses = useSharedStyles();

  const onClickWrap = useCallback(
    (e: React.MouseEvent) => {
      if (!clickable) return;
      e.preventDefault();
      e.stopPropagation();
      if (onClick) onClick();
    },
    [clickable, onClick]
  );

  return (
    <div
      style={style}
      className={classNames(classes.rowWrap, {
        [classes.allowHover]: false,
        [classes.isFocused]: focused,
        [classes.isClickable]: clickable,
      })}
      onClick={onClickWrap}
    >
      <div
        {...props}
        className={classNames(
          classes.row,
          { [sharedClasses.added]: changes === 'added' },
          { [sharedClasses.changed]: changes === 'updated' },
          { [sharedClasses.removed]: changes === 'removed' }
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
  fieldId,
}: IFieldRenderer & { parentId: string }) => {
  const sharedClasses = useSharedStyles();
  const { depth } = useDepth();

  const {
    getChoice,
    selectedFieldId,
    selectableFields,
    selectField,
  } = useShapeRenderContext();

  const onClickRow = useCallback(() => {
    selectField(fieldId);
  }, [selectField, fieldId]);

  if (shapeChoices.length === 1) {
    return (
      <>
        <ShapeRowBase
          depth={depth}
          changes={changes}
          clickable={selectableFields}
          focused={!selectedFieldId || fieldId === selectedFieldId}
          data-fieldid={fieldId}
          onClick={onClickRow}
        >
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
  } else if (shapeChoices.length === 0) {
    return (
      <ShapeRowBase
        depth={depth}
        changes={changes}
        clickable={selectableFields}
        focused={!selectedFieldId || fieldId === selectedFieldId}
        data-fieldid={fieldId}
        onClick={onClickRow}
      >
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
        <ShapeRowBase
          depth={depth}
          changes={changes}
          clickable={selectableFields}
          focused={!selectedFieldId || fieldId === selectedFieldId}
          data-fieldid={fieldId}
          onClick={onClickRow}
        >
          <span className={sharedClasses.shapeFont}>"{name}"</span>
          <span className={sharedClasses.symbolFont}>: </span>
          {toRenderShape && (
            <RenderFieldLeadingValue shapeRenderers={[toRenderShape]} />
          )}
          {!required && (
            <span className={sharedClasses.symbolFont}> (optional) </span>
          )}
          <div style={{ flex: 1 }} />
          <OneOfTabs {...tabprops} />
        </ShapeRowBase>
        {toRenderShape && (
          <RenderFieldRowValues shapeRenderers={[toRenderShape]} />
        )}
      </>
    );
  }
};

export const RenderRootShape = ({
  shape,
  right,
}: {
  shape: IShapeRenderer;
  right?: React.ReactElement;
}) => {
  const { depth } = useDepth();
  const { selectedFieldId } = useShapeRenderContext();

  return (
    <>
      <ShapeRowBase depth={depth} focused={!selectedFieldId}>
        <RenderFieldLeadingValue shapeRenderers={[shape]} />
        {right ? (
          <>
            <div style={{ flex: 1 }} />
            {right}
          </>
        ) : null}
      </ShapeRowBase>
      <RenderFieldRowValues shapeRenderers={[shape]} />
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
  const shape = shapeRenderers[0];

  if (!shape) {
    return null;
  }

  if (shape.jsonType === JsonType.OBJECT) {
    return (
      <>
        <span className={sharedClasses.symbolFont}>{'{'}</span>
      </>
    );
  }
  if (shape.jsonType === JsonType.ARRAY && shape.asArray) {
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
  const { selectedFieldId } = useShapeRenderContext();

  if (shapeRenderers.length === 1) {
    const shape = shapeRenderers[0];
    if (shape.asObject) {
      return (
        <>
          {shape.asObject.fields.map((field) => (
            <Indent key={field.fieldId}>
              <RenderField {...field} parentId={shape.shapeId} />
            </Indent>
          ))}
          <ShapeRowBase depth={depth} focused={!selectedFieldId}>
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
            <ShapeRowBase depth={depth} focused={!selectedFieldId}>
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
        ) : shape.asArray.shapeChoices.length === 1 ? (
          <RenderRootShape shape={shape.asArray.shapeChoices[0]} />
        ) : null;

      return (
        <>
          <Indent>{inner}</Indent>
          <ShapeRowBase depth={depth} focused={!selectedFieldId}>
            <span className={sharedClasses.symbolFont}>{']'}</span>
          </ShapeRowBase>
        </>
      );
    }

    return <></>;
  } else {
    return null;
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
  return <RenderRootShape right={<OneOfTabs {...tabProps} />} shape={shape} />;
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
    display: 'flex',
    alignItems: 'flex-start',
    minHeight: 17,

    '$rowWrap:not($isFocused) &': {
      opacity: 0.3,
    },

    '$isClickable &:hover': {
      backgroundColor: '#e4ebf1',
      cursor: 'pointer',
    },

    '$isClickable:not($isFocused) &:hover': {
      opacity: 0.6,
    },
  },
  isClickable: {},
  isFocused: {},
}));
