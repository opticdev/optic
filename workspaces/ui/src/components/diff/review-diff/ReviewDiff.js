import React, { useEffect, useMemo, useState } from 'react';
import { useDiffSession } from './ReviewDiffSession';
// eslint-disable-next-line no-unused-vars
import { useActor, useMachine } from '@xstate/react';
import { useContext } from 'react';
import { useEndpointDiffSession } from './ReviewEndpoint';
import { createEndpointDescriptor } from '../../../utilities/EndpointUtilities';
import { stuffFromQueries } from '../../../contexts/RfcContext';
import sortby from 'lodash.sortby';
import { HardCodedDiffExamples } from '../v2/shape_viewers/DiffReviewTypes';
import {
  AddedGreen,
  ChangedYellow,
  OpticBlue,
  OpticBlueLightened,
  primary,
  RemovedRed,
  secondary,
  UpdatedBlue,
  UpdatedBlueBackground,
} from '../../../theme';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import Card from '@material-ui/core/Card';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import InteractionBodyViewer from '../v2/shape_viewers/InteractionBodyViewer';
import { makeStyles } from '@material-ui/core/styles';
import withStyles from '@material-ui/core/styles/withStyles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { DocDarkGrey } from '../../docs/DocConstants';
import { ICopyRender } from './ICopyRender';
import Skeleton from '@material-ui/lab/Skeleton';
import InteractionBodyViewerAllJS from '../v2/shape_viewers/InteractionBodyViewerAllJS';
import { SuggestionSelect } from './SuggestionSelect';
import Fade from '@material-ui/core/Fade';

export const SingleDiffSessionContext = React.createContext(null);

export function useSingleDiffSession() {
  return useContext(SingleDiffSessionContext);
}

export function ReviewDiff(props) {
  const { diff } = props;

  const { endpointQueries, makeDiffActorHook } = useEndpointDiffSession();

  const useDiffActor = makeDiffActorHook(diff.diffHash);

  const { value, context, diffQueries, diffActions } = useDiffActor();

  useEffect(() => diffActions.showing(), []);

  const reactContext = {
    diff,
    value,
    diffQueries,
    diffActions,
  };

  return (
    <SingleDiffSessionContext.Provider value={reactContext}>
      <DiffSummaryRegion />
    </SingleDiffSessionContext.Provider>
  );
}

export function DiffSummaryRegion(props) {
  const classes = useStyles();
  const { diff, diffRef, diffQueries, diffActions } = useSingleDiffSession();
  const status = diffQueries.status();

  const isLoading = !status.ready;
  const isHandled = status.ready && status.ready === 'handled';

  const preview = useMemo(() => diffQueries.preview(), [isLoading]);

  const suggestions = preview ? preview.suggestions : [];
  const selectedSuggestionIndex = diffQueries.selectedSuggestionIndex();

  const loadingDescription = useMemo(() => diffQueries.description(), []);
  const { changeType } = loadingDescription;

  const title = (preview && preview.overrideTitle) || loadingDescription.title;
  const previewTabs = (preview && preview.tabs) || [];
  const [previewTab, setPreviewTab] = useState(undefined);
  const selectedPreviewTab = previewTabs.find((i) => i.title === previewTab);
  useEffect(
    // set to first tab once preview loads
    () => {
      if (!previewTab && previewTabs.length > 0)
        setPreviewTab(previewTabs[0].title);
    },
    [previewTabs.length]
  );

  const color = (() => {
    if (changeType === 0) return AddedGreen;
    if (changeType === 1) return ChangedYellow;
    if (changeType === 2) return RemovedRed;
  })();

  const openHeader = (
    <>
      <div className={classes.titleHeader}>
        <FiberManualRecordIcon
          style={{ width: 15, marginLeft: 5, marginRight: 5, color }}
        />
        <ICopyRender variant="caption" copy={title} />
      </div>
      <div style={{ flex: 1 }} />

      <Fade in={suggestions.length}>
        <SuggestionSelect
          suggestions={suggestions}
          selectedSuggestionIndex={selectedSuggestionIndex}
          setSelectedSuggestionIndex={diffActions.setSelectedSuggestionIndex}
          stage={diffActions.stage}
        />
      </Fade>
    </>
  );

  const approvedHeader = isHandled && (
    <>
      <div className={classes.titleHeader} style={{ paddingLeft: 10 }}>
        <ICopyRender
          variant="caption"
          copy={suggestions[selectedSuggestionIndex].action.pastTense}
        />
      </div>
      <div style={{ flex: 1 }} />
      <div className={classes.titleHeader} style={{ marginRight: 5 }}>
        <Button
          size="small"
          color="primary"
          onClick={diffActions.unstage}
          style={{ fontSize: 10, fontWeight: 800 }}
        >
          Unstage
        </Button>
      </div>
    </>
  );

  return (
    <Card
      className={classes.root}
      elevation={2}
      style={{ marginBottom: isHandled ? 15 : 50 }}
    >
      <div className={classes.cardHeader}>
        {isHandled ? approvedHeader : openHeader}
      </div>
      <Collapse in={!isHandled}>
        {/*<div className={classes.cardInner}>*/}
        {/* this will be where we show more informatino about the diff */}
        {/*  <div className={classes.location}>*/}
        {/*    /!*{locationRender}*!/*/}
        {/*    /!*<div style={{ marginTop: 5 }}>*!/*/}
        {/*    /!*  Traffic observed from tasks{' '}*!/*/}
        {/*    /!*  {tasks*!/*/}
        {/*    /!*    .map((i) => <Code>{i}</Code>)*!/*/}
        {/*    /!*    .reduce((prev, curr) => [prev, ', ', curr])}*!/*/}
        {/*    /!*</div>*!/*/}
        {/*  </div>*/}
        {/*</div>*/}
        <div className={classes.preview}>
          {isLoading && <LoadingExample lines={3} />}
          <div className={classes.previewHeader}>
            <DiffTabs
              value={previewTab}
              style={{ marginBottom: 5 }}
              onChange={(e, newValue) => setPreviewTab(newValue)}
            >
              {previewTabs.map((tab, index) => (
                <DiffTab label={tab.title} value={tab.title} />
              ))}
            </DiffTabs>
            <div style={{ flex: 1 }} />
            <Button
              size="small"
              style={{ color: 'white' }}
              endIcon={<OpenInNewIcon />}
            >
              Expand Example
            </Button>
          </div>
          <RenderPreviewBody
            description={loadingDescription}
            pointer={
              selectedPreviewTab && selectedPreviewTab.interactionPointers[0]
            }
            assertion={selectedPreviewTab && selectedPreviewTab.assertion}
            jsonTrailsByInteractions={
              selectedPreviewTab && selectedPreviewTab.jsonTrailsByInteractions
            }
            diff={diff}
          />
          {/*<InteractionBodyViewer*/}
          {/*  diff={undefined}*/}
          {/*  key={JSON.stringify(jsonExample)}*/}
          {/*  diffDescription={undefined}*/}
          {/*  selectedInterpretation={undefined}*/}
          {/*  jsonBody={jsonExample}*/}
          {/*/>*/}
        </div>
      </Collapse>
    </Card>
  );
}

function RenderPreviewBody(props) {
  const {
    diff,
    description,
    assertion,
    pointer,
    jsonTrailsByInteractions,
  } = props;
  const { loadInteraction } = useDiffSession();

  const [interaction, setInteraction] = useState(null);
  const [didError, setError] = useState(null);
  const bodyPreview = useMemo(
    () => interaction && description.getJsonBodyToPreview(interaction),
    [interaction, didError]
  );

  useEffect(() => {
    if (pointer) {
      loadInteraction(pointer)
        .then((i) => {
          setInteraction(i.interaction);
        })
        .catch((e) => setError(e));
    } else {
      setError(null);
      setInteraction(null);
    }
  }, [pointer]);

  if (!diff || !pointer || !interaction) {
    return <LoadingExample lines={1} />;
  }

  console.log('loaded body preview for interaction ', bodyPreview);

  return (
    <InteractionBodyViewerAllJS
      description={description}
      body={bodyPreview}
      assertion={assertion}
      jsonTrails={jsonTrailsByInteractions[pointer] || []}
      diff={diff}
    />
  );
}

const DiffTabs = withStyles({
  root: {
    // height: 29,
    paddingLeft: 7,
    minHeight: 'inherit',
  },
  indicator: {
    display: 'flex',
    justifyContent: 'center',
    color: secondary,
    backgroundColor: 'transparent',
    '& > div': {
      width: '100%',
      backgroundColor: secondary,
    },
  },
})((props) => <Tabs {...props} TabIndicatorProps={{ children: <div /> }} />);

const DiffTab = withStyles((theme) => {
  return {
    root: {
      textTransform: 'none',
      color: 'white',
      padding: 0,
      marginTop: 5,
      height: 20,
      minHeight: 'inherit',
      minWidth: 'inherit',
      fontWeight: 400,
      fontFamily: 'Ubuntu Mono',
      fontSize: theme.typography.pxToRem(12),
      marginRight: theme.spacing(2),
      '&:focus': {
        opacity: 1,
      },
    },
  };
})((props) => <Tab disableRipple {...props} />);

const useStyles = makeStyles((theme) => ({
  root: {
    margin: '0 auto',
  },
  diffText: {
    fontFamily: 'Ubuntu Mono',
    fontSize: 15,
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'row',
    padding: 3,
    alignItems: 'flex-start',
  },
  titleHeader: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
  },
  cardInner: {
    padding: 6,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'start',
  },
  interpretations: {
    width: 400,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  preview: {
    backgroundColor: OpticBlue,
  },
  location: {
    padding: 5,
    paddingTop: 8,
    flex: 1,
    fontFamily: 'Ubuntu Mono',
    color: DocDarkGrey,
  },
  previewHeader: {
    display: 'flex',
    flexDirection: 'row',
    paddingRight: 4,
  },
}));

function LoadingExample({ lines = 3 }) {
  const linesI = new Array(lines).fill(null);
  return (
    <div>
      {linesI.map((_, index) => (
        <Skeleton
          animation="pulse"
          key={index}
          style={{ backgroundColor: OpticBlueLightened }}
        />
      ))}
    </div>
  );
}
