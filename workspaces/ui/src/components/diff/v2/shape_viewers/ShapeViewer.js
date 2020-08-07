import React, { useCallback, useReducer } from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import { useColor, useShapeViewerStyles, SymbolColor } from './styles';
import _isEqual from 'lodash.isequal';
import _get from 'lodash.get';

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

export default function ShapeViewer({ diff, interaction }) {
  const generalClasses = useShapeViewerStyles();

  // const initialState = useMemo(() => createRows({ diff, interaction }), []); // based on diff and interaction, we build initial state once

  const [{ rows, collapsedTrails }, dispatch] = useReducer(
    updateState,
    { diff, interaction },
    createInitialState
  );

  console.log({ collapsedTrails, rows });

  return (
    <div className={generalClasses.root}>
      {rows.map((row, index) => (
        <Row key={row.id} index={index} {...row} dispatch={dispatch} />
      ))}
    </div>
  );
}

export function Row(props) {
  const classes = useStyles();
  const generalClasses = useShapeViewerStyles();
  const {
    indent,
    index,
    seqIndex,
    fieldName,
    fieldValue,
    missing,
    type,

    dispatch,
  } = props;

  const onRowClick = useCallback(
    (e) => {
      e.preventDefault();
      if (type === 'array_item_collapsed') {
        dispatch({ type: 'unfold', payload: index });
      }
    },
    [index, type, dispatch]
  );

  const indentPadding = ' '.repeat(indent * 2);

  return (
    <div
      className={classNames(generalClasses.row, {
        [generalClasses.rowWithHover]: !props.noHover,
        [generalClasses.isTracked]: !!props.tracked, // important for the compass to work
      })}
    >
      <div className={generalClasses.left} onClick={onRowClick}>
        <div className={classes.rowContent}>
          {indentPadding}
          <RowFieldName type={type} name={fieldName} missing={!!missing} />
          <RowSeqIndex type={type} index={seqIndex} missing={!!missing} />
          {!missing && <RowValue type={type} value={fieldValue} />}
        </div>
      </div>
    </div>
  );
}
Row.displayName = 'ShapeViewer/Row';

function RowValue({ type, value }) {
  const generalClasses = useShapeViewerStyles();
  const classes = useStyles();

  if (type === 'null') {
    return (
      <span
        className={classNames(generalClasses.symbols, classes.symbolContent)}
      >
        {'null'}
      </span>
    );
  }

  if (type === 'array_open') {
    return (
      <span
        className={classNames(generalClasses.symbols, classes.symbolContent)}
      >
        {'['}
      </span>
    );
  }

  if (type === 'array_item_collapsed') {
    return <span>COLLAPSED</span>;
  }

  if (type === 'array_close') {
    return (
      <span
        className={classNames(generalClasses.symbols, classes.symbolContent)}
      >
        {']'}
      </span>
    );
  }

  if (type === 'object_open') {
    return (
      <span
        className={classNames(generalClasses.symbols, classes.symbolContent)}
      >
        {'{'}
      </span>
    );
  }

  if (type === 'object_close') {
    return (
      <span
        className={classNames(generalClasses.symbols, classes.symbolContent)}
      >
        {'}'}
      </span>
    );
  }

  if (type === 'string') {
    return <span className={classes.stringContent}>"{value}"</span>;
  }

  if (type === 'boolean') {
    return <span>{value ? 'true' : 'false'}</span>;
  }

  if (type === 'number') {
    return <span>{value}</span>;
  }

  throw new Error(`Cannot render RowValue for type '${type}'`);
}
RowValue.displayName = 'ShapeViewer/RowValue';

function RowFieldName({ type, name, missing }) {
  const classes = useStyles();
  if (!name) return null;
  return (
    <span
      className={classNames(classes.fieldName, {
        [classes.isMissing]: !!missing,
      })}
    >
      {name}:{' '}
    </span>
  );
}

function RowSeqIndex({ type, index, missing }) {
  const classes = useStyles();
  if (!index && index !== 0) return null;
  return (
    <span
      className={classNames(classes.fieldIndex, {
        [classes.isMissing]: !!missing,
      })}
    >
      {index}:{' '}
    </span>
  );
}

const useStyles = makeStyles((theme) => ({
  rowContent: {
    fontSize: 12,
    fontFamily: "'Source Code Pro', monospace",
    whiteSpace: 'pre',
    color: SymbolColor,
  },

  booleanContent: {
    fontWeight: 600,
    fontFamily: "'Source Code Pro', monospace",
    color: useColor.BooleanColor,
  },

  symbolContent: {
    color: SymbolColor,
  },

  numberContent: {
    fontWeight: 600,
    fontFamily: "'Source Code Pro', monospace",
    color: useColor.NumberColor,
  },

  stringContent: {
    fontWeight: 600,
    whiteSpace: 'pre-line',
    wordBreak: 'break-all',
    overflowWrap: 'break-word',
    fontFamily: "'Source Code Pro', monospace",
    color: useColor.StringColor,
  },

  fieldName: {
    fontWeight: 600,
    color: '#cfcfcf',
    fontSize: 12,
    fontFamily: "'Source Code Pro', monospace",

    opacity: 1,

    '&$isMissing': {
      opacity: 0.4,
    },
  },

  fieldIndex: {
    fontWeight: 500,
    color: '#9cdcfe',
    fontSize: 12,
    fontFamily: "'Source Code Pro', monospace",

    opacity: 1,

    '&$isMissing': {
      opacity: 0.4,
    },
  },

  isMissing: {},
}));

// creating rows is a mutative process, to prevent a lot of re-alloctions for big bodies
function createInitialState({ diff, interaction }) {
  let body = diff.inRequest
    ? interaction.request.body
    : interaction.response.body;

  const shape = JsonHelper.toJs(body.jsonOption);

  const [rows, collapsedTrails] = shapeRows(shape);
  for (let row of rows) {
    row.id = `${row.trail.join('.') || 'root'}-${row.type}`;
  }

  return { body: shape, rows, collapsedTrails };
}

function updateState(state, action) {
  switch (action.type) {
    case 'unfold':
      let index = action.payload;
      return unfoldRows(state, index);
    default:
      throw new Error(
        `State cannot be updated through action of type '${action.type}'`
      );
  }
}

function unfoldRows(currentState, index) {
  const row = currentState.rows[index];
  if (row.type !== 'array_item_collapsed') return currentState;

  const collapsedShape = _get(currentState.body, row.trail);
  const rowField = {
    fieldValue: row.fieldValue,
    fieldName: row.fieldName,
    seqIndex: row.seqIndex,
    trail: [...row.trail],
  };

  const [replacementRows, newCollapsedTrails] = shapeRows(
    collapsedShape,
    [],
    [],
    row.indent,
    rowField
  );
  const updatedRows = [...currentState.rows];
  updatedRows.splice(index, 1, ...replacementRows);
  const updatedCollapsedTrails = currentState.collapsedTrails
    .filter((trail) => !_isEqual(trail, row.trail))
    .concat(newCollapsedTrails);

  return {
    ...currentState,
    rows: updatedRows,
    collapsedTrails: updatedCollapsedTrails,
  };
}

function shapeRows(
  shape,
  rows = [],
  collapsedTrails = [],
  indent = 0,
  field = {
    fieldName: null,
    fieldValue: undefined,
    seqIndex: undefined,
    trail: [],
  }
) {
  if (!shape) return [];

  const typeString = Object.prototype.toString.call(shape);

  switch (typeString) {
    case '[object Object]':
      // debugger;
      objectRows(shape, rows, collapsedTrails, indent, field);
      break;
    case '[object Array]':
      // debugger;
      listRows(shape, rows, collapsedTrails, indent, field);
      break;
    default:
      // debugger;
      if (shape.isOptional || shape.isNullable) {
        shapeRows(shape.innerShape, rows, collapsedTrails, indent, field);
      } else {
        let type = getFieldType(field.fieldValue);
        let row = { type, ...field, indent };
        rows.push(row);
      }
      break;
  }

  return [rows, collapsedTrails];
}

function objectRows(objectShape, rows, collapsedTrails, indent, field) {
  const { trail } = field;

  rows.push({
    type: 'object_open',
    fieldName: field.fieldName,
    seqIndex: field.seqIndex,
    trail,
    indent,
  });

  Object.entries(objectShape)
    .sort(alphabetizeEntryKeys)
    .forEach(([key, value]) => {
      const fieldName = key;

      return shapeRows(value, rows, collapsedTrails, indent + 1, {
        fieldName,
        fieldValue: value,
        trail: [...trail, fieldName],
      });
    });

  rows.push({ type: 'object_close', indent, trail });
}

function alphabetizeEntryKeys([keyA], [keyB]) {
  if (keyA > keyB) {
    return 1;
  } else if (keyB > keyA) {
    return -1;
  }

  return 0;
}

function listRows(list, rows, collapsedTrails, indent, field) {
  const { trail } = field;

  rows.push({
    type: 'array_open',
    indent,
    fieldName: field.fieldName,
    seqIndex: field.seqIndex,
    trail,
  });

  list.forEach((item, index) => {
    let itemTypeString = Object.prototype.toString.call(item);
    let itemTrail = [...trail, index];
    let itemIndent = indent + 1;

    // debugger;

    if (
      index === 0 ||
      (itemTypeString !== '[object Object]' &&
        itemTypeString !== '[object Array]')
    ) {
      shapeRows(item, rows, collapsedTrails, itemIndent, {
        seqIndex: index,
        fieldValue: item,
        trail: itemTrail,
      });
    } else {
      rows.push({
        type: 'array_item_collapsed',
        seqIndex: index,
        indent: itemIndent,
        trail: itemTrail,
      });
      collapsedTrails.push(itemTrail);
    }
  });

  rows.push({ type: 'array_close', indent, trail });
}

function getFieldType(fieldValue) {
  if (typeof fieldValue === 'undefined') {
    return 'undefined';
  }

  const jsTypeString = Object.prototype.toString.call(fieldValue);

  switch (jsTypeString) {
    case '[object Null]':
      return 'null';
    case '[object String]':
      return 'string';
    case '[object Boolean]':
      return 'boolean';
    case '[object Number]':
      return 'number';
    default:
      debugger;
      throw new Error(
        `Can not return field type for fieldValue with type string '${jsTypeString}'`
      );
  }
}
