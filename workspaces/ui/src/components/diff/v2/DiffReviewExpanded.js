import React, { useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Pagination from '@material-ui/lab/Pagination';
import {
  DiffPreviewer,
  DiffResultHelper,
  getIndex,
  getOrUndefined,
  JsonHelper,
  lengthScala,
  toOption,
} from '@useoptic/domain';
import { DocDarkGrey, DocDivider } from '../../docs/DocConstants';
import { Show } from '../../shared/Show';
import DiffHunkViewer from './DiffHunkViewer';
import { DiffContext } from './DiffContext';
import { RfcContext } from '../../../contexts/RfcContext';
import { ShapeExpandedStore } from './shape_viewers/ShapeRenderContext';
import { PathAndMethod } from './PathAndMethod';
import { DiffHelperCard } from './DiffHelperCard';
import SimulatedCommandContext from '../SimulatedCommandContext';
import { BreadcumbX } from './DiffPreview';
import { primary } from '../../../theme';
import { useDiffDescription, useInteractionWithPointer } from './DiffHooks';
import LinearProgress from '@material-ui/core/LinearProgress';
import { DiffReviewLoading } from './LoadingNextDiff';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  title: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 30,
    // justifyContent: 'center'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 25,
  },
  leftContent: {
    flex: 1,
    padding: 12,
  },
  rightDrawer: {
    width: 260,
    padding: 12,
    borderLeft: '1px solid',
    borderLeftColor: '#e0e0e0',
  },
  innerRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  shapeBox: {
    backgroundColor: primary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  headerBox: {
    padding: 6,
    paddingLeft: 0,
  },
}));

export default (props) => {
  const classes = useStyles();
  const { diff } = props;

  const ds = diff.toString();

  const description = useDiffDescription(diff);

  const { selectedInterpretation } = useContext(DiffContext);
  const { rfcId, rfcService, cachedQueryResults, eventStore } = useContext(
    RfcContext
  );

  const length = diff.interactionsCount;

  const [interactionIndex, setInteractionIndex] = React.useState(1);

  useEffect(() => {
    //reset interactions cursor whenever diff is updated. (it's 1 instead of 0 before of Pagination widget)
    setInteractionIndex(1);
  }, [diff]);
  const currentRfcState = rfcService.currentState(rfcId);
  const { shapesResolvers } = cachedQueryResults;

  const currentInteractionPointer = getIndex(diff.interactionPointers)(
    interactionIndex - 1
  );

  const currentInteraction = useInteractionWithPointer(
    currentInteractionPointer
  );

  if (!currentInteraction || !description) {
    return <DiffReviewLoading show={true} />;
  }

  const { interaction, interactionScala } = currentInteraction;

  const { method, path } = interactionScala.request;

  return (
    <ShapeExpandedStore>
      <div>
        <div className={classes.title}>
          <Typography variant="h6" color="primary">
            Observation
          </Typography>
          <div style={{ flex: 1 }} />
          <Typography variant="overline" style={{ color: DocDarkGrey }}>
            Examples
          </Typography>
          <Pagination
            color="primary"
            count={length}
            page={interactionIndex}
            showLastButton={length > 5}
            size="small"
            onChange={(e, pageNumber) => setInteractionIndex(pageNumber)}
          />
        </div>
        <DocDivider style={{ marginTop: 10, marginBottom: 15 }} />

        <PathAndMethod path={path} method={method} />

        <div className={classes.content}>
          <Show when={interactionScala.request.body.nonEmpty}>
            <InnerRow
              left={
                <ShapeBox
                  header={
                    <BreadcumbX
                      itemStyles={{ fontSize: 13, color: 'white' }}
                      location={[
                        `Request Body`,
                        getOrUndefined(
                          interactionScala.request.body.contentType
                        ),
                      ]}
                    />
                  }
                >
                  {(() => {
                    if (diff.inRequest) {
                      const simulatedCommands = selectedInterpretation
                        ? JsonHelper.seqToJsArray(
                            selectedInterpretation.commands
                          )
                        : [];
                      return (
                        <SimulatedCommandContext
                          rfcId={rfcId}
                          eventStore={eventStore.getCopy(rfcId)}
                          commands={simulatedCommands}
                          shouldSimulate={true}
                        >
                          <RfcContext.Consumer>
                            {({ rfcService, rfcId }) => {
                              const currentRfcState = rfcService.currentState(
                                rfcId
                              );

                              const preview = DiffResultHelper.previewDiff(
                                diff,
                                interactionScala,
                                currentRfcState
                              );

                              return (
                                <DiffHunkViewer
                                  suggestion={selectedInterpretation}
                                  diff={diff}
                                  preview={getOrUndefined(preview)}
                                  diffDescription={description}
                                />
                              );
                            }}
                          </RfcContext.Consumer>
                        </SimulatedCommandContext>
                      );
                    } else {
                      return (
                        <DiffHunkViewer
                          exampleOnly
                          preview={getOrUndefined(
                            DiffResultHelper.previewBody(
                              interactionScala.request.body,
                              currentRfcState
                            )
                          )}
                        />
                      );
                    }
                  })()}
                </ShapeBox>
              }
              right={
                <DiffHelperCard
                  inRequest
                  description={description}
                  currentInteraction={interactionScala}
                />
              }
            />

            <div style={{ marginTop: 20, marginBottom: 20 }}>
              <DocDivider />
            </div>
          </Show>

          <Show when={interactionScala.response.body.nonEmpty}>
            <InnerRow
              left={
                <ShapeBox
                  header={
                    <BreadcumbX
                      itemStyles={{ fontSize: 13, color: 'white' }}
                      location={[
                        `${interactionScala.response.statusCode} Response Body`,
                        getOrUndefined(
                          interactionScala.response.body.contentType
                        ),
                      ]}
                    />
                  }
                >
                  {(() => {
                    if (diff.inResponse) {
                      const simulatedCommands = selectedInterpretation
                        ? JsonHelper.seqToJsArray(
                            selectedInterpretation.commands
                          )
                        : [];
                      return (
                        <SimulatedCommandContext
                          rfcId={rfcId}
                          eventStore={eventStore.getCopy(rfcId)}
                          commands={simulatedCommands}
                          shouldSimulate={true}
                        >
                          <RfcContext.Consumer>
                            {({ rfcService, rfcId }) => {
                              const currentRfcState = rfcService.currentState(
                                rfcId
                              );
                              const preview = DiffResultHelper.previewDiff(
                                diff,
                                interactionScala,
                                currentRfcState
                              );
                              return (
                                <DiffHunkViewer
                                  suggestion={selectedInterpretation}
                                  diff={diff}
                                  preview={getOrUndefined(preview)}
                                  diffDescription={description}
                                />
                              );
                            }}
                          </RfcContext.Consumer>
                        </SimulatedCommandContext>
                      );
                    } else {
                      return (
                        <DiffHunkViewer
                          exampleOnly
                          preview={getOrUndefined(
                            DiffResultHelper.previewBody(
                              interactionScala.response.body,
                              currentRfcState
                            )
                          )}
                        />
                      );
                    }
                  })()}
                </ShapeBox>
              }
              right={
                <DiffHelperCard
                  inResponse
                  description={description}
                  currentInteraction={interactionScala}
                />
              }
            />
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
};

const InnerRow = ({ left, right }) => {
  const classes = useStyles();

  return (
    <div className={classes.innerRow}>
      <div style={{ flex: 1, paddingRight: 25 }}>{left}</div>
      <div style={{ width: 250 }}>{right}</div>
    </div>
  );
};

export const ShapeBox = ({ header, children }) => {
  const classes = useStyles();

  return (
    <div className={classes.shapeBox}>
      <div className={classes.headerBox}>{header}</div>
      <div>{children}</div>
    </div>
  );
};
