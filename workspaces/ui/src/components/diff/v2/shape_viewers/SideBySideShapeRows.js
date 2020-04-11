import React, {useContext} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Typography} from '@material-ui/core';
import classNames from 'classnames';
import Toolbar from '@material-ui/core/Toolbar';
import WarningIcon from '@material-ui/icons/Warning';
import {AddedGreenBackground, ChangedYellowBackground, primary, RemovedRedBackground, secondary} from '../../../../theme';
import withStyles from '@material-ui/core/styles/withStyles';
import Tooltip from '@material-ui/core/Tooltip';
import {ShapeExpandedContext, ShapeRenderContext, withShapeRenderContext} from './ShapeRenderContext';
import CheckIcon from '@material-ui/icons/Check';
import {
  getOrUndefined,
  mapScala,
  getOrUndefinedJson,
  headOrUndefined,
  CompareEquality,
  lengthScala, toOption
} from '@useoptic/domain';
import {withDiffContext} from '../DiffContext';
import {Indent, IndentIncrement, DepthContext} from './Indent';
import {HiddenItemEllipsis, TypeName, useColor, useShapeViewerStyles} from './styles';

export const DiffViewer = ({shape}) => {
  const classes = useShapeViewerStyles();
  return (
    <div className={classes.root}>
      <DepthContext.Provider value={{depth: 0}}>
        {renderShape(shape)}
      </DepthContext.Provider>
    </div>
  );
};

function renderShape(shape, nested) {

  if (!shape) {
    return null;
  }

  switch (shape.baseShapeId) {
    case '$object':
      return (
        <ObjectRender shape={shape} nested={Boolean(nested)}/>
      );
      break;
    case '$list':
      return <ListRender shape={shape} nested={Boolean(nested)}/>;
      break;
  }
}

export const Row = withShapeRenderContext((props) => {
  const classes = useShapeViewerStyles();

  const {exampleOnly, onLeftClick} = props;

  const rowHighlightColor = (() => {
    if (props.highlight === 'Addition') {
      return AddedGreenBackground;
    } else if (props.highlight === 'Update') {
      return ChangedYellowBackground;
    } else if (props.highlight === 'Removal') {
      return RemovedRedBackground;
    }
  })();

  return (
    <div className={classNames(classes.row, {[classes.rowWithHover]: !props.noHover})}
         style={{backgroundColor: rowHighlightColor}}>
      <div className={classes.left} onClick={onLeftClick}>{props.left}</div>
      {!exampleOnly && <div className={classes.spacerBorder}>{' '.replace(/ /g, '\u00a0')}</div>}
      {!exampleOnly && <div className={classes.right}>{props.right}</div>}
    </div>
  );
});

export const ObjectRender = withShapeRenderContext((props) => {
  const classes = useShapeViewerStyles();
  const {shapeRender, shape, nested} = props;
  const fields = shapeRender.resolveFields(shape.fields);

  const objectId = shape.shapeId;

  return (
    <>
      {!nested && <Row left={<Symbols>{'{'}</Symbols>} right={<AssertionMetTypeName typeName={shape.name}/>} noHover/>}
      {mapScala(fields)(field => <FieldRow field={field}/>)}
      <IndentIncrement><Row left={<Symbols withIndent>{'}'}</Symbols>} noHover/></IndentIncrement>
    </>
  );
});

export const ListRender = withShapeRenderContext((props) => {
  const classes = useShapeViewerStyles();
  const {shapeRender, shape, nested} = props;
  const listId = shape.shapeId;
  const listItem = getOrUndefined(shapeRender.listItemShape(listId));

  const {showAllLists} = useContext(ShapeExpandedContext);

  const items = shapeRender.resolvedItems(shape.shapeId, !showAllLists.includes(listId));

  return (
    <>
      {!nested && <Row left={<Symbols>{'['}</Symbols>} right={<AssertionMetTypeName typeName={shape.name}/>} noHover/>}
      {mapScala(items)((item, index) => {
        return <ItemRow item={item}
                        listItemShape={listItem}
                        listId={listId}
                        isLast={index - 1 === lengthScala(items)}/>;
      })}
      <IndentIncrement><Row left={<Symbols withIndent>{']'}</Symbols>} noHover/></IndentIncrement>
    </>
  );
});

function FieldName({children, missing}) {
  const classes = useShapeViewerStyles();
  return (
    <Typography variant="caption" className={classes.fieldName}
                style={{opacity: missing ? .4 : 1}}>{children}:</Typography>
  );
}

function IndexMarker({children}) {
  const classes = useShapeViewerStyles();
  return (
    <Typography variant="caption" className={classes.indexMarker}>{children}:</Typography>
  );
}

function ValueRows({value, shape}) {
  const classes = useShapeViewerStyles();
  const {shapeRender} = useContext(ShapeRenderContext);
  const jsTypeString = Object.prototype.toString.call(value);

  if (shape.isOptional || shape.isNullable) {
    return <ValueRows value={value} shape={getOrUndefined(shapeRender.unwrapInner(shape))}/>
  }

  if (jsTypeString === '[object Array]' || jsTypeString === '[object Object]') {
    return <IndentIncrement add={1}>{renderShape(shape, true)}</IndentIncrement>;
  }

  return null;
}

function ValueContents({value, shape}) {
  const classes = useShapeViewerStyles();
  const {shapeRender} = useContext(ShapeRenderContext);

  if (typeof value === 'undefined') {
    return null;
  }

  const jsTypeString = Object.prototype.toString.call(value);

  if (shape.isOptional || shape.isNullable) {
    return <ValueContents value={value} shape={getOrUndefined(shapeRender.unwrapInner(shape))}/>
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
    return <Typography variant="caption"
                       component="pre"
                       style={{
                         fontWeight: 600,
                         whiteSpace: 'pre-line',
                         fontFamily: '\'Source Code Pro\', monospace',
                         color: useColor.StringColor
                       }}>"{value}"</Typography>;
  }

  if (jsTypeString === '[object Boolean]') {
    return <Typography variant="caption"
                       style={{
                         fontWeight: 600,
                         fontFamily: '\'Source Code Pro\', monospace',
                         color: useColor.BooleanColor
                       }}>{value ? 'true' : 'false'}</Typography>;
  }

  if (jsTypeString === '[object Number]') {
    return <Typography variant="caption"
                       style={{
                         fontWeight: 600,
                         fontFamily: '\'Source Code Pro\', monospace',
                         color: useColor.NumberColor
                       }}>{value.toString()}</Typography>;
  }


  return null;
  // return <Typography variant="caption"
  //                    style={{color: colors[typeO]}}>{value.toString()}</Typography>;
}


const AssertionMetTypeName = ({typeName, style}) => {
  const classes = useShapeViewerStyles();

  const {shapeRender} = useContext(ShapeRenderContext);

  if (!typeName) {
    return null;
  }

  const coloredComponents = typeName.asColoredString(shapeRender);

  return (<div className={classes.assertionMet}>
    <CheckIcon style={{color: '#646464', height: 10, width: 10, marginTop: 6, marginRight: 6}}/>
    {mapScala(coloredComponents)((i) => {
      if (i.text) {
        return <span style={{whiteSpace: 'pre'}}>{i.text}</span>;
      }
    })}
  </div>);
};

function Symbols({children, withIndent}) {
  const classes = useShapeViewerStyles();

  const symbol = <Typography variant="caption" className={classes.symbols}>{children}</Typography>;

  if (withIndent) {
    return (
      <Indent add={-1}>
        {symbol}
      </Indent>
    );
  } else {
    return symbol;
  }

}


export const DiffNotif = withShapeRenderContext(withDiffContext((props) => {
  const classes = useShapeViewerStyles();
  const {diffDescription} = props;

  return (
    <span className={classes.diffAssertion}>
      <WarningIcon style={{color: secondary, height: 10, width: 10}}/>
      <span style={{marginLeft: 6}}>{diffDescription.assertion}</span>
    </span>
  );

}));

export const FieldRow = withShapeRenderContext((props) => {
  const classes = useShapeViewerStyles();
  const {field, shapeRender, diffDescription, suggestion} = props;

  const missing = field.display === 'missing';

  const fieldShape = getOrUndefined(shapeRender.resolveFieldShape(field.field)) || {};
  const example = getOrUndefinedJson(field.field.exampleValue) || (fieldShape && getOrUndefinedJson(fieldShape.exampleValue))

  const diff = headOrUndefined(field.field.diffs);

  const diffNotif = diff && (
    <DiffNotif/>
  );

  return (
    <>
      <Row
        highlight={(() => {
          if (diff && suggestion) {
            return suggestion.changeTypeAsString;
          }

          if (diff) {
            return diffDescription.changeTypeAsString;
          }
        })()}
        left={(
          <Indent>
            <div className={classes.rowContents}>
              <div>
                <FieldName missing={missing}>{field.fieldName}</FieldName>
              </div>
              <div style={{flex: 1, paddingLeft: 4}}>
                <ValueContents value={example} shape={fieldShape}/>
              </div>
            </div>
          </Indent>
        )}
        right={(() => {
          if (diffNotif && suggestion) {

            return <div style={{flex: 1, display: 'flex', marginLeft: 16}}>
              {suggestion.changeTypeAsString !== 'Removal' &&
              <TypeName style={{marginRight: 9}} typeName={fieldShape.name}/>}
              <Typography variant="caption" className={classes.suggestion}
                          style={{marginLeft: suggestion.changeTypeAsString !== 'Removal' ? 15 : 0}}>
                ({suggestion.changeTypeAsString})
              </Typography>
            </div>;
          }

          if (diffNotif) {
            return diffNotif;
          }

          if (fieldShape) {
            return <AssertionMetTypeName typeName={fieldShape.name}></AssertionMetTypeName>;
          }
        })()}
      />
      {/* this will insert nested rows */}
      <ValueRows value={example} shape={fieldShape}/>
    </>
  );
});


export const ItemRow = withShapeRenderContext((props) => {
  const classes = useShapeViewerStyles();
  const {item, shapeRender, isLast, listId, listItemShape, diffDescription, suggestion} = props;
  const diff = headOrUndefined(item.item.diffs);

  const exampleItemShape = shapeRender.getUnifiedShape(item.item.itemId)
  const resolvedShape = getOrUndefined(shapeRender.resolveItemShape(toOption(listItemShape))) || getOrUndefined(shapeRender.resolveItemShapeFromShapeId(item.item.shapeId));

  const diffNotif = diff && (
    <DiffNotif/>
  );

  return (
    <>
      <Row
        highlight={(() => {
          if (diff && suggestion) {
            return suggestion.changeTypeAsString;
          }

          if (diff) {
            return diffDescription.changeTypeAsString;
          }
        })()}
        left={(() => {

          if (item.display === 'hidden') {
            return <Indent><HiddenItemEllipsis expandId={listId}/></Indent>;
          }

          return (<Indent>
              <div className={classes.rowContents}>
                <IndexMarker>{item.index}</IndexMarker>
                <div style={{flex: 1, paddingLeft: 4}}>
                  <ValueContents value={getOrUndefinedJson(item.item.exampleValue)} shape={exampleItemShape}/>
                </div>
              </div>
            </Indent>
          );
        })()}
        right={(() => {

          if (diffNotif && suggestion) {
            return <div style={{flex: 1, display: 'flex', marginLeft: 16}}>
              {suggestion.changeTypeAsString !== 'Removal' &&
              <TypeName style={{marginRight: 9}} typeName={listItemShape.name}/>}
              <Typography variant="caption" className={classes.suggestion}
                          style={{marginLeft: suggestion.changeTypeAsString !== 'Removal' ? 15 : 0}}>
                ({suggestion.changeTypeAsString})
              </Typography>
            </div>;
          }
          if (diffNotif) {
            return diffNotif;
          }
          if (listItemShape) {
            return <AssertionMetTypeName typeName={listItemShape.name}></AssertionMetTypeName>;
          }
        })()}
      />
      {item.display !== 'hidden' &&
      <ValueRows value={getOrUndefinedJson(item.item.exampleValue)} shape={exampleItemShape}/>}
    </>
  );
});
