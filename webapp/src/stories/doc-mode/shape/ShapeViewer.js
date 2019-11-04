import React, {useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {Collapse} from '@material-ui/core';
import Fade from '@material-ui/core/Fade';
import {StyledTab, StyledTabs} from '../DocCodeBox';
import IconButton from '@material-ui/core/IconButton';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import {Show} from '../Show';
import {primitiveDocColors} from '../DocConstants';
import {withRfcContext} from '../../../contexts/RfcContext';
import {Highlight, HighlightedIDsStore} from './HighlightedIDs';

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
    // height: 26,
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
  },
  arrow: {
    fontSize: 15,
    marginLeft: -16,
    marginTop: 5,
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
        <div onClick={() => setExpanded(!expanded)}> {expanded ? <ArrowDropDownIcon className={classes.arrow}/> :
          <ArrowRightIcon className={classes.arrow}/>} </div>
        {children}
      </li>
      <Show when={expanded}>
        {innerChildren}
      </Show>
    </>
  );
});

export const RootRow = withStyles(styles)(({classes, id, typeName, depth}) => {
  const [expandedParam, setExpandedParam] = useState(null);

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

export const Field = withStyles(styles)(({classes, typeName, fields, fieldName, baseShapeId, parameters, depth, id, fieldId}) => {

  const [expandedParam, setExpandedParam] = useState(null);

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
    </>) : <>-</>}
    <div style={{marginLeft: 4}}><TypeNameRender typeName={typeName} id={id} onLinkClick={setParam}/></div>
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
});

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

export const ObjectViewer = withStyles(styles)(({classes, typeName, id, fields, depth = 0}) => {

  return (<>
      <Row style={{paddingLeft: 6}}>{<TypeNameRender typeName={typeName} id={id}/>}</Row>
      {fields.map(i => <Field {...i.shape} fieldName={i.fieldName} fieldId={i.fieldId} depth={depth + 1}/>)}
    </>
  );
});

function handleBaseShape(shape) {
  const {baseShapeId, typeName, id, fields} = shape;
  if (baseShapeId === '$object' || fields.length) {
    return <ObjectViewer {...shape} />;
  } else {
    return <RootRow typeName={typeName} id={id}/>;
  }
}

class _ShapeViewerBase extends React.Component {
  render() {
    const {shape, depth = 0, parameters, classes} = this.props;

    const {baseShapeId} = shape;

    const root = handleBaseShape(shape);
    return (
      <div className={classes.base}>{root}</div>
    );
  }
}

const ShapeViewer = withStyles(styles)(_ShapeViewerBase);
export default ShapeViewer;

export const ExampleViewer = withRfcContext(({example, queries}) => {
  const flatShape = queries.flatShapeForExample(example);
  return <ShapeViewer shape={flatShape.root} parameters={flatShape.parametersMap}/>;
});

export const ShapeViewerWithQuery = withRfcContext(({shapeId, queries}) => {
  const flatShape = queries.flatShapeForShapeId(shapeId);
  return <ShapeViewer shape={flatShape.root} parameters={flatShape.parametersMap}/>;
});
