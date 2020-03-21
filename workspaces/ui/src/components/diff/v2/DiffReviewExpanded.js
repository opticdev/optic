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


export default withRfcContext(withDiffContext(withEndpointsContext((props) => {
  const classes = useStyles();
  const {diff, title, endpointDescriptor, diffDescription, selectedInterpretation, acceptSuggestion, setSelectedDiff, selectedDiff, setSelectedInterpretation, rfcService, rfcId} = props;

  const currentRfcState = rfcService.currentState(rfcId);

  const interactions = diff.interactions;
  const length = lengthScala(interactions);

  const [interactionIndex, setInteractionIndex] = React.useState(1);
  const [ignoreSelected, setIgnoreSelected] = React.useState(false);

  const handleClickOpen = () => {
    setSelectedDiff(diff);
  };
  const handleClose = () => {
    setSelectedDiff(null);
    setSelectedInterpretation(null);
  };

  const apply = (ignoreDiff) => () => {
    if (selectedInterpretation) {
      if (ignoreSelected) {
        const toIgnore = selectedDiff.diff;
        setSelectedDiff(null);
        setSelectedInterpretation(null);
        ignoreDiff(toIgnore);
      } else {
        const suggestionToApply = selectedInterpretation;
        setSelectedDiff(null);
        setSelectedInterpretation(null);
        acceptSuggestion(suggestionToApply);
      }
    }
  };

  const currentInteraction = getIndex(interactions)(interactionIndex - 1);
  const diffInRequest = diff.inRequest;
  const diffInResponse = diff.inResponse;

  const {fullPath, httpMethod} = endpointDescriptor;
  const method = <Typography variant="body" component="span" style={{
    fontWeight: 400,
    color: '#ffffff',
    padding: 4,
    fontSize: 11,
    borderRadius: 2,
    marginTop: -3,
    backgroundColor: methodColorsDark[httpMethod.toUpperCase()]
  }}>{httpMethod.toUpperCase()}</Typography>
  const path = <Typography variant="subtitle1" component="span" style={{fontSize: 12}}>{fullPath}</Typography>;
  const url = <Typography variant="subtitle1" component="span"
                          style={{fontSize: 12}}>{currentInteraction.request.path}</Typography>;


  const renderedRequest = getOrUndefined(diff.previewRequest(currentInteraction, toOption(currentRfcState)));
  const renderedResponse = getOrUndefined(diff.previewResponse(currentInteraction, toOption(currentRfcState)));

  return (
    <div style={{padding: 12}}>
      <div className={classes.title}>
        <div>
          <div style={{display: 'flex', flexDirection: 'row'}}>{title}</div>
        </div>
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
          <div>{method} {path}</div>
          <Show when={renderedRequest}>
            <DocSubGroup title={<Typography variant="subtitle1" color="primary" style={{marginTop: 15}}>Request
              Body</Typography>}>

              <DiffHunkViewer suggestion={selectedInterpretation}
                              diff={diff}
                              preview={renderedRequest}
                              diffDescription={diffDescription}/>

            </DocSubGroup>
          </Show>
          <Show when={renderedResponse}>
            <DocSubGroup title={<Typography variant="subtitle1" color="primary" style={{marginTop: 15}}>Response
              Body</Typography>}>

              <DiffHunkViewer suggestion={selectedInterpretation}
                              diff={diff}
                              preview={renderedResponse}
                              diffDescription={diffDescription}/>

            </DocSubGroup>
          </Show>
        </div>
      </div>
    </div>

  );
})));
