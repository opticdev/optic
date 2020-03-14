import React, {useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {TextField} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import {Show} from '../shared/Show';
import compose from 'lodash.compose';
import {primitiveDocColors} from '../requests/DocConstants';
import {withRfcContext} from '../../contexts/RfcContext';
import Menu from '@material-ui/core/Menu';
import {NamerStore, withNamer} from './Namer';
import equal from 'deep-equal';
import sha1 from 'node-sha1';
import stringify from 'json-stable-stringify';
import niceTry from 'nice-try';
import {RemovedRedBackground} from '../../contexts/ColorContext';
import ReusableDiffRow from '../diff/v2/ReusableDiffRow';
import {mapScala, getOrUndefined, JsonHelper} from '@useoptic/domain';
import {SuggestionsContext} from '../diff/v2/DiffPageNew';

const styles = theme => ({
  base: {
    backgroundColor: '#4f5568',
  },
  rowHover: {
    '&:hover': {
      backgroundColor: 'rgba(78,165,255,0.27)'
    },
  },
  row: {
    padding: 4,
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'row',
    color: 'rgb(249, 248, 245)',
    fontSize: 13,
    // height: 26,
    userSelect: 'none',
    fontFamily: 'monospace',
  },
  colon: {
    marginLeft: 5,
    marginRight: 5,
    marginTop: 2
  },
  typeName: {
    userSelect: 'none',
    marginTop: 2,
    fontWeight: 100,
    wordBreak: 'break-all'
  },
  namer: {
    width: 20,
    paddingTop: 1,
    cursor: 'pointer'
  },
  namerInner: {
    padding: 8,
    paddingTop: 4
  },
  arrow: {
    height: '15px !important', //20 mins in, best solution. MUI applying base inconsist order
    marginTop: 4,
    overflow: 'hidden',
    marginLeft: -16,
    cursor: 'pointer'
  },
  link: {
    textDecoration: 'underline',
    cursor: 'pointer'
  },
  innerParam: {
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 6,
    marginLeft: 10,
    borderTop: '1px solid #e2e2e2',
    borderBottom: '1px solid #e2e2e2',
  },
  fieldName: {
    fontWeight: 800,
    marginTop: 2
  }
});

export const Row = withStyles(styles)(({classes, children, style, diffCount, depth = 0}) => {
  return (
    <ReusableDiffRow className={classes.rowHover} notifications={<div>{diffCount}</div>}>
      <li className={classes.row} style={{paddingLeft: depth * 8, ...style}}>{children}</li>
    </ReusableDiffRow>
  );
});

export const ExpandableRow = withStyles(styles)(({classes, children, innerChildren, fields, depth}) => {
  const [expanded, setExpanded] = useState(true);
  return (
    <>
      <li className={classes.row} style={{paddingLeft: depth * 8, cursor: 'pointer'}}
          onClick={() => setExpanded(!expanded)}>
        {expanded ?
          <ArrowDropDownIcon className={classes.arrow} onClick={() => setExpanded(!expanded)}/> :
          <ArrowRightIcon className={classes.arrow} onClick={() => setExpanded(!expanded)}/>}
        {children}
      </li>
      <Show when={expanded}>
        {innerChildren}
      </Show>
    </>
  );
});

export const RootRow = withStyles(styles)(({classes, expand, id, typeName, depth}) => {

  const defaultParam = null; //((typeName.find(i => i.shapeLink && expand.includes(i.shapeLink)) || {}).shapeLink) || null;

  const [expandedParam, setExpandedParam] = useState(defaultParam);

  const setParam = (param) => {
    if (expandedParam === param) {
      setExpandedParam(null);
    } else {
      setExpandedParam(param);
    }
  };

  return (
    <>
      <Row style={{paddingLeft: 6}}>
        <TypeNameRender typeName={typeName} id={id} onLinkClick={setParam}/>
      </Row>
      {expandedParam && (
        <div style={{paddingLeft: depth * 8}}>
          <div className={classes.innerParam}>
            <ShapeViewerWithQuery shapeId={expandedParam}/>
          </div>
        </div>
      )}
    </>
  );
});

export const Field = withStyles(styles)(({classes, expand, diffCount, typeNameJs, typeName, fields, fieldName, tag, canName, baseShapeId, parameters, depth, id, fieldId}) => {
  const defaultParam = null; //((typeName.find(i => i.shapeLink && expand.includes(i.shapeLink)) || {}).shapeLink) || null;
  const [expandedParam, setExpandedParam] = useState(defaultParam);

  const setParam = (param) => {
    if (expandedParam === param) {
      setExpandedParam(null);
    } else {
      setExpandedParam(param);
    }
  };

  const shared = <>
    {typeNameJs[0].colorKey !== 'index' ? (<>
      <div className={classes.fieldName}>{fieldName}</div>
      <div className={classes.colon}>:</div>
    </>) : <span style={{marginTop: 2}}>-</span>}
    <div style={{marginLeft: 4}}><TypeNameRender typeName={typeName} id={id} onLinkClick={setParam}/></div>
    {canName && <Namer id={id}/>}
  </>;

  if (fields.length) {
    const fieldsRendered = fields.map(i => <Field {...fieldShapeToProps(i)}
                                                  depth={depth + 2}/>);
    //use expandable row
    return <ExpandableRow depth={depth + 1} innerChildren={fieldsRendered} diffCount={diffCount}>
      {shared}
    </ExpandableRow>;
  }


  return (
    <>
      <Highlight tag={tag}>
        <Row depth={depth + 1} diffCount={diffCount}>
          {shared}
        </Row>
      </Highlight>
      {expandedParam && (
        <div style={{paddingLeft: depth * 8}}>
          <div className={classes.innerParam}>
            <ShapeViewerWithQuery shapeId={expandedParam}/>
          </div>
          <div style={{height: 10}}/>
        </div>
      )}
    </>
  );
});

export const TypeNameRender = withStyles(styles)(({classes, id, typeName, onLinkClick}) => {

  const components = mapScala(typeName)(({name, shapeLink, primitiveId}) => {

    const color = primitiveDocColors[getOrUndefined(primitiveId)];

    if (shapeLink) {
      return (<>
        <span
          onClick={() => {
            if (onLinkClick) {
              onLinkClick(getOrUndefined(shapeLink));
            }
          }}
          className={classes.link}
          style={{color: color || '#00BFFF'}}>{name}</span>
        {' '}
      </>);
    }

    return <span style={{color}}>{name + ' '}</span>;
  });

  return <Highlight id={id}>
    <div className={classes.typeName}>{components}</div>
  </Highlight>;

});

export const Namer = compose(withNamer, withStyles(styles))(props => {
  const {classes, nameShape, id, disable} = props;
  if (disable) {
    return null;
  }
  const [anchorEl, setAnchorEl] = useState(null);
  const [conceptName, setConceptName] = useState('');

  const finish = () => {
    nameShape(id, conceptName);
    setAnchorEl(null);
    setConceptName('');
  };

  const menu = (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
      <div className={classes.namerInner}>
        <TextField
          label="Name Concept"
          autoFocus
          value={conceptName}
          onBlur={finish}
          onKeyPress={(e) => {
            if (e.which === 13) {
              finish();
            }
          }}
          onChange={(e) => {
            setConceptName(e.target.value);
            //the interpretation card was stealing focus. not sure why everything re-rendered. -- this fixed it.
            e.stopPropagation();
            e.currentTarget.focus();
          }}/>
      </div>
    </Menu>
  );

  return (<>
    {menu}
    <div style={{flex: 1}}/>
    <div className={classes.namer} onClick={(e) => {
      setAnchorEl(e.currentTarget);
      e.stopPropagation();
    }} children={'○'}/>
  </>);
});

export const ObjectViewer = withStyles(styles)(({classes, typeName, canName, id, fields, depth = 0}) => {

  return (<>
      <Row style={{paddingLeft: 6}}>
        {<TypeNameRender typeName={typeName} id={id}/>}
        {canName && <Namer id={id}/>}
      </Row>
      {mapScala(fields)(i => {
        return <Field {...fieldShapeToProps(i)}
               depth={depth + 1}/>
      })}
    </>
  );
});

function handleBaseShape(shape) {
  const {baseShapeId, typeName, id, fields} = shape;
  console.log('xxx', {shape});
  if (baseShapeId === '$object' || fields.length) {
    return <ObjectViewer typeName={shape.typeName} canName={shape.canName} id={shape.id} fields={shape.fields}
                         depth={0}/>;
  } else {
    return <RootRow typeName={typeName} id={id}/>;
  }
}

class _ShapeViewerBase extends React.PureComponent {

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (equal(nextProps.shape, this.props.shape)) {
      return false;
    } else {
      return true;
    }
  }

  render() {
    const {shape, classes} = this.props;
    console.log('rendering');

    const root = handleBaseShape(shape);
    return (
      <div className={classes.base}>{root}</div>
    );
  }
}

const ShapeViewer = withStyles(styles)(_ShapeViewerBase);
export default ShapeViewer;

class ExampleViewerBase extends React.Component {

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (equal(nextProps.example, this.props.example) && equal(nextProps.exampleTags, this.props.exampleTags)) {
      return false;
    } else {
      return true;
    }
  }

  render() {
    const {queries, example, exampleTags} = this.props;
    const hash = niceTry(() => sha1(stringify(example))) || 'empty-example';
    const flatShape = queries.memoizedFlatShapeForExample(example, hash, exampleTags);

    console.log('abnc', exampleTags);
    return (
      <NamerStore>
        <ShapeViewer shape={flatShape.root} parameters={flatShape.parametersMap} renderId={hash}/>
      </NamerStore>
    );
  }
}

export const ExampleViewer = withRfcContext(ExampleViewerBase);

export const NestedDiffsContext = React.createContext(null);

export const ShapeViewerWithQuery = withRfcContext(({shapeId, addedIds, changedIds, queries, diffs = JsonHelper.jsArrayToSeq([])}) => {
  if (!shapeId) {
    console.error('this should have a shape id...');
    return <div>why don't i have a shape id???</div>;
  }
  const flatShape = queries.flatShapeForShapeId(shapeId, diffs);
  return (
    <NestedDiffsContext.Consumer>
      {(context) => {
        const {contextDiffs} = (context || {})
        const producerDiffs = !contextDiffs ? diffs : contextDiffs
        debugger
        return (
          <NestedDiffsContext.Provider value={{contextDiffs: producerDiffs}}>
            <ShapeViewer shape={flatShape.root} parameters={flatShape.parametersMap}/>
          </NestedDiffsContext.Provider>
        )
      }}
    </NestedDiffsContext.Consumer>
  );
});

function fieldShapeToProps(field) {
  console.log('fieldLook ', field.fieldName)
  console.log('fieldLook ', field.diffCount)
  console.log('fieldLook ', field.shape.diffCount)
  return {
    fieldName: field.fieldName,
    fieldId: field.fieldId,
    tag: field.tag,
    baseShapeId: field.shape.baseShapeId,
    fields: field.shape.fields,
    typeName: field.shape.typeName,
    typeNameJs: JsonHelper.seqToJsArray(field.shape.typeName),
    id: field.shape.id,
    canName: field.shape.canName,
    expand: field.shape.expand,
    parameters: field.shape.parameters,
    diffCount: field.diffCount
  }
}

export const AddedGreen = '#008d69';
export const ChangedYellow = '#8d7200';
export const Highlight = (({tag, children, style}) => {

  if (tag === 'Addition') {
    return (<div style={{backgroundColor: AddedGreen}}>{children}</div>);
  } else if (tag === 'Update') {
    return (<div style={{backgroundColor: ChangedYellow}}>{children}</div>);
  } else if (tag === 'Removal') {
    return (<div style={{backgroundColor: RemovedRedBackground}}>{children}</div>);
  } else {
    return children;
  }
});
