import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Button, CssBaseline, Paper} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Pagination from '@material-ui/lab/Pagination';
import {CompareEquality, getIndex, getOrUndefined, lengthScala, toOption, mapScala} from '@useoptic/domain';
import Drawer from '@material-ui/core/Drawer';
import {withEndpointsContext} from '../../../contexts/EndpointContext';
import {DocDivider, methodColors, methodColorsDark} from '../../requests/DocConstants';
import {DocSubGroup} from '../../requests/DocSubGroup';
import {Show} from '../../shared/Show';
import DiffHunkViewer from './DiffHunkViewer';
import List from '@material-ui/core/List';
import {InterpretationRow} from './DiffViewer';
import {IgnoreDiffContext} from './DiffPageNew';
import {withDiffContext} from './DiffContext';
import {withRfcContext} from '../../../contexts/RfcContext';
import Scrolling from './Scrolling';
import {ShapeExpandedStore} from './ShapeRenderContext';

const useStyles = makeStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  title: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center'
  },
  content: {
    display: 'flex',
    flexDirection: 'row'
  },
  leftContent: {
    flex: 1,
    padding: 12
  },
  rightDrawer: {
    width: 260,
    padding: 12,
    borderLeft: '1px solid',
    borderLeftColor: '#e0e0e0'
  }
}));


export default withDiffContext((props) => {
  const classes = useStyles();
  const {interactions, render, exampleOnly, suggestion, diffDescription, diff} = props;

  const length = lengthScala(interactions);

  const [interactionIndex, setInteractionIndex] = React.useState(1);

  const currentInteraction = getIndex(interactions)(interactionIndex - 1);

  const {request, response, httpMethod, url} = render(currentInteraction);

  const method = <Typography variant="body" component="span" style={{
    fontWeight: 400,
    color: '#ffffff',
    padding: 4,
    fontSize: 11,
    borderRadius: 2,
    marginTop: -3,
    backgroundColor: methodColorsDark[httpMethod.toUpperCase()]
  }}>{httpMethod.toUpperCase()}</Typography>;
  // const path = <Typography variant="subtitle1" component="span" style={{fontSize: 12}}>{fullPath}</Typography>;
  const renderedUrl = <Typography variant="subtitle1" component="span"
                                  style={{fontSize: 12}}>{currentInteraction.request.path}</Typography>;

  return (
    <ShapeExpandedStore>
    <div style={{padding: 12}}>
      <div className={classes.title}>
        <div style={{flex: 1}}/>
        <Pagination color="primary"
                    count={length}
                    page={interactionIndex}
                    showLastButton={length > 5}
                    size="small"
                    onChange={(e, pageNumber) => setInteractionIndex(pageNumber)}/>

      </div>
      <div className={classes.content}>
        <div className={classes.leftContent}>
          <div>{method} {url}</div>
          <Show when={request}>
            <DocSubGroup title={<Typography variant="subtitle1" color="primary" style={{marginTop: 15}}>Request
              Body</Typography>}>

              <Scrolling>
                <DiffHunkViewer suggestion={suggestion}
                                diff={diff}
                                exampleOnly={exampleOnly}
                                preview={request}
                                diffDescription={diffDescription}/>
              </Scrolling>
            </DocSubGroup>
          </Show>
          <Show when={response}>
            <DocSubGroup title={<Typography variant="subtitle1" color="primary" style={{marginTop: 15}}>Response
              Body</Typography>}>

              <Scrolling>
                <DiffHunkViewer suggestion={suggestion}
                                diff={diff}
                                exampleOnly={exampleOnly}
                                preview={response}
                                diffDescription={diffDescription}/>
              </Scrolling>
            </DocSubGroup>
          </Show>
        </div>
      </div>
    </div>
    </ShapeExpandedStore>
  );
});
