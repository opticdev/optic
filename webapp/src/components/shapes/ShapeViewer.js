import React, {useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {TextField} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import {Show} from '../shared/Show';
import compose from 'lodash.compose';
import {primitiveDocColors} from '../requests/DocConstants';
import {withRfcContext} from '../../contexts/RfcContext';
import {Highlight, HighlightedIDsStore, withHighlightedIDs} from './HighlightedIDs';
import Menu from '@material-ui/core/Menu';
import {NamerStore, withNamer} from './Namer';
import {AutoSizer, List as VirtualizedList} from 'react-virtualized';


const rowHeight = 28

const styles = theme => ({
  base: {
    backgroundColor: '#4f5568',
  },
  row: {
    padding: 4,
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'row',
    color: 'rgb(249, 248, 245)',
    fontSize: 13,
    height: rowHeight,
    userSelect: 'none',
    fontFamily: 'monospace',
    '&:hover': {
      backgroundColor: 'rgba(78,165,255,0.27)'
    },
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

export const Row = withStyles(styles)(({classes, children, style, depth = 0}) => {
  return (
    <li className={classes.row} style={{paddingLeft: depth * 8, ...style}}>{children}</li>
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

export const RootRow = (({classes, id, typeName, depth}, expand) => {

  const defaultParam = ((typeName.find(i => i.shapeLink && expand.includes(i.shapeLink)) || {}).shapeLink) || null;

  const [expandedParam, setExpandedParam] = useState(defaultParam);

  const setParam = (param) => {
    if (expandedParam === param) {
      setExpandedParam(null);
    } else {
      setExpandedParam(param);
    }
  };

  return [
    <Row style={{paddingLeft: 6}}>
      <TypeNameRender typeName={typeName} id={id} onLinkClick={setParam}/>
    </Row>
  ]

  // return (
  //   <>
  //     <Row style={{paddingLeft: 6}}>
  //       <TypeNameRender typeName={typeName} id={id} onLinkClick={setParam}/>
  //     </Row>
  //     {expandedParam && (
  //       <div style={{paddingLeft: depth * 8}}>
  //         <div className={classes.innerParam}>
  //           <ShapeViewerWithQuery shapeId={expandedParam}/>
  //         </div>
  //       </div>
  //     )}
  //   </>
  // );
});

export const Field = withHighlightedIDs(withStyles(styles)(({classes, expand, typeName, fields, fieldName, canName, baseShapeId, parameters, depth, id, fieldId}) => {

  const defaultParam = ((typeName.find(i => i.shapeLink && expand.includes(i.shapeLink)) || {}).shapeLink) || null;
  const [expandedParam, setExpandedParam] = useState(defaultParam);

  const setParam = (param) => {
    if (expandedParam === param) {
      setExpandedParam(null);
    } else {
      setExpandedParam(param);
    }
  };

  const shared = <>
    {typeName[0].colorKey !== 'index' ? (<>
      <div className={classes.fieldName}>{fieldName}</div>
      <div className={classes.colon}>:</div>
    </>) : <span style={{marginTop: 2}}>-</span>}
    <div style={{marginLeft: 4}}><TypeNameRender typeName={typeName} id={id} onLinkClick={setParam}/></div>
    {canName && <Namer id={id}/>}
  </>;

  if (fields.length) {
    const fieldsRendered = fields.map(i => <Field {...i.shape} fieldName={i.fieldName} fieldId={fieldId}
                                                  depth={depth + 2}/>);
    //use expandable row
    return <ExpandableRow depth={depth + 1} innerChildren={fieldsRendered}>
      {shared}
    </ExpandableRow>;
  }


  return (
    <>
      <Highlight id={fieldId}>
        <Row depth={depth + 1}>
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
}));

export const TypeNameRender = withStyles(styles)(({classes, id, typeName, onLinkClick}) => {

  const components = typeName.map(({name, shapeLink, primitiveId}) => {

    const color = primitiveDocColors[primitiveId];

    if (shapeLink) {
      return (<>
        <span
          onClick={() => {
            if (onLinkClick) {
              onLinkClick(shapeLink);
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

export const ObjectViewer = ({typeName, canName, id, fields, depth = 0}, expand) => {

  return [
    <Row style={{paddingLeft: 6}}>
      {<TypeNameRender typeName={typeName} id={id}/>}
      {canName && <Namer id={id}/>}
    </Row>,
    ...fields.map(i => <Field {...i.shape} fieldName={i.fieldName} fieldId={i.fieldId} depth={depth + 1}/>)
  ]

  return (<>
      <Row style={{paddingLeft: 6}}>
        {<TypeNameRender typeName={typeName} id={id}/>}
        {canName && <Namer id={id}/>}
      </Row>
      {fields.map(i => <Field {...i.shape} fieldName={i.fieldName} fieldId={i.fieldId} depth={depth + 1}/>)}
    </>
  );
};

function rowsForBaseShape(shape, expand) {
  const {baseShapeId, typeName, id, fields} = shape;
  console.log('xxx', {shape});
  if (baseShapeId === '$object' || fields.length) {
    const rows = ObjectViewer(shape, expand)
    return rows
  } else {
    const rows = RootRow(shape, expand)
    return  rows
  }
}

class _ShapeViewerBase extends React.PureComponent {

  shouldComponentUpdate(nextProps) {
    if (this.props.renderId === nextProps.renderId) {
      return false
    } else {
      return true
    }
  }

  render() {
    const {shape, classes, expand, disableNaming, nameShape} = this.props;

    const rows = rowsForBaseShape(shape, expand);
    const eightPercentDocHeight = window.innerHeight * .8
    const height = rows.length * rowHeight > eightPercentDocHeight ? eightPercentDocHeight : rows.length * rowHeight

    const useThis = (
      <AutoSizer disableHeight>
        {({width}) => {
          return (
            <VirtualizedList
              // className={styles.List}
              height={height}
              // noRowsRenderer={this._noRowsRenderer}
              rowCount={rows.length}
              rowHeight={rowHeight}
              width={width}
              rowRenderer={({index, isScrolling, key, style}) => {
                return (
                  <div key={key} style={style}>
                    {rows[index]}
                  </div>
                )
              }} />
          )
        }}
      </AutoSizer>)

    return (
      <NamerStore disable={disableNaming} nameShape={nameShape}>
        {/*<div className={classes.base}>{root}</div>*/}
        <div className={classes.base} style={{height, width: '100%'}}>
          {useThis}
        </div>

      </NamerStore>
    );
  }
}

const ShapeViewer = withHighlightedIDs(withNamer(withStyles(styles)(_ShapeViewerBase)));
export default ShapeViewer;

class ExampleViewerBase extends React.PureComponent {
  render() {
    const {queries, example, disableNaming} = this.props;
    const flatShape = queries.memoizedFlatShapeForExample(example);
    return (
      <NamerStore diable={disableNaming}>
        <ShapeViewer shape={flatShape.root} parameters={flatShape.parametersMap}/>
      </NamerStore>
    );
  }
}

export const ExampleViewer = withRfcContext(ExampleViewerBase);

export const ShapeViewerWithQuery = withHighlightedIDs(withRfcContext(({shapeId, addedIds, changedIds, queries, disableNaming}) => {
  const affectedIds = [...addedIds, ...changedIds];
  const flatShape = queries.flatShapeForShapeId(shapeId, affectedIds);
  const expand = Array.from(new Set([...flatShape.pathsForAffectedIds.flatMap(x => x)]));

  return (
    <HighlightedIDsStore addedIds={addedIds} changedIds={changedIds} expand={expand}>
      <ShapeViewer shape={flatShape.root} parameters={flatShape.parametersMap} disableNaming={disableNaming}/>
    </HighlightedIDsStore>
  );
}));
