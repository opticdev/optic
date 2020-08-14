import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Pagination from '@material-ui/lab/Pagination';
import {
  CompareEquality,
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
import { BreadcumbX } from './DiffNewRegions';
import { primary } from '../../../theme';
import { useDiffDescription, useInteractionWithPointer } from './DiffHooks';
import LinearProgress from '@material-ui/core/LinearProgress';
import { DiffReviewLoading } from './LoadingNextDiff';
import { DiffViewSimulation } from './DiffViewSimulation';
import InteractionBodyViewer from './shape_viewers/InteractionBodyViewer';
import { track } from '../../../Analytics';

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

export class DiffReviewExpandedCached extends React.Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !CompareEquality.betweenBodyDiff(
      nextProps.selectedDiff || undefined,
      this.props.selectedDiff || undefined
    );
  }

  render() {
    const { selectedDiff, captureId, setSelectedDiff } = this.props;
    return (
      <DiffReviewExpanded
        diff={selectedDiff}
        captureId={captureId}
        {...{ selectedDiff, setSelectedDiff }}
      />
    );
  }
}

export const DiffReviewExpanded = (props) => {
  const classes = useStyles();
  const { diff, selectedDiff, setSelectedDiff, rfcContext, captureId } = props;

  const description = useDiffDescription(diff);

  const [selectedInterpretation, setSelectedInterpretationInner] = useState(
    null
  );

  const setSelectedInterpretation = (s) => {
    if (description && s) {
      track('Previewing Suggestion', {
        captureId,
        diff: description.title,
        diffAssertion: description.assertion,
        suggestion: s.action,
      });
    }
    setSelectedInterpretationInner(s);
  };
  useEffect(() => {
    // when diff changes, remove selection
    setSelectedInterpretation(null);
  }, [diff && diff.diff.toString()]);

  const { rfcId, rfcService, cachedQueryResults, eventStore } = useContext(
    RfcContext
  );

  const length = diff.interactionsCount;

  const [interactionIndex, setInteractionIndex] = React.useState(1);

  useEffect(() => {
    //reset interactions cursor whenever diff is updated. (it's 1 instead of 0 before of Pagination widget)
    setInteractionIndex(1);
  }, [diff && diff.diff.toString()]);

  const outerRfcState = rfcService.currentState(rfcId);
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
  track('Display Diff in Behavior Page', props);
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
                  {process.env.REACT_APP_FLATTENED_SHAPE_VIEWER === 'true' &&
                  diff.inRequest ? (
                    <InteractionBodyViewer
                      diff={diff.inRequest && diff}
                      diffDescription={description}
                      body={interactionScala.request.body}
                      selectedInterpretation={selectedInterpretation}
                    />
                  ) : (
                    <DiffViewSimulation
                      renderDiff={diff.inRequest}
                      diff={diff}
                      interactionScala={interactionScala}
                      description={description}
                      body={interactionScala.response.body} // TODO: shouldn't this be the request body?
                      outerRfcState={outerRfcState}
                      selectedInterpretation={selectedInterpretation}
                    />
                  )}
                </ShapeBox>
              }
              right={
                <DiffHelperCard
                  inRequest
                  description={description}
                  currentInteraction={interactionScala}
                  {...{
                    selectedDiff,
                    setSelectedDiff,
                    selectedInterpretation,
                    setSelectedInterpretation,
                  }}
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
                  {process.env.REACT_APP_FLATTENED_SHAPE_VIEWER === 'true' ? (
                    <InteractionBodyViewer
                      diff={diff.inResponse && diff}
                      diffDescription={description}
                      body={interactionScala.response.body}
                      selectedInterpretation={selectedInterpretation}
                    />
                  ) : (
                    <DiffViewSimulation
                      renderDiff={diff.inResponse}
                      diff={diff}
                      interactionScala={interactionScala}
                      description={description}
                      body={interactionScala.response.body}
                      outerRfcState={outerRfcState}
                      selectedInterpretation={selectedInterpretation}
                    />
                  )}
                </ShapeBox>
              }
              right={
                <DiffHelperCard
                  inResponse
                  description={description}
                  currentInteraction={interactionScala}
                  {...{
                    selectedDiff,
                    setSelectedDiff,
                    selectedInterpretation,
                    setSelectedInterpretation,
                  }}
                />
              }
            />
          </Show>
        </div>
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
