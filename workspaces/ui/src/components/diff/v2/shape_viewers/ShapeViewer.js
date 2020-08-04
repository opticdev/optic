import React, { useMemo } from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import { useShapeViewerStyles } from './styles';

export default function ShapeViewer({ shape }) {
  const generalClasses = useShapeViewerStyles();

  const rows = useMemo(() => createRows(shape), [shape]);

  return (
    <div className={generalClasses.root}>
      <Row indent={0} type="object_open" />
      <Row indent={1} fieldName="Circuit" type="object_open" />
      <Row
        indent={2}
        fieldName="circuitId"
        type="string"
        fieldValue="albert_park"
      />
      <Row
        indent={2}
        fieldName="circuitName"
        type="string"
        fieldValue="Albert Park Grand Prix Circuit"
      />
      <Row indent={2} fieldName="Location" type="object_open" />
      <Row
        indent={3}
        fieldName="country"
        type="string"
        fieldValue="Australia"
      />
      <Row indent={2} type="object_close" />
      <Row indent={1} type="object_close" />
      <Row indent={0} type="object_close" />
    </div>
  );
}

export function Row(props) {
  const generalClasses = useShapeViewerStyles();
  const { exampleOnly, onLeftClick } = props;

  return (
    <div
      className={classNames(generalClasses.row, {
        [generalClasses.rowWithHover]: !props.noHover,
        [generalClasses.isTracked]: !!props.tracked, // important for the compass to work
      })}
    >
      <div className={generalClasses.left} onClick={onLeftClick}>
        {props.type}
      </div>
    </div>
  );
}
Row.displayName = 'ShapeViewer/Row';

const useStyles = makeStyles((theme) => ({}));

function createRows(shape) {}

function objectRows(objectShape) {}
function listRows(listShape) {}
