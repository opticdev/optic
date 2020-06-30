import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Typography } from '@material-ui/core';
import classNames from 'classnames';
import scrollIntoView from 'scroll-into-view-if-needed';
import WarningIcon from '@material-ui/icons/Warning';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import {
  AddedGreenBackground,
  ChangedYellowBackground,
  RemovedRedBackground,
  secondary,
} from '../../../../theme';
import {
  ShapeExpandedContext,
  ShapeRenderContext,
  withShapeRenderContext,
  useDiff,
} from './ShapeRenderContext';
import CheckIcon from '@material-ui/icons/Check';
import {
  getOrUndefined,
  getOrUndefinedJson,
  headOrUndefined,
  JsonHelper,
  lengthScala,
  mapScala,
  getJson,
  toOption,
} from '@useoptic/domain';
import { withDiffContext } from '../DiffContext';
import { DepthContext, Indent, IndentIncrement } from './Indent';
import {
  HiddenItemEllipsis,
  Symbols,
  TypeName,
  useColor,
  useShapeViewerStyles,
} from './styles';
import { AnyShape } from './ShapeOnlyShapeRows';

export const DiffViewer = ({ shape }) => {
  const classes = useShapeViewerStyles();
  const containerRef = useRef(null);
  const { ref: compassTargetRef, compassState } = useCompassTargetTracker(true);
  const { diff, diffDescription } = useDiff();

  useEffect(() => {
    const containerEl = containerRef.current;
    compassTargetRef.current = containerEl.querySelector(
      `.${classes.isTracked} .${classes.right}`
    );

    return () => {
      compassTargetRef.current = null;
    };
  }, [diff && diff.toString()]); //may be undefined

  const onClickCompass = useCallback(
    (e) => {
      e.preventDefault();
      if (!compassTargetRef.current) return;

      scrollIntoView(compassTargetRef.current, {
        scrollMode: 'always',
        block: 'center',
      });
    },
    [diff && diff.toString()] //may be undefined
  );

  return (
    <div ref={containerRef} className={classes.root}>
      <DepthContext.Provider value={{ depth: 0 }}>
        {renderShape(shape)}
      </DepthContext.Provider>

      {diff && (
        <RowCompass
          changeType={diffDescription.changeTypeAsString}
          {...compassState}
          onClick={onClickCompass}
        />
      )}
    </div>
  );
};

function renderShape(shape, nested) {
  if (!shape) {
    return null;
  }

  switch (shape.baseShapeId) {
    case '$object':
      return <ObjectRender shape={shape} nested={Boolean(nested)} />;
    case '$list':
      return <ListRender shape={shape} nested={Boolean(nested)} />;
    default:
      return (
        <Row
          left={<ValueContents shape={shape} value={getJson(shape.example)} />}
        />
      );
  }
}

function getHighlightColor(changeType) {
  if (changeType === 'Addition') {
    return AddedGreenBackground;
  } else if (changeType === 'Update') {
    return ChangedYellowBackground;
  } else if (changeType === 'Removal') {
    return RemovedRedBackground;
  }
}

export const Row = withShapeRenderContext((props) => {
  const classes = useShapeViewerStyles();
  const { exampleOnly, onLeftClick } = props;

  const rowHighlightColor = getHighlightColor(props.changeType);

  return (
    <div
      className={classNames(classes.row, {
        [classes.rowWithHover]: !props.noHover,
        [classes.isTracked]: !!props.tracked, // important for the compass to work
      })}
      style={{ backgroundColor: rowHighlightColor }}
    >
      <div className={classes.left} onClick={onLeftClick}>
        {props.left}
      </div>
      {!exampleOnly && (
        <div className={classes.spacerBorder}>
          {' '.replace(/ /g, '\u00a0')}
        </div>
      )}
      {!exampleOnly && <div className={classes.right}>{props.right}</div>}
    </div>
  );
});
Row.displayName = 'ShapeViewer/Row';

function RowCompass(props) {
  const classes = useShapeViewerStyles();
  const highlightColor = getHighlightColor(props.changeType);
  const { x, width, isAbove, isBelow } = props;

  return (
    <div
      className={classNames(classes.rowCompass, {
        [classes.isAbove]: isAbove,
        [classes.isBelow]: isBelow,
      })}
      style={{
        left: x,
        width,
      }}
      onClick={props.onClick}
    >
      <div
        className={classes.rowCompassBody}
        style={{ backgroundColor: highlightColor }}
      >
        <ArrowDownwardIcon
          className={classNames(
            classes.rowCompassDirection,
            classes.rowCompassDirectionDown
          )}
        />
        <ArrowUpwardIcon
          className={classNames(
            classes.rowCompassDirection,
            classes.rowCompassDirectionUp
          )}
        />

        <DiffNotif />
      </div>
    </div>
  );
}

export const ObjectRender = withShapeRenderContext((props) => {
  const { shapeRender, shape, nested } = props;
  const fields = shape.fields;

  return (
    <>
      {!nested && (
        <Row
          left={<Symbols>{'{'}</Symbols>}
          right={<AssertionMetTypeName typeName={shape.name} />}
          noHover
        />
      )}
      {mapScala(fields)((field) => {
        const key = [field.fieldName, headOrUndefined(field.diffs)].join('-');

        return <FieldRow key={key} field={field} parent={shape} />;
      })}
      <IndentIncrement>
        <Row left={<Symbols withIndent>{'}'}</Symbols>} noHover />
      </IndentIncrement>
    </>
  );
});

export const ListRender = withShapeRenderContext((props) => {
  const classes = useShapeViewerStyles();
  const { shapeRender, shape, nested } = props;
  const { showAllLists } = useContext(ShapeExpandedContext);

  const listId = shape.id;

  const items = shape.itemsWithHidden(showAllLists.includes(listId));

  return (
    <>
      {!nested && (
        <Row
          left={<Symbols>{'['}</Symbols>}
          right={<AssertionMetTypeName typeName={shape.name} />}
          noHover
        />
      )}
      {mapScala(items)((item, index) => {
        return (
          <ItemRow
            key={index}
            item={item}
            listId={listId}
            isLast={index - 1 === lengthScala(items)}
          />
        );
      })}
      <IndentIncrement>
        <Row left={<Symbols withIndent>{']'}</Symbols>} noHover />
      </IndentIncrement>
    </>
  );
});

function FieldName({ children, missing }) {
  const classes = useShapeViewerStyles();
  return (
    <Typography
      variant="caption"
      className={classes.fieldName}
      style={{ opacity: missing ? 0.4 : 1 }}
    >
      {children}:
    </Typography>
  );
}

function IndexMarker({ children }) {
  const classes = useShapeViewerStyles();
  return (
    <Typography variant="caption" className={classes.indexMarker}>
      {children}:
    </Typography>
  );
}

function ValueRows({ value, shape }) {
  const classes = useShapeViewerStyles();
  const { shapeRender } = useContext(ShapeRenderContext);
  const jsTypeString = Object.prototype.toString.call(value);

  if (!shape) {
    return null;
  }

  if (shape.isOptional || shape.isNullable) {
    return <ValueRows value={value} shape={shape.innerShape} />;
  }

  if (jsTypeString === '[object Array]' || jsTypeString === '[object Object]') {
    return (
      <IndentIncrement add={1}>{renderShape(shape, true)}</IndentIncrement>
    );
  }

  return null;
}

function ValueContents({ value, shape }) {
  const classes = useShapeViewerStyles();
  const { shapeRender } = useContext(ShapeRenderContext);

  if (typeof value === 'undefined') {
    return null;
  }

  if (!shape) {
    return null;
  }

  const jsTypeString = Object.prototype.toString.call(value);

  if (shape.isOptional || shape.isNullable) {
    return <ValueContents value={value} shape={shape.innerShape} />;
  }

  if (jsTypeString === '[object Null]') {
    return <Symbols>{'null'}</Symbols>;
  }

  if (jsTypeString === '[object Array]') {
    return <Symbols>{'['}</Symbols>;
  }

  if (jsTypeString === '[object Object]') {
    return <Symbols>{'{'}</Symbols>;
  }

  if (jsTypeString === '[object String]') {
    return (
      <Typography
        variant="caption"
        component="pre"
        className={'fs-exclude'}
        style={{
          fontWeight: 600,
          whiteSpace: 'pre-line',
          wordBreak: 'break-all',
          overflowWrap: 'break-word',
          fontFamily: "'Source Code Pro', monospace",
          color: useColor.StringColor,
        }}
      >
        "{value}"
      </Typography>
    );
  }

  if (jsTypeString === '[object Boolean]') {
    return (
      <Typography
        variant="caption"
        className={'fs-exclude'}
        style={{
          fontWeight: 600,
          fontFamily: "'Source Code Pro', monospace",
          color: useColor.BooleanColor,
        }}
      >
        {value ? 'true' : 'false'}
      </Typography>
    );
  }

  if (jsTypeString === '[object Number]') {
    return (
      <Typography
        variant="caption"
        className={'fs-exclude'}
        style={{
          fontWeight: 600,
          fontFamily: "'Source Code Pro', monospace",
          color: useColor.NumberColor,
        }}
      >
        {value.toString()}
      </Typography>
    );
  }

  return null;
  // return <Typography variant="caption"
  //                    style={{color: colors[typeO]}}>{value.toString()}</Typography>;
}

const AssertionMetTypeName = ({ typeName, style }) => {
  const classes = useShapeViewerStyles();

  const { shapeRender } = useContext(ShapeRenderContext);

  if (!typeName) {
    return null;
  }

  const coloredComponents = typeName.asColoredString(shapeRender.specShapes);

  return (
    <div className={classes.assertionMet}>
      <CheckIcon
        style={{
          color: '#646464',
          height: 10,
          width: 10,
          marginTop: 6,
          marginRight: 6,
        }}
      />
      {mapScala(coloredComponents)((i, n) => {
        if (i.text) {
          return (
            <span key={n} style={{ whiteSpace: 'pre' }}>
              {i.text}
            </span>
          );
        }
      })}
    </div>
  );
};

export const DiffNotif = withShapeRenderContext(
  withDiffContext((props) => {
    const classes = useShapeViewerStyles();
    const { diffDescription } = props;

    return (
      <span className={classes.diffAssertion}>
        <WarningIcon style={{ color: secondary, height: 10, width: 10 }} />
        <span style={{ marginLeft: 6 }}>{diffDescription.assertion}</span>
      </span>
    );
  })
);

export const FieldRow = withShapeRenderContext((props) => {
  const classes = useShapeViewerStyles();
  const { field, parent, shapeRender, diffDescription, suggestion } = props;

  const missing = field.display === 'missing';
  //
  const fieldShape = getOrUndefined(field.exampleShape);
  const specShape = getOrUndefined(field.specShape);

  const example = getOrUndefinedJson(field.example);

  const diff = headOrUndefined(field.diffs);

  // spec shape for assertion

  const diffNotif = diff && <DiffNotif />;

  return (
    <>
      <Row
        tracked={!!diff}
        changeType={(() => {
          if (diff && suggestion) {
            return suggestion.changeTypeAsString;
          }

          if (diff) {
            return diffDescription.changeTypeAsString;
          }
        })()}
        left={
          <Indent>
            <div className={classes.rowContents}>
              <div>
                <FieldName missing={missing}>{field.fieldName}</FieldName>
              </div>
              <div style={{ flex: 1, paddingLeft: 4 }}>
                <ValueContents value={example} shape={fieldShape} />
              </div>
            </div>
          </Indent>
        }
        right={(() => {
          if (diffNotif && suggestion) {
            return (
              <div style={{ flex: 1, display: 'flex', marginLeft: 16 }}>
                {suggestion.changeTypeAsString !== 'Removal' && (
                  <TypeName
                    style={{ marginRight: 9 }}
                    typeName={specShape && specShape.name}
                  />
                )}
                <Typography
                  variant="caption"
                  className={classes.suggestion}
                  style={{
                    marginLeft:
                      suggestion.changeTypeAsString !== 'Removal' ? 15 : 0,
                  }}
                >
                  ({suggestion.changeTypeAsString})
                </Typography>
              </div>
            );
          }
          if (diffNotif) {
            return diffNotif;
          }

          if (fieldShape) {
            return (
              <AssertionMetTypeName typeName={specShape && specShape.name} />
            );
          }
        })()}
      />
      {/* this will insert nested rows */}
      <ValueRows value={example} shape={fieldShape} />
    </>
  );
});
FieldRow.displayName = 'ShapeViewers/FieldRow';

export const ItemRow = withShapeRenderContext((props) => {
  const classes = useShapeViewerStyles();
  const {
    item,
    shapeRender,
    isLast,
    listId,
    diffDescription,
    suggestion,
  } = props;

  const exampleItemShape = item.exampleShape;
  const listItemShape = getOrUndefined(item.specListItem);
  const diff = headOrUndefined(item.diffs);

  const diffNotif = diff && <DiffNotif />;

  return (
    <>
      <Row
        tracked={!!diff}
        changeType={(() => {
          if (diff && suggestion) {
            return suggestion.changeTypeAsString;
          }

          if (diff) {
            return diffDescription.changeTypeAsString;
          }
        })()}
        left={(() => {
          if (item.display === 'hidden') {
            return (
              <Indent>
                <HiddenItemEllipsis expandId={listId} />
              </Indent>
            );
          }

          return (
            <Indent>
              <div className={classes.rowContents}>
                <IndexMarker>{item.index}</IndexMarker>
                <div style={{ flex: 1, paddingLeft: 4 }}>
                  <ValueContents
                    value={getJson(item.example)}
                    shape={exampleItemShape}
                  />
                </div>
              </div>
            </Indent>
          );
        })()}
        right={(() => {
          if (diffNotif && suggestion) {
            return (
              <div style={{ flex: 1, display: 'flex', marginLeft: 16 }}>
                {suggestion.changeTypeAsString !== 'Removal' && (
                  <TypeName
                    style={{ marginRight: 9 }}
                    typeName={listItemShape.name}
                  />
                )}
                <Typography
                  variant="caption"
                  className={classes.suggestion}
                  style={{
                    marginLeft:
                      suggestion.changeTypeAsString !== 'Removal' ? 15 : 0,
                  }}
                >
                  ({suggestion.changeTypeAsString})
                </Typography>
              </div>
            );
          }
          if (diffNotif) {
            return diffNotif;
          }
          if (listItemShape) {
            return (
              <AssertionMetTypeName
                typeName={listItemShape.name}
              ></AssertionMetTypeName>
            );
          }
        })()}
      />
      {item.display !== 'hidden' && (
        <ValueRows value={getJson(item.example)} shape={exampleItemShape} />
      )}
    </>
  );
});

function useCompassTargetTracker(isEnabled) {
  const [compassState, setCompassState] = useState({
    isAbove: false,
    isBelow: false,
    x: null,
    width: null,
  });
  const elementRef = useRef(null);
  const animationRaf = useRef(null);

  const onAnimationFrame = useCallback(() => {
    if (!isEnabled || !window) return;
    const trackedEl = elementRef.current;

    if (!trackedEl) return;

    const viewportHeight = window.innerHeight;
    const boundingRect = trackedEl.getBoundingClientRect();

    const isAbove = boundingRect.bottom < 100;
    const isBelow = boundingRect.top - viewportHeight > 0;
    const { x, width } = boundingRect;

    if (
      isAbove !== compassState.isAbove ||
      isBelow !== compassState.isBelow ||
      x !== compassState.x ||
      width !== compassState.width
    ) {
      setCompassState({
        isAbove,
        isBelow,
        x,
        width,
      });
    }

    animationRaf.current = requestAnimationFrame(onAnimationFrame);
  }, [
    compassState.isAbove,
    compassState.isBelow,
    compassState.x,
    compassState.width,
  ]);

  // useEffect(() => {
  //   animationRaf.current = requestAnimationFrame(onAnimationFrame);
  //   return () => cancelAnimationFrame(animationRaf.current);
  // }, [onAnimationFrame]);

  return {
    ref: elementRef,
    compassState,
  };
}
