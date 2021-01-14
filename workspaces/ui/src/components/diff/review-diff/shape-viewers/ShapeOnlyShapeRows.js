import React, { useContext, useEffect, useState } from 'react';
import { TextField, Typography } from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import classNames from 'classnames';
import {
  AddedGreenBackground,
  ChangedYellowBackground,
  RemovedRedBackground,
} from '../../../../theme';
import {
  ShapeRenderContext,
  ShapeRenderStore,
  withShapeRenderContext,
} from './ShapeRenderContext';
import { getOrUndefined, mapScala } from '@useoptic/domain';

import { SymbolColor, Symbols, TypeName, useShapeViewerStyles } from './styles';
import { DepthContext, Indent, IndentIncrement } from './Indent';
import Paper from '@material-ui/core/Paper';
import Collapse from '@material-ui/core/Collapse';
import { RfcContext } from '../../../../contexts/RfcContext';
import { DESCRIPTION } from '../../../../ContributionKeys';
import { LightTooltip } from '../../../tooltips/LightTooltip';
import { FieldDescriptionMarkdownRender } from '../../../docs/DocContribution';
import { commandsForUpdatingContribution } from '../../../../engine/routines';

export function ShapeOnlyViewer(props) {
  const { preview, exampleOnly } = props;
  const classes = useShapeViewerStyles();

  if (!preview) {
    return null;
  }

  const rootShape = preview.rootId;
  const shape = getOrUndefined(preview.getRootShape);

  if (!shape) {
    throw new Error('Could not render root shape');
  }

  return (
    <ShapeRenderStore
      shape={preview}
      hideDivider={true}
      exampleOnly={exampleOnly}
    >
      <div className={classes.root}>
        <DepthContext.Provider value={{ depth: 0 }}>
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
      return <ObjectRender shape={shape} nested={Boolean(nested)} />;
      break;
    default:
      return <AnyShape shape={shape} />;
  }
}

export const AnyShape = (props) => {
  const classes = useShapeViewerStyles();
  const { shapeRender } = useContext(ShapeRenderContext);
  const { shape } = props;

  const [renderChild, setRenderChild] = useState(null);

  useEffect(() => {
    setRenderChild(null);
  }, [shape]);

  const setType = (link) => {
    if (link === renderChild) {
      return setRenderChild(null);
    }
    setRenderChild(link);
  };

  return (
    <>
      <Row
        left={(() => {
          return (
            <Indent>
              <div className={classes.rowContents}>
                <div style={{ flex: 1, paddingLeft: 4 }}>
                  <TypeName typeName={shape.name} onTypeClick={setType} />
                </div>
              </div>
            </Indent>
          );
        })()}
      />
      <Collapse in={!!renderChild}>
        {renderChild && (
          <Indent add={2}>
            <Paper className={classes.nested} elevation={6}>
              <DepthContext.Provider value={{ depth: 0 }}>
                {renderShape(
                  getOrUndefined(shapeRender.getSpecShape(renderChild))
                )}
              </DepthContext.Provider>
            </Paper>
          </Indent>
        )}
      </Collapse>
    </>
  );
};

export const Row = withShapeRenderContext((props) => {
  const classes = useShapeViewerStyles();

  const { exampleOnly, onLeftClick, stayHighlighted, hideDivider } = props;

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
    <div
      className={classNames(classes.row, {
        [classes.stayHighlighted]: stayHighlighted,
        [classes.rowWithHover]: !props.noHover,
      })}
      style={{ backgroundColor: rowHighlightColor }}
    >
      <div className={classes.left} onClick={onLeftClick}>
        {props.left}
      </div>
      {!exampleOnly && !hideDivider && (
        <div className={classes.spacerBorder}>
          {' '.replace(/ /g, '\u00a0')}
        </div>
      )}
      {!exampleOnly && (
        <div className={classes.right} style={{ width: '50%' }}>
          {props.right}
        </div>
      )}
    </div>
  );
});

export const ObjectRender = withShapeRenderContext((props) => {
  const classes = useShapeViewerStyles();
  const { shapeRender, shape, nested } = props;
  const fields = shape.fields;
  return (
    <>
      {!nested && <Row left={<Symbols>{'{'}</Symbols>} noHover />}
      {mapScala(fields)((field) => (
        <FieldRow field={field} />
      ))}
      <IndentIncrement>
        <Row left={<Symbols withIndent>{'}'}</Symbols>} noHover />
      </IndentIncrement>
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

function ValueRows({ shape }) {
  const classes = useShapeViewerStyles();
  return <IndentIncrement add={1}>{renderShape(shape, true)}</IndentIncrement>;
}

function FieldDescription({ fieldId }) {
  const classes = useShapeViewerStyles();
  const { cachedQueryResults, handleCommands } = useContext(RfcContext);
  const { contributions } = cachedQueryResults;

  const description = contributions.getOrUndefined(fieldId, DESCRIPTION);

  const [editing, _setEditing] = useState(false);
  const setEditing = (condition) => {
    if (process.env.REACT_APP_SPEC_ENABLE_EDITING === 'no') {
      return;
    }
    _setEditing(condition);
  };
  const [stagedContent, setStagedContent] = useState(description || '');

  const handleChange = (e) => setStagedContent(e.target.value);
  const displayDescription = description || stagedContent;
  const finalize = () => {
    if (stagedContent !== description) {
      handleCommands(
        ...commandsForUpdatingContribution(fieldId, DESCRIPTION, stagedContent)
      );
    }
    setEditing(false);
  };

  return (
    <div
      className={classes.fieldDescription}
      style={{ justifyContent: 'flex-end' }}
    >
      {editing && (
        <TextField
          value={stagedContent}
          onChange={handleChange}
          onBlur={finalize}
          autoFocus
          fullWidth={true}
          multiline={true}
          inputProps={{ onBlur: finalize, style: { color: SymbolColor } }}
          size="small"
        />
      )}
      {!editing && displayDescription && (
        <div style={{ flex: 1 }} onClick={() => setEditing(true)}>
          <FieldDescriptionMarkdownRender
            source={displayDescription}
            noHeadings={true}
          />
        </div>
      )}
      {!description &&
        !editing &&
        process.env.REACT_APP_SPEC_ENABLE_EDITING !== 'no' && (
          <LightTooltip title="Add Field Description">
            <DescriptionIcon
              className={'descriptionButton'}
              onClick={() => setEditing(true)}
              style={{
                width: 15,
                display: 'none',
                height: 15,
                cursor: 'pointer',
                color: SymbolColor,
              }}
              color="primary"
            />
          </LightTooltip>
        )}
    </div>
  );
}

export const FieldRow = withShapeRenderContext((props) => {
  const classes = useShapeViewerStyles();
  const { field, shapeRender } = props;
  const fieldName = field.fieldName;
  const fieldShape = field.shape;

  const fieldId = field.specFieldId;

  const [renderChild, setRenderChild] = useState(null);

  useEffect(() => {
    setRenderChild(null);
  }, [fieldShape]);

  const setType = (link) => {
    if (link === renderChild) {
      return setRenderChild(null);
    }
    setRenderChild(link);
  };

  return (
    <>
      <Row
        stayHighlighted={Boolean(renderChild)}
        left={
          <Indent>
            <div className={classes.rowContents}>
              <div>
                <FieldName>{fieldName}</FieldName>
              </div>
              <div style={{ flex: 1, paddingLeft: 4 }}>
                {fieldShape.isObject ? (
                  <Symbols children={'{'} />
                ) : (
                  <TypeName typeName={fieldShape.name} onTypeClick={setType} />
                )}
              </div>
            </div>
          </Indent>
        }
        right={<FieldDescription fieldId={fieldId} />}
      />
      {/* this will insert nested rows */}
      {fieldShape && fieldShape.isObject ? (
        <ValueRows shape={fieldShape} />
      ) : (
        <Collapse in={!!renderChild}>
          {renderChild && (
            <Indent add={2}>
              <Paper className={classes.nested} elevation={6}>
                <DepthContext.Provider value={{ depth: 0 }}>
                  {renderShape(
                    getOrUndefined(shapeRender.getSpecShape(renderChild))
                  )}
                </DepthContext.Provider>
              </Paper>
            </Indent>
          )}
        </Collapse>
      )}
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
