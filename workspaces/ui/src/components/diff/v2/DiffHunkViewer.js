import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {ShapeRenderStore} from './shape_viewers/ShapeRenderContext';
import {DiffViewer} from './shape_viewers/SideBySideShapeRows';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },

}));

export default function DiffHunkViewer(props) {
  const {preview, diffDescription, suggestion, exampleOnly, diff} = props;
  const classes = useStyles();

  const rootShape = preview.rootId;
  const shape = preview.getUnifiedShape(rootShape);

  return (
    <ShapeRenderStore shape={preview} diff={diff} diffDescription={diffDescription} suggestion={suggestion} exampleOnly={exampleOnly}>
      <DiffViewer shape={shape}/>
    </ShapeRenderStore>
  );
}
