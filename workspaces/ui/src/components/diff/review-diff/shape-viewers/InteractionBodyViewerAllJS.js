import React, { useCallback, useReducer } from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import { useColor, useShapeViewerStyles, SymbolColor } from './styles';
import _isEqual from 'lodash.isequal';
import _get from 'lodash.get';
import _uniq from 'lodash.uniq';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import { IChangeType } from '../../../../engine/interfaces/interpretors';
import { toCommonJsPath } from '@useoptic/cli-shared/build/diffs/json-trail';
import { ICopyRenderSpan } from '../ICopyRender';
import CheckIcon from '@material-ui/icons/Check';
import { AddedGreen, UpdatedBlue } from '../../../../theme';
export default function InteractionBodyViewerAllJS({
  diff,
  description,
  jsonTrails,
  body,
  assertion,
  trailsAreCorrect,
}) {
  const generalClasses = useShapeViewerStyles();

  const [{ rows }, dispatch] = useReducer(
    updateState,
    { diff, body, jsonTrails, description },
    createInitialState
  );

  const diffDetails = diff && {
    description,
    assertion,
    changeType: description.changeType,
    trailsAreCorrect,
    // changeDescription: 'changed!',
  };

  return (
    <div className={generalClasses.root}>
      {rows.map((row, index) => {
        return (
          <Row
            key={row.id}
            index={index}
            {...row}
            diffDetails={row.compliant ? {} : diffDetails}
            dispatch={dispatch}
          />
        );
      })}
    </div>
  );
}

export function Row(props) {
  const classes = useStyles();
  const generalClasses = useShapeViewerStyles();
  const {
    collapsed,
    compliant,
    diffDetails,
    indent,
    index,
    fieldsHidden,
    seqIndex,
    fieldName,
    fieldValue,
    type,
    dispatch,
  } = props;

  const onRowClick = useCallback(
    (e) => {
      if (!collapsed) return;
      e.preventDefault();
      if (type === 'array_item_collapsed') {
        dispatch({ type: 'unfold-index', payload: index });
      }
      if (type === 'object_keys_collapsed') {
        dispatch({ type: 'unfold-fields', payload: index });
      }
    },
    [index, type, dispatch]
  );

  const indentPadding = ' '.repeat(indent * 2);

  return (
    <div
      className={classNames(classes.row, {
        [generalClasses.isTracked]: !!props.tracked, // important for the compass to work
        [classes.isCollapsed]: collapsed,
        [classes.isIncompliant]: !compliant && !collapsed,
        [classes.isCollapsedIncompliant]: !compliant && collapsed,
        [classes.requiresAddition]:
          diffDetails &&
          !diffDetails.trailsAreCorrect &&
          diffDetails.changeType === IChangeType.Added,
        [classes.requiresUpdate]:
          diffDetails &&
          !diffDetails.trailsAreCorrect &&
          diffDetails.changeType === IChangeType.Changed,
        [classes.requiresRemoval]:
          diffDetails &&
          !diffDetails.trailsAreCorrect &&
          diffDetails.changeType === IChangeType.Removed,
        [classes.trailsAreCorrect]: diffDetails.trailsAreCorrect,
      })}
    >
      <div className={classes.rowContent} onClick={onRowClick}>
        {indentPadding}
        <RowFieldName type={type} name={fieldName} />
        <RowSeqIndex type={type} index={seqIndex} />
        <RowValue
          isRoot={indent === 0}
          type={type}
          fieldsHidden={fieldsHidden}
          value={fieldValue}
          compliant={compliant}
          changeDescription={diffDetails && diffDetails.changeDescription}
        />
      </div>

      {!compliant &&
        !collapsed &&
        (diffDetails.trailsAreCorrect ? (
          <TrailCheck {...diffDetails} />
        ) : (
          <DiffAssertion {...diffDetails} />
        ))}
    </div>
  );
}
Row.displayName = 'ShapeViewer/Row';

function RowValue({
  type,
  value,
  compliant,
  changeDescription,
  trailsAreCorrect,
  isRoot,
  fieldsHidden,
}) {
  const generalClasses = useShapeViewerStyles();
  const classes = useStyles();

  if (type === 'null') {
    return (
      <span
        className={classNames(
          generalClasses.symbols,
          classes.symbolContent,
          'fs-exclude'
        )}
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
    return (
      <span className={classes.collapsedSymbol}>
        {'⋯'}
        {!compliant ? (
          changeDescription || !trailsAreCorrect ? (
            <CheckCircleIcon className={classes.collapsedChangeIcon} />
          ) : (
            <WarningIcon className={classes.collapsedWarning} />
          )
        ) : (
          ''
        )}
      </span>
    );
  }

  if (type === 'object_keys_collapsed') {
    return (
      <span className={classes.collapsedObjectSymbol}>
        {`...expand ${fieldsHidden} additional fields`}
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
    const quote = isRoot ? '' : '"';
    return (
      <span className={classNames(classes.stringContent, 'fs-exclude')}>
        {quote}
        {value}
        {quote}
      </span>
    );
  }

  if (type === 'boolean') {
    return (
      <span
        className="fs-exclude"
        style={{ color: '#d9ba99', fontWeight: 600 }}
      >
        {value ? 'true' : 'false'}
      </span>
    );
  }

  if (type === 'number') {
    return (
      <span
        className="fs-exclude"
        style={{ color: '#99d9d9', fontWeight: 600 }}
      >
        {value}
      </span>
    );
  }

  if (type === 'undefined') {
    return null;
  }

  throw new Error(`Cannot render RowValue for type '${type}'`);
}
RowValue.displayName = 'ShapeViewer/RowValue';

function RowFieldName({ type, name }) {
  const classes = useStyles();
  const missing = type === 'undefined';
  if (!name) return null;
  return (
    <span
      className={classNames(classes.fieldName, {
        [classes.isMissing]: type === 'undefined',
      })}
    >
      {name}
      {!missing && ': '}
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

function DiffAssertion({ assertion, changeDescription }) {
  const classes = useStyles();
  return (
    <div className={classes.diffAssertion}>
      {changeDescription ? (
        <>
          <CheckCircleIcon className={classes.selectectedChangeIcon} />
          <span className={classes.changeDescription}>
            <ICopyRenderSpan variant="subtitle2" copy={assertion} />
            {/*{changeDescription.map(({ value }) => value).join(' ')}*/}
          </span>
        </>
      ) : (
        <>
          <WarningIcon className={classes.assertionWarningIcon} />
          <ICopyRenderSpan variant="subtitle2" copy={assertion} />
        </>
      )}
    </div>
  );
}
function TrailCheck({ assertion }) {
  const classes = useStyles();
  return (
    <div className={classes.diffAssertion}>
      <div style={{ flex: 1 }} />
      <CheckIcon className={classes.correctTrailIcon} />
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  row: {
    display: 'flex',
    padding: 0,
    paddingLeft: 4,
    flexDirection: 'row',
    alignItems: 'baseline',

    '&:hover': {
      backgroundColor: 'rgba(78,165,255,0.27)',
    },

    '&$isCollapsed': {
      cursor: 'pointer',
    },

    '&$isIncompliant, &$isCollapsedIncompliant:hover': {
      '&$requiresAddition': {
        backgroundColor: theme.palette.added.background,
      },

      '&$requiresRemoval': {
        backgroundColor: theme.palette.removed.background,
      },

      '&$requiresUpdate': {
        backgroundColor: theme.palette.changed.background,
      },
    },
  },

  rowContent: {
    flexGrow: 1,
    flexShrink: 1,
    overflow: 'hidden',
    padding: theme.spacing(0, 5 / 8),

    lineHeight: '25px',
    fontSize: 12,
    fontFamily: "'Source Code Pro', monospace",
    whiteSpace: 'pre',
    color: SymbolColor,
  },

  collapsedRowValue: {},

  collapsedSymbol: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: 3,
    color: '#070707',
    fontSize: 10,
    backgroundColor: '#ababab',
    borderRadius: 12,

    '$isCollapsedIncompliant$requiresAddition &': {
      backgroundColor: theme.palette.added.background,
      color: theme.palette.added.main,
    },

    '$isCollapsedIncompliant$requiresRemoval &': {
      backgroundColor: theme.palette.removed.background,
      color: theme.palette.removed.main,
    },

    '$isCollapsedIncompliant$requiresUpdate &': {
      backgroundColor: theme.palette.changed.background,
      color: theme.palette.changed.main,
    },
    '$trailsAreCorrect &': {
      backgroundColor: theme.palette.added.background,
      color: theme.palette.added.main,
    },
  },

  collapsedObjectSymbol: {
    paddingRight: theme.spacing(1),
    paddingTop: 3,
    color: '#8f8f8f',
    fontSize: 10,
    borderRadius: 12,
    '$isCollapsedIncompliant$requiresAddition &': {
      backgroundColor: theme.palette.added.background,
      color: theme.palette.added.main,
    },

    '$isCollapsedIncompliant$requiresRemoval &': {
      backgroundColor: theme.palette.removed.background,
      color: theme.palette.removed.main,
    },

    '$isCollapsedIncompliant$requiresUpdate &': {
      backgroundColor: theme.palette.changed.background,
      color: theme.palette.changed.main,
    },
    '$trailsAreCorrect &': {
      backgroundColor: theme.palette.added.background,
      color: theme.palette.added.main,
    },
  },

  collapsedWarning: {
    width: 10,
    height: 10,
    marginLeft: theme.spacing(0.5),
    color: theme.palette.secondary.main,
  },

  collapsedChangeIcon: {
    width: 10,
    height: 10,
    marginLeft: theme.spacing(0.5),

    '$requiresAddition &': {
      color: theme.palette.added.main,
    },

    '$requiresRemoval &': {
      color: theme.palette.removed.main,
    },

    '$requiresUpdate &': {
      color: theme.palette.changed.main,
    },

    '$trailsAreCorrect &': {
      color: theme.palette.added.main,
    },
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

  missingContent: {
    fontWeight: 600,
    fontFamily: "'Source Code Pro', monospace",
    fontStyle: 'italic',
    opacity: 0.8,
  },

  fieldName: {
    fontWeight: 600,
    color: '#cfcfcf',
    fontSize: 12,
    fontFamily: "'Source Code Pro', monospace",

    opacity: 1,

    '&$isMissing': {
      fontStyle: 'italic',
      opacity: 0.6,
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

  diffAssertion: {
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: 'center',
    minWidth: '35%',
    maxWidth: '50%',

    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 2),

    color: '#f8edf4',
    fontSize: 14,
    fontWeight: 800,
    fontFamily: "'Source Code Pro', monospace",
  },

  assertionWarningIcon: {
    width: 14,
    height: 14,
    marginRight: theme.spacing(1),
    color: theme.palette.secondary.main,
  },

  selectectedChangeIcon: {
    width: 14,
    height: 14,
    marginRight: theme.spacing(1),

    '$requiresAddition &': {
      color: theme.palette.added.main,
    },

    '$requiresRemoval &': {
      color: theme.palette.removed.main,
    },

    '$requiresUpdate &': {
      color: theme.palette.changed.main,
    },
  },

  correctTrailIcon: {
    width: 20,
    height: 20,
    marginRight: theme.spacing(1),
    color: AddedGreen,
  },

  isCollapsed: {},
  isMissing: {},
  isIncompliant: {},
  isCollapsedIncompliant: {},
  requiresAddition: {},
  requiresUpdate: {},
  requiresRemoval: {},
  trailsAreCorrect: {},
}));

// ShapeViewer view model
// ----------------------
//
// We're using a reducer model so we can use pure transformation functions to
// manage the view model's state. That should especially come in handy when we
// want to cover this with tests, but will also help in making it into something
// re-usable, using Typescript to implement it, etc.
//
// TODO: consider moving this to it's own module, partly to enable the usecase
// stated above.

function createInitialState({ diff, jsonTrails, description, body }) {
  const diffTrails = jsonTrails.map(toCommonJsPath);
  const shape = !body.noBody ? body.asJson || body.asText : undefined;

  const [rows, collapsedTrails] = shapeRows(shape, diffTrails);

  return { body: shape, rows, collapsedTrails, diffTrails };
}

function updateState(state, action) {
  const index = action.payload;
  switch (action.type) {
    case 'unfold-index':
      return unfoldRows(state, index);
    case 'unfold-fields':
      return unfoldObjectRows(state, index);
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
    currentState.diffTrails,
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

function unfoldObjectRows(currentState, index) {
  const row = currentState.rows[index];
  if (row.type !== 'object_keys_collapsed') return currentState;

  const updatedRows = [...currentState.rows];

  const startIndex = updatedRows.findIndex(
    (i) => i.type === 'object_open' && _isEqual(i.trail, row.trail)
  );

  const open = updatedRows[startIndex];
  const collapsedShape = _get(currentState.body, open.trail, currentState.body);
  const rowField = {
    fieldValue: open.fieldValue,
    fieldName: open.fieldName,
    seqIndex: open.seqIndex,
    trail: [...open.trail],
  };

  const [replacementRows, newCollapsedTrails] = shapeRows(
    collapsedShape,
    currentState.diffTrails,
    [],
    [],
    row.indent - 1,
    rowField,
    row.trail
  );

  const endIndex =
    updatedRows.findIndex(
      (i, index) =>
        i.type === 'object_close' &&
        index > startIndex &&
        _isEqual(i.trail, row.trail)
    ) + 1;

  const offset = endIndex - startIndex;

  updatedRows.splice(startIndex, offset, ...replacementRows);
  const updatedCollapsedTrails = currentState.collapsedTrails
    .filter((trail) => !_isEqual(trail, row.trail))
    .concat(newCollapsedTrails);

  return {
    ...currentState,
    rows: updatedRows,
    collapsedTrails: updatedCollapsedTrails,
  };
}

// Since we've run into performance issue before traversing entire shapes, we're doing this
// the mutative way to prevent a lot of re-alloctions for big bodies.
function shapeRows(
  shape,
  diffTrails = [],
  rows = [],
  collapsedTrails = [],
  indent = 0,
  field = {
    fieldName: null,
    fieldValue: undefined,
    seqIndex: undefined,
    trail: [],
  },
  expandObjectWithTrail = null
) {
  const typeString = Object.prototype.toString.call(shape);

  switch (typeString) {
    case '[object Object]':
      // debugger;
      objectRows(
        shape,
        diffTrails,
        rows,
        collapsedTrails,
        indent,
        field,
        expandObjectWithTrail
      );
      break;
    case '[object Array]':
      // debugger;
      listRows(
        shape,
        diffTrails,
        rows,
        collapsedTrails,
        indent,
        field,
        expandObjectWithTrail
      );
      break;
    default:
      // debugger
      let type = getFieldType(shape);
      let row = createRow(
        { type, ...field, fieldValue: field.fieldValue || shape, indent },
        { diffTrails }
      );
      rows.push(createRow(row));
      break;
  }

  return [rows, collapsedTrails];
}

function objectRows(
  objectShape,
  diffTrails,
  rows,
  collapsedTrails,
  indent,
  field,
  expandObjectWithTrail
) {
  const { trail } = field;

  rows.push(
    createRow(
      {
        type: 'object_open',
        fieldName: field.fieldName,
        seqIndex: field.seqIndex,
        trail,
        indent,
      },
      { diffTrails }
    )
  );

  const nestedDiffs = diffTrails.filter((diffTrail) =>
    trail.every((trailComponent, n) => trailComponent === diffTrail[n])
  );

  function hasNestedDiff(trail) {
    return nestedDiffs.some((i) => _isEqual(i.slice(0, trail.length), trail));
  }

  const keysWithDiffs = nestedDiffs
    .filter((nestedDiff) => nestedDiff.length === trail.length + 1)
    .map((diff) => diff[diff.length - 1]);

  const objectKeys = _uniq([...Object.keys(objectShape), ...keysWithDiffs]);
  let collapsedCount = 0;

  const collapseAt = 9;

  const shouldCollapse =
    objectKeys.length > collapseAt &&
    !_isEqual(expandObjectWithTrail, trail) &&
    keysWithDiffs.length === 0;

  if (shouldCollapse) {
    collapsedTrails.push(trail);
    rows.push(
      createRow({
        type: 'object_keys_collapsed',
        collapsed: true,
        indent: indent + 1,
        fieldsHidden: objectKeys.filter(
          (key) =>
            !(keysWithDiffs.includes(key) || hasNestedDiff([...trail, key]))
        ).length,
        trail: trail,
      })
    );
  }

  objectKeys.sort(alphabetizeCaseInsensitve).forEach((key) => {
    const fieldName = key;
    const fieldTrail = [...trail, fieldName];
    const value = objectShape[key];

    if (shouldCollapse) {
      if (keysWithDiffs.includes(key) || hasNestedDiff(fieldTrail)) {
        shapeRows(value, nestedDiffs, rows, collapsedTrails, indent + 1, {
          fieldName,
          fieldValue: value,
          trail: fieldTrail,
        });
      } else {
        collapsedCount++;
      }
    } else {
      shapeRows(value, nestedDiffs, rows, collapsedTrails, indent + 1, {
        fieldName,
        fieldValue: value,
        trail: fieldTrail,
      });
    }
  });

  rows.push(createRow({ type: 'object_close', indent, trail }));
}

function alphabetizeCaseInsensitve(A, B) {
  const a = A.toLowerCase ? A.toLowerCase() : A;
  const b = B.toLowerCase ? B.toLowerCase() : B;

  if (a > b) {
    return 1;
  } else if (b > a) {
    return -1;
  }

  // return 0;
}

function listRows(list, diffTrails, rows, collapsedTrails, indent, field) {
  const { trail } = field;

  rows.push(
    createRow(
      {
        type: 'array_open',
        indent,
        fieldName: field.fieldName,
        seqIndex: field.seqIndex,
        trail,
      },
      { diffTrails }
    )
  );

  const nestedDiffs = diffTrails.filter(
    (diffTrail) =>
      diffTrail.length > trail.length &&
      trail.every((trailComponent, n) => trailComponent === diffTrail[n])
  );

  const indexesWithDiffs = list
    .map((item, index) => index)
    .filter((index) => {
      return nestedDiffs.some((diffTrail) => index === diffTrail[trail.length]);
    });

  list.forEach((item, index) => {
    let itemTypeString = Object.prototype.toString.call(item);
    let itemTrail = [...trail, index];
    let itemIndent = indent + 1;

    if (
      (itemTypeString !== '[object Object]' &&
        itemTypeString !== '[object Array]') ||
      (indexesWithDiffs.length > 0 && indexesWithDiffs[0] === index) ||
      (indexesWithDiffs.length === 0 && index === 0)
    ) {
      shapeRows(item, diffTrails, rows, collapsedTrails, itemIndent, {
        seqIndex: index,
        fieldValue: item,
        trail: itemTrail,
      });
    } else {
      rows.push(
        createRow({
          type: 'array_item_collapsed',
          collapsed: true,
          compliant: !indexesWithDiffs.includes(index),
          seqIndex: index,
          indent: itemIndent,
          trail: itemTrail,
        })
      );
      collapsedTrails.push(itemTrail);
    }
  });

  rows.push(createRow({ type: 'array_close', indent, trail }));
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

function createRow(row, options = {}) {
  const trail = row && row.trail;
  const type = row && row.type;
  if (!trail || !Array.isArray(trail))
    new TypeError('trail (array) must be known to create a row');
  if (!type) new TypeError('type must be known to create a row');

  const id = `${row.trail.join('.') || 'root'}-${row.type}`;

  const isCompliant =
    !options.diffTrails ||
    !options.diffTrails.some((diffTrail) => _isEqual(diffTrail, trail));

  return {
    id,
    collapsed: false,
    compliant: isCompliant,
    ...row,
  };
}
