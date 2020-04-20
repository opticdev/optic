import React, {useContext} from 'react';
import {Typography} from '@material-ui/core';
import classNames from 'classnames';
import {AddedGreenBackground, ChangedYellowBackground, RemovedRedBackground} from '../../../../theme';
import {ShapeExpandedContext, ShapeRenderStore, withShapeRenderContext} from './ShapeRenderContext';
import {getOrUndefined, getOrUndefinedJson, lengthScala, mapScala, toOption} from '@useoptic/domain';

import {HiddenItemEllipsis, Symbols, TypeName, useColor, useShapeViewerStyles} from './styles';
import {DepthContext, Indent, IndentIncrement} from './Indent';

export function ShapeOnlyViewer(props) {
  const {preview} = props;
  const classes = useShapeViewerStyles();

  const rootShape = preview.rootId;
  const shape = getOrUndefined(preview.getRootShape)

  if (!shape) {
    throw new Error('Could not render root shape')
  }

  return (
    <ShapeRenderStore shape={preview} exampleOnly={true}>
      <div className={classes.root}>
        <DepthContext.Provider value={{depth: 0}}>
          {renderShape(shape)}
        </DepthContext.Provider>
      </div>
    </ShapeRenderStore>
  );
}


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
    default:
      return (
        <AnyShape shape={shape} />
      )
  }
}
export const AnyShape = (props) => {
  const classes = useShapeViewerStyles();
  const {shape} = props
  return (
    <Row
      left={(() => {
        return (<Indent>
            <div className={classes.rowContents}>
              <div style={{flex: 1, paddingLeft: 4}}>
                <TypeName typeName={shape.name} />
              </div>
            </div>
          </Indent>
        );
      })()}
    />
  )
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
  const fields = shape.fields
  return (
    <>
      {!nested && <Row left={<Symbols>{'{'}</Symbols>} noHover />}
      {mapScala(fields)(field => <FieldRow field={field}/>)}
      <IndentIncrement><Row left={<Symbols withIndent>{'}'}</Symbols>} noHover/></IndentIncrement>
    </>
  );
});

// export const ListRender = withShapeRenderContext((props) => {
//   const classes = useShapeViewerStyles();
//   const {shapeRender, shape, nested} = props;
//   const listId = shape.shapeId;
//   const listItem = getOrUndefined(shapeRender.listItemShape(listId));
//
//
//   const {showAllLists} = useContext(ShapeExpandedContext);
//
//   const items = shapeRender.resolvedItems(shape.shapeId, !showAllLists.includes(listId));
//
//   return (
//     <>
//       {!nested && <Row left={<Symbols>{'['}</Symbols>} noHover/>}
//       {mapScala(items)((item, index) => {
//         return <ItemRow item={item}
//                         listItemShape={listItem}
//                         listId={listId}
//                         isLast={index - 1 === lengthScala(items)}/>;
//       })}
//       <IndentIncrement><Row left={<Symbols withIndent>{']'}</Symbols>} noHover/></IndentIncrement>
//     </>
//   );
// });

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

  const jsTypeString = Object.prototype.toString.call(value);

  if (jsTypeString === '[object Array]' || jsTypeString === '[object Object]') {
    return <IndentIncrement add={1}>{renderShape(shape, true)}</IndentIncrement>;
  }

  return null;
}



export const FieldRow = withShapeRenderContext((props) => {
  const classes = useShapeViewerStyles();
  const {field, shapeRender} = props;
  const fieldName = field.name
  const fieldShape = field.shape

  return (
    <>
      <Row
        left={(
          <Indent>
            <div className={classes.rowContents}>
              <div>
                <FieldName>{field.fieldName}</FieldName>
              </div>
              <div style={{flex: 1, paddingLeft: 4}}>
                <TypeName typeName={fieldShape.name} />
              </div>
            </div>
          </Indent>
        )}
      />
      {/* this will insert nested rows */}
      <ValueRows shape={fieldShape}/>
    </>
  );
});


// export const ItemRow = withShapeRenderContext((props) => {
//   const classes = useShapeViewerStyles();
//   const {item, shapeRender, isLast, listId, listItemShape} = props;
//
//   const resolvedShape = getOrUndefined(shapeRender.resolveItemShape(toOption(listItemShape))) || getOrUndefined(shapeRender.resolveItemShapeFromShapeId(item.item.shapeId));
//
//
//   return (
//     <>
//       <Row
//         left={(() => {
//
//           if (item.display === 'hidden') {
//             return <Indent><HiddenItemEllipsis expandId={listId}/></Indent>;
//           }
//
//           return (<Indent>
//               <div className={classes.rowContents}>
//                 <IndexMarker>{item.index}</IndexMarker>
//                 <div style={{flex: 1, paddingLeft: 4}}>
//                   <TypeName typeName={resolvedShape.name} />
//                 </div>
//               </div>
//             </Indent>
//           );
//         })()}
//       />
//       {item.display !== 'hidden' &&
//       <ValueRows value={getOrUndefinedJson(item.item.exampleValue)} shape={resolvedShape}/>}
//     </>
//   );
// });
