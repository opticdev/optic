import React, { useEffect, useMemo, useState } from 'react';
import { useDiffSession } from './ReviewDiffSession';
// eslint-disable-next-line no-unused-vars
import { useActor, useMachine } from '@xstate/react';
import WarningIcon from '@material-ui/icons/Warning';
import { useContext } from 'react';
import { useEndpointDiffSession } from './ReviewEndpoint';
import { createEndpointDescriptor } from '../../../utilities/EndpointUtilities';
import BlockIcon from '@material-ui/icons/Block';
import CheckIcon from '@material-ui/icons/Check';
import { stuffFromQueries } from '../../../contexts/RfcContext';
import sortby from 'lodash.sortby';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import { HardCodedDiffExamples } from '../v2/shape_viewers/DiffReviewTypes';
import {
  AddedDarkGreen,
  AddedGreen,
  AddedGreenBackground,
  ChangedYellow,
  OpticBlue,
  OpticBlueLightened,
  OpticBlueReadable,
  primary,
  RemovedRed,
  secondary,
  SubtleBlueBackground,
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
import { ICopyRender, ICopyRenderMultiline } from './ICopyRender';
import Skeleton from '@material-ui/lab/Skeleton';
import InteractionBodyViewerAllJS from '../v2/shape_viewers/InteractionBodyViewerAllJS';
import { SuggestionSelect } from './SuggestionSelect';
import Fade from '@material-ui/core/Fade';
import { plain, code, bold } from '../../../engine/interfaces/interpretors';
import Menu from '@material-ui/core/Menu';
import Grow from '@material-ui/core/Grow';
import { LightTooltip } from '../../tooltips/LightTooltip';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';

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

  const { endpointActions } = useEndpointDiffSession();

  const { diff, diffRef, diffQueries, diffActions } = useSingleDiffSession();
  const status = diffQueries.status();

  const isLoading = !status.ready;
  const isHandled = status.ready && status.ready === 'handled';
  const ignoredAll = isHandled && diffQueries.ignoredAll();
  const readyStatus = status.ready;

  const preview = useMemo(() => diffQueries.preview(), [
    isLoading,
    readyStatus,
    diffQueries.ignoreRules().length, // reload the preview if the ignore rule count changes
  ]);

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
      if (previewTabs.length > 0) setPreviewTab(previewTabs[0].title);
    },
    [previewTabs.length]
  );

  console.log(
    diff.diffHash + 'look here ',
    previewTabs.map((i) => i.title)
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
        <div>
          <SuggestionSelect
            suggestions={suggestions}
            selectedSuggestionIndex={selectedSuggestionIndex}
            setSelectedSuggestionIndex={diffActions.setSelectedSuggestionIndex}
            stage={diffActions.stage}
          />
        </div>
      </Fade>
    </>
  );

  const approvedHeader = isHandled && (
    <>
      <div className={classes.titleHeader} style={{ paddingLeft: 10 }}>
        <ICopyRender
          variant="caption"
          copy={
            ignoredAll
              ? [bold('IGNORED: '), ...title]
              : suggestions[selectedSuggestionIndex] &&
                suggestions[selectedSuggestionIndex].action.pastTense
          }
        />
      </div>
      <div style={{ flex: 1 }} />
      <div className={classes.titleHeader} style={{ marginRight: 5 }}>
        {ignoredAll ? (
          <Button
            size="small"
            color="primary"
            onClick={diffActions.reset}
            style={{ fontSize: 10, fontWeight: 800 }}
          >
            Reset Diff
          </Button>
        ) : (
          <Button
            size="small"
            color="primary"
            onClick={diffActions.unstage}
            style={{ fontSize: 10, fontWeight: 800 }}
          >
            Unstage
          </Button>
        )}
      </div>
    </>
  );

  return (
    <Card
      className={classes.root}
      square
      elevation={0}
      style={{ marginBottom: 0 }}
    >
      <div className={classes.cardHeader} style={{ backgroundColor: 'white' }}>
        {isHandled ? approvedHeader : openHeader}
      </div>
      <Collapse in={!isHandled}>
        <div className={classes.preview}>
          {isLoading && <LoadingExample lines={3} />}
          {previewTabs.length && (
            <div className={classes.previewHeader}>
              <Typography
                variant="caption"
                style={{ color: OpticBlueReadable, marginRight: 5 }}
              >
                observed as:
              </Typography>
              <DiffTabs
                value={previewTab}
                style={{ marginBottom: 5 }}
                onChange={(e, newValue) => setPreviewTab(newValue)}
              >
                {previewTabs.map((tab, index) => (
                  <DiffTab
                    label={tab.title}
                    value={tab.title}
                    invalid={tab.invalid}
                    selected={previewTab === tab.title}
                  />
                ))}
              </DiffTabs>
              <div style={{ flex: 1 }} />
              <IgnoreButton
                {...{ endpointActions, preview, selectedPreviewTab }}
              />
              <Button
                size="small"
                className={classes.ignoreButton}
                style={{ marginRight: 5 }}
                endIcon={<OpenInNewIcon style={{ width: 12, height: 12 }} />}
              >
                expand example
              </Button>
            </div>
          )}

          {previewTabs.map((i) => {
            return (
              <RenderPreviewBody
                show={previewTab === i.title}
                key={i.title}
                description={loadingDescription}
                pointer={i.interactionPointers[0]}
                assertion={i.assertion}
                jsonTrailsByInteractions={i.jsonTrailsByInteractions}
                trailsAreInvalid={i.invalid}
                diff={diff}
              />
            );
          })}
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
    trailsAreInvalid,
    show,
  } = props;
  const { loadInteraction } = useDiffSession();
  const [wasShown, setShown] = useState(show);

  const [interaction, setInteraction] = useState(null);
  const [didError, setError] = useState(null);
  const bodyPreview = useMemo(
    () => interaction && description.getJsonBodyToPreview(interaction),
    [interaction, didError]
  );

  useEffect(() => {
    if (show && !wasShown) setShown(true);
  }, [show]);

  useEffect(() => {
    if (wasShown) {
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
    }
  }, [pointer, wasShown]);

  if (!show) {
    return null;
  }

  if (!diff || !pointer || !bodyPreview || !interaction) {
    return <LoadingExample lines={5} />;
  }

  return (
    <InteractionBodyViewerAllJS
      description={description}
      body={bodyPreview}
      assertion={assertion}
      jsonTrails={jsonTrailsByInteractions[pointer] || []}
      trailsAreCorrect={!trailsAreInvalid}
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
      paddingLeft: 3,
      paddingRight: 2,
      height: 20,
      zIndex: 100,
      minHeight: 'inherit',
      minWidth: 'inherit',
      maxWidth: 300,
      fontWeight: 800,
      fontFamily: 'Ubuntu Mono',
      fontSize: theme.typography.pxToRem(12),
      marginRight: theme.spacing(2),
      '&:focus': {
        opacity: 1,
      },
    },
    checkIcons: {
      width: 10,
      height: 10,
      marginLeft: 4,
    },
  };
})((props) => {
  return (
    <Tab
      disableRipple
      {...props}
      label={
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {props.label}
          {props.invalid ? (
            <WarningIcon
              className={props.classes.checkIcons}
              style={{ color: secondary }}
            />
          ) : (
            <CheckIcon
              className={props.classes.checkIcons}
              style={{ color: AddedGreen }}
            />
          )}
        </div>
      }
    />
  );
});

const useStyles = makeStyles((theme) => ({
  root: {
    margin: '0 auto',
    borderBottom: '1px solid #e2e2e2',
  },
  ignoreButton: {
    color: '#e2e2e2',
    padding: 0,
    marginRight: 17,
    fontWeight: 800,
    textTransform: 'none',
    fontFamily: 'Ubuntu Mono',
    whiteSpace: 'nowrap',
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
    alignItems: 'center',
    paddingLeft: 10,
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

function IgnoreButton({ selectedPreviewTab, preview, endpointActions }) {
  const classes = useStyles();
  if (!selectedPreviewTab) {
    return null;
  }

  const lastOne = preview.tabs.filter((i) => i.invalid).length === 1;

  return (
    <LightTooltip
      style={{ padding: 0 }}
      title={
        <ListItemText
          style={{ maxWidth: 350 }}
          primary={
            <ICopyRender
              variant="caption"
              copy={[
                plain('mark examples that are'),
                code(selectedPreviewTab && selectedPreviewTab.title),
                plain('incorrect'),
              ]}
            />
          }
          secondary={
            <>
              <ICopyRenderMultiline
                variant="caption"
                copy={[
                  plain(
                    'Marking these examples as incorrect tells Optic not to suggest changes to the spec that make these examples valid'
                  ),
                ]}
              />
              {lastOne && (
                <Typography variant="caption" color="error">
                  This is the last example that produces this diff. The diff
                  will be marked as handled if you choose to ignore it.
                </Typography>
              )}
            </>
          }
        />
      }
    >
      <Button
        onClick={() => {
          if (selectedPreviewTab) {
            endpointActions.addIgnoreRule(selectedPreviewTab.ignoreRule);
          }
        }}
        disabled={!selectedPreviewTab && selectedPreviewTab.ignoreRule}
        className={classes.ignoreButton}
        size="small"
        endIcon={<BlockIcon style={{ width: 10, height: 10 }} />}
      >
        mark as incorrect
      </Button>
    </LightTooltip>
  );
}
