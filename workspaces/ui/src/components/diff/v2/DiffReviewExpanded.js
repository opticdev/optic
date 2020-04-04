import React, {useContext, useEffect, useState} from 'react';
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
import {
  CompareEquality,
  getIndex,
  getOrUndefined,
  lengthScala,
  toOption,
  mapScala,
  JsonHelper,
  DiffPreviewer, headOrUndefined
} from '@useoptic/domain';
import Drawer from '@material-ui/core/Drawer';
import {withEndpointsContext} from '../../../contexts/EndpointContext';
import {DocDarkGrey, DocDivider, methodColors, methodColorsDark} from '../../requests/DocConstants';
import {DocSubGroup, DocSubGroupBig} from '../../requests/DocSubGroup';
import {Show} from '../../shared/Show';
import DiffHunkViewer from './DiffHunkViewer';
import List from '@material-ui/core/List';
import {InterpretationRow} from './DiffViewer';
import {IgnoreDiffContext} from './DiffPageNew';
import {DiffContext, withDiffContext} from './DiffContext';
import {RfcContext, withRfcContext} from '../../../contexts/RfcContext';
import Scrolling from './Scrolling';
import {ShapeExpandedStore} from './ShapeRenderContext';
import {PathAndMethod, PathAndMethodLarge} from './PathAndMethod';
import {DiffHelperCard} from './DiffHelperCard';
import SimulatedCommandContext from '../SimulatedCommandContext';
import {BreadcumbX} from './DiffPreview';
import {primary} from '../../../theme';

const useStyles = makeStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  title: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 30
    // justifyContent: 'center'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 25
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
  },
  innerRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  shapeBox: {
    backgroundColor: primary,
    borderRadius: 8,
    overflow: 'hidden'
  },
  headerBox: {
    padding: 6,
    paddingLeft: 0,
  }
}));


export default ((props) => {
  const classes = useStyles();
  const {diff} = props;
  const {description, interactions} = diff

  const {selectedInterpretation} = useContext(DiffContext)
  const {rfcId, rfcService, eventStore} = useContext(RfcContext)

  const length = lengthScala(interactions);

  const [interactionIndex, setInteractionIndex] = React.useState(1);

  useEffect(() => {
    //reset interactions cursor whenever diff is updated. (it's 1 instead of 0 before of Pagination widget)
    setInteractionIndex(1)
  }, [diff])


  const currentInteraction = getIndex(interactions)(interactionIndex - 1);
  const {method, path} = currentInteraction.request

  return (
    <ShapeExpandedStore>
    <div style={{padding: 12}}>
      <div className={classes.title}>
        <Typography variant="h6" color="primary">Observation</Typography>
        <div style={{flex: 1}}/>
        <Typography variant="overline" style={{color: DocDarkGrey}}>Examples</Typography>
        <Pagination color="primary"
                    count={length}
                    page={interactionIndex}
                    showLastButton={length > 5}
                    size="small"
                    onChange={(e, pageNumber) => setInteractionIndex(pageNumber)}/>
      </div>
      <DocDivider style={{marginTop: 10, marginBottom: 15}}/>

      <PathAndMethod path={path} method={method} />

      <div className={classes.content}>

        <Show when={currentInteraction.request.body.nonEmpty}>
        <InnerRow left={(
          <ShapeBox header={ <BreadcumbX
            itemStyles={{fontSize: 13, color: 'white'}}
            location={[`Request Body`, getOrUndefined(currentInteraction.request.body.contentType)]} />}>

            {(() => {
              if (diff.inRequest) {
                const simulatedCommands = selectedInterpretation ? JsonHelper.seqToJsArray(selectedInterpretation.commands) : [];
                return (
                  <SimulatedCommandContext
                    rfcId={rfcId}
                    eventStore={eventStore.getCopy(rfcId)}
                    commands={simulatedCommands}
                    shouldSimulate={true}
                  >
                    <RfcContext.Consumer>
                      {({rfcService, rfcId}) => {
                        const currentRfcState = rfcService.currentState(rfcId);
                        const preview = diff.previewRender(currentInteraction, toOption(currentRfcState))
                        return (
                          <DiffHunkViewer
                            suggestion={selectedInterpretation}
                            diff={diff}
                            preview={preview}
                            diffDescription={description}/>
                        )
                      }}
                    </RfcContext.Consumer>
                  </SimulatedCommandContext>
                );
              } else {
                return (
                  <DiffHunkViewer
                    exampleOnly
                    preview={getOrUndefined(DiffPreviewer.previewBody(currentInteraction.request.body))}/>
                )
              }
            })()}
          </ShapeBox>
        )} right={<DiffHelperCard inRequest/>} />

          <div style={{marginTop: 20, marginBottom: 20}}>
            <DocDivider />
          </div>

        </Show>


        <Show when={currentInteraction.response.body.nonEmpty}>
        <InnerRow left={(
          <ShapeBox header={ <BreadcumbX
            itemStyles={{fontSize: 13, color: 'white'}}
            location={[`${currentInteraction.response.statusCode} Response Body`, getOrUndefined(currentInteraction.response.body.contentType)]} />}>

            {(() => {
              if (diff.inResponse) {
                const simulatedCommands = selectedInterpretation ? JsonHelper.seqToJsArray(selectedInterpretation.commands) : [];
                return (
                  <SimulatedCommandContext
                    rfcId={rfcId}
                    eventStore={eventStore.getCopy(rfcId)}
                    commands={simulatedCommands}
                    shouldSimulate={true}
                  >
                    <RfcContext.Consumer>
                      {({rfcService, rfcId}) => {
                        const currentRfcState = rfcService.currentState(rfcId);
                        const preview = diff.previewRender(currentInteraction, toOption(currentRfcState))
                        return (
                          <DiffHunkViewer
                            suggestion={selectedInterpretation}
                            diff={diff}
                            preview={preview}
                            diffDescription={description}/>
                        )
                      }}
                    </RfcContext.Consumer>
                  </SimulatedCommandContext>
                );
              } else {
                return (
                  <DiffHunkViewer
                    exampleOnly
                    preview={getOrUndefined(DiffPreviewer.previewBody(currentInteraction.response.body))}/>
                )
              }

            })()}

          </ShapeBox>
        )} right={<DiffHelperCard inResponse/>} />
        </Show>
      </div>
      {/*  <div className={classes.leftContent}>*/}
      {/*    <div>{method} {url}</div>*/}
      {/*    <Show when={request}>*/}
      {/*      <DocSubGroup title={<Typography variant="subtitle1" color="primary" style={{marginTop: 15}}>Request*/}
      {/*        Body</Typography>}>*/}

      {/*        <Scrolling>*/}
      {/*          <DiffHunkViewer suggestion={suggestion}*/}
      {/*                          diff={diff}*/}
      {/*                          exampleOnly={exampleOnly}*/}
      {/*                          preview={request}*/}
      {/*                          diffDescription={diffDescription}/>*/}
      {/*        </Scrolling>*/}
      {/*      </DocSubGroup>*/}
      {/*    </Show>*/}
      {/*    <Show when={response}>*/}
      {/*      <DocSubGroup title={<Typography variant="subtitle1" color="primary" style={{marginTop: 15}}>Response*/}
      {/*        Body</Typography>}>*/}

      {/*        <Scrolling>*/}
      {/*          <DiffHunkViewer suggestion={suggestion}*/}
      {/*                          diff={diff}*/}
      {/*                          exampleOnly={exampleOnly}*/}
      {/*                          preview={response}*/}
      {/*                          diffDescription={diffDescription}/>*/}
      {/*        </Scrolling>*/}
      {/*      </DocSubGroup>*/}
      {/*    </Show>*/}
      {/*  </div>*/}
      {/*</div>*/}
    </div>
    </ShapeExpandedStore>
  );
});

const InnerRow = ({left, right}) => {

  const classes = useStyles()

  return (
    <div className={classes.innerRow}>
      <div style={{flex: 1, paddingRight: 25}}>{left}</div>
      <div style={{width: 250}}>{right}</div>
    </div>
  )

}

const ShapeBox = ({header, children}) => {

  const classes = useStyles()

  return (
    <div className={classes.shapeBox}>
      <div className={classes.headerBox}>{header}</div>
      <div>{children}</div>
    </div>
  )

}
