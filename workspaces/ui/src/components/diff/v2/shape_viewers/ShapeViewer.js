import React, { useMemo } from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import { useColor, useShapeViewerStyles, SymbolColor } from './styles';

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

  const rows = useMemo(() => createRows({ diff, interaction }), [
    diff,
    interaction,
  ]);

  return (
    <div className={generalClasses.root}>
      {rows.map((row, index) => (
        <Row key={row.id} {...row} />
      ))}
    </div>
  );
}

export function Row(props) {
  const classes = useStyles();
  const generalClasses = useShapeViewerStyles();
  const {
    indent,
    seqIndex,
    fieldName,
    fieldValue,
    missing,
    type,

    onLeftClick,
  } = props;

  const indentPadding = ' '.repeat(indent * 2);

  return (
    <div
      className={classNames(generalClasses.row, {
        [generalClasses.rowWithHover]: !props.noHover,
        [generalClasses.isTracked]: !!props.tracked, // important for the compass to work
      })}
    >
      <div className={generalClasses.left} onClick={onLeftClick}>
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
function createRows({ diff, interaction }) {
  let body = diff.inRequest
    ? interaction.request.body
    : interaction.response.body;

  const shape = JsonHelper.toJs(body.jsonOption);

  const rows = shapeRows(shape);
  for (let row of rows) {
    row.id = `${row.trail.join('.') || 'root'}-${row.type}`;
  }

  return rows;
}

function shapeRows(
  shape,
  rows = [],
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
      objectRows(shape, rows, indent, field);
      break;
    case '[object Array]':
      // debugger;
      listRows(shape, rows, indent, field);
      break;
    default:
      // debugger;
      if (shape.isOptional || shape.isNullable) {
        shapeRows(shape.innerShape, rows, indent, field);
      } else {
        let type = getFieldType(field.fieldValue);
        let row = { type, ...field, indent };
        rows.push(row);
      }
      break;
  }

  return rows;
}

function objectRows(objectShape, rows, indent, field) {
  const { trail } = field;

  rows.push({
    type: 'object_open',
    fieldName: field.fieldName,
    seqIndex: field.seqIndex,
    trail,
    indent,
  });

  Object.entries(objectShape).forEach(([key, value]) => {
    const fieldName = key;

    return shapeRows(value, rows, indent + 1, {
      fieldName,
      fieldValue: value,
      trail: [...trail, fieldName],
    });
  });

  rows.push({ type: 'object_close', indent, trail });
}
function listRows(list, rows, indent, field) {
  const { trail } = field;

  rows.push({
    type: 'array_open',
    indent,
    fieldName: field.fieldName,
    seqIndex: field.seqIndex,
    trail,
  });

  list.forEach((item, index) => {
    return shapeRows(item, rows, indent + 1, {
      seqIndex: index,
      fieldValue: item,
      trail: [...trail, index],
    });
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
