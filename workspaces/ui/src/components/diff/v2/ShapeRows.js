import React, {useContext} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Typography} from '@material-ui/core';
import classNames from 'classnames';
import Toolbar from '@material-ui/core/Toolbar';
import WarningIcon from '@material-ui/icons/Warning';
import {AddedGreenBackground, ChangedYellowBackground, primary, RemovedRedBackground, secondary} from '../../../theme';
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
import {withDiffContext} from './DiffContext';
import Paper from '@material-ui/core/Paper';
import Menu from '@material-ui/core/Menu';
import {InterpretationRow} from './DiffViewer';
import {DocSubGroup} from '../../requests/DocSubGroup';
import {IgnoreDiffContext} from './DiffPageNew';
import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#16203F'
  },
  row: {
    display: 'flex',
    padding: 0,
    paddingLeft: 4,
    flexDirection: 'row',
  },
  rowWithHover: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(78,165,255,0.27) !important',
    },
  },
  menu: {
    userSelect: 'none'
  },
  suggestion: {
    fontStyle: 'italic',
    color: 'white',
    flex: 1,
    textAlign: 'right',
    paddingRight: 10
  },
  hiddenItem: {
    color: '#070707',
    fontSize: 10,
    paddingLeft: 7,
    paddingRight: 7,
    backgroundColor: '#ababab',
    borderRadius: 12
  },
  symbols: {
    color: '#cfcfcf',
    fontWeight: 800,
    fontFamily: '\'Source Code Pro\', monospace'
  },
  value: {
    fontWeight: 600,
    fontFamily: '\'Source Code Pro\', monospace'
  },
  fieldName: {
    fontWeight: 600,
    color: '#cfcfcf',
    fontSize: 12,
    fontFamily: '\'Source Code Pro\', monospace'
  },
  indexMarker: {
    fontWeight: 500,
    color: '#9cdcfe',
    fontSize: 12,
    fontFamily: '\'Source Code Pro\', monospace'
  },
  rowContents: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  left: {
    flex: 1,
    display: 'flex',
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 5
  },
  spacerBorder: {
    maxWidth: 1,
    backgroundColor: '#4B5A8C'
  },
  right: {
    display: 'flex',
    paddingLeft: 5,
    paddingTop: 3,
    paddingBottom: 3,
    flex: 1,
  },
  typeName: {
    display: 'flex',
    whiteSpace: 'pre',
    flex: 1,
    fontWeight: 600,
    fontFamily: '\'Source Code Pro\', monospace'
  },
  assertionMet: {
    display: 'flex',
    whiteSpace: 'pre',
    flex: 1,
    fontWeight: 400,
    color: '#646464',
    fontStyle: 'italic',
    fontFamily: '\'Source Code Pro\', monospace'
  },
  diffAssertion: {
    color: '#f8edf4',
    flex: 1,
    fontSize: 14,
    fontWeight: 800,
    fontFamily: '\'Source Code Pro\', monospace'
  },
  toolbar: {
    alignItems: 'flex-start',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  dash: {
    fontWeight: 500,
    marginLeft: -10,
    color: primary
  }
}));


export const DiffViewer = ({shape}) => {
  const classes = useStyles();
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

export const DepthContext = React.createContext({depth: 0});

const Indent = ({children, add = 1, style}) => {
  return (
    <DepthContext.Consumer>
      {({depth}) => (
        <div style={{paddingLeft: (depth + add) * 13, ...style}}>
          <DepthContext.Provider value={{depth: depth + add}}>
            {children}
          </DepthContext.Provider>
        </div>
      )}
    </DepthContext.Consumer>
  );
};

const IndentIncrement = ({children, add = 1}) => {
  return (
    <DepthContext.Consumer>
      {({depth}) => (
        <DepthContext.Provider value={{depth: depth + add}}>
          {children}
        </DepthContext.Provider>
      )}
    </DepthContext.Consumer>
  );
};


export const Row = withShapeRenderContext((props) => {
  const classes = useStyles();

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
  const classes = useStyles();
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
  const classes = useStyles();
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
  const classes = useStyles();
  return (
    <Typography variant="caption" className={classes.fieldName}
                style={{opacity: missing ? .4 : 1}}>{children}:</Typography>
  );
}

function IndexMarker({children}) {
  const classes = useStyles();
  return (
    <Typography variant="caption" className={classes.indexMarker}>{children}:</Typography>
  );
}


const useColor = {
  StringColor: '#e29f84',
  NumberColor: '#09885a',
  BooleanColor: '#E3662E',
  ObjectColor: '#30B1C4',
  ListColor: '#c47078',
  modifier: '#d5d4ff'
};


function ValueRows({value, shape}) {
  const classes = useStyles();

  const jsTypeString = Object.prototype.toString.call(value);

  if (jsTypeString === '[object Array]' || jsTypeString === '[object Object]') {
    return <IndentIncrement add={1}>{renderShape(shape, true)}</IndentIncrement>;
  }

  return null;
}

function ValueContents({value, shape}) {
  const classes = useStyles();

  if (typeof value === 'undefined') {
    return null;
  }

  const jsTypeString = Object.prototype.toString.call(value);

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

const TypeName = ({typeName, style}) => {
  const classes = useStyles();

  const {shapeRender} = useContext(ShapeRenderContext);

  if (!typeName) {
    return null;
  }

  const coloredComponents = typeName.asColoredString(shapeRender);

  return (<div className={classes.typeName}>{mapScala(coloredComponents)((i) => {
    if (i.text) {
      return <span style={{color: useColor[i.color] || i.color}}>{i.text}{' '}</span>;
    }
  })}
  </div>);
};

const AssertionMetTypeName = ({typeName, style}) => {
  const classes = useStyles();

  const {shapeRender} = useContext(ShapeRenderContext);

  if (!typeName) {
    return null;
  }

  const coloredComponents = typeName.asColoredString(shapeRender);

  return (<div className={classes.assertionMet}>
    <CheckIcon style={{color: '#646464', height: 10, width: 10, marginTop: 6, marginRight: 6}}/>
    {mapScala(coloredComponents)((i) => {
      if (i.text) {
        return <span>{i.text}{' '}</span>;
      }
    })}
  </div>);
};

function Symbols({children, withIndent}) {
  const classes = useStyles();

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
  const classes = useStyles();
  const {diffDescription} = props;

  return (
    <span className={classes.diffAssertion}>
      <WarningIcon style={{color: secondary, height: 10, width: 10}}/>
      <span style={{marginLeft: 6}}>{diffDescription.assertion}</span>
    </span>
  );


}));

export const FieldRow = withShapeRenderContext((props) => {
  const classes = useStyles();
  const {field, shapeRender, diffDescription, suggestion} = props;

  const missing = field.display === 'missing';

  const fieldShape = getOrUndefined(shapeRender.resolveFieldShape(field.field)) || {};

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
                <ValueContents value={getOrUndefinedJson(field.field.exampleValue)} shape={fieldShape}/>
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
      <ValueRows value={getOrUndefinedJson(field.field.exampleValue)} shape={fieldShape}/>
    </>
  );
});


export const ItemRow = withShapeRenderContext((props) => {
  const classes = useStyles();
  const {item, shapeRender, isLast, listId, listItemShape, diffDescription, suggestion} = props;
  const diff = headOrUndefined(item.item.diffs);

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
                  <ValueContents value={getOrUndefinedJson(item.item.exampleValue)} shape={resolvedShape}/>
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
      <ValueRows value={getOrUndefinedJson(item.item.exampleValue)} shape={resolvedShape}/>}
    </>
  );
});

export const HiddenItemEllipsis = withShapeRenderContext((props) => {
  const classes = useStyles();
  const {setShowAllLists} = useContext(ShapeExpandedContext);
  const {expandId} = props;
  return (<DiffToolTip placement="right" title="(Hidden) Click to Expand">
    <div className={classes.hiddenItem} onClick={() => setShowAllLists(expandId, true)}>{'⋯'}</div>
  </DiffToolTip>);
});


export const DiffToolTip = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#2A3B72',
    color: 'rgba(247, 248, 240, 1)',
    boxShadow: theme.shadows[1],
    maxWidth: 200,
    fontSize: 11,
    fontWeight: 200,
    padding: 4,
  },
}))(Tooltip);
