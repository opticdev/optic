import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {DiffViewer} from './ShapeRows';
import {ShapeRenderStore} from './ShapeRenderContext';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },

}));

export default function DiffHunkViewer(props) {
  const {preview, diffDescription, suggestion, diff} = props;
  const classes = useStyles();

  const rootShape = preview.rootId;
  const shape = preview.getUnifiedShape(rootShape);

  return (
    <ShapeRenderStore shape={preview} diff={diff} diffDescription={diffDescription} suggestion={suggestion}>
      <DiffViewer shape={shape}/>
    </ShapeRenderStore>
  );
}
