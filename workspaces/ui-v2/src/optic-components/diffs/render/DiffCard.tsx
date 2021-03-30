import React, { useEffect, useMemo, useState } from 'react';
import {
  AddedGreen,
  ChangedYellow,
  OpticBlue,
  OpticBlueLightened,
  OpticBlueReadable,
  primary,
  RemovedRed,
  secondary,
} from '../../theme';
import { makeStyles } from '@material-ui/styles';
import { Skeleton } from '@material-ui/lab';
import {
  code,
  ICopy,
  ICopyRender,
  ICopyRenderMultiline,
  plain,
} from './ICopyRender';
import BlockIcon from '@material-ui/icons/Block';
import WarningIcon from '@material-ui/icons/Warning';
import CheckIcon from '@material-ui/icons/Check';

import {
  Button,
  ListItemText,
  Tab,
  Tabs,
  Typography,
  withStyles,
} from '@material-ui/core';
import InteractionBodyViewerAllJS from './IDiffExampleViewer';
import {
  BodyPreview,
  IChangeType,
  IDiffDescription,
  IInteractionPreviewTab,
  ISuggestion,
} from '../../../lib/Interfaces';
import { SuggestionGroup } from './SuggestionGroup';
import { IJsonTrail } from '../../../../../cli-shared/build/diffs/json-trail';
import { IgnoreRule } from '../../../lib/ignore-rule';
import { useInteraction } from '../../../spectacle-implementations/interaction-loader';
import { LightTooltip } from '../../navigation/LightToolTip';

type IDiffCardProps = {
  changeType: IChangeType;
  suggestions: ISuggestion[];
  previewTabs: IInteractionPreviewTab[];
  diffDescription: IDiffDescription;
  approve: (diffHash: string, commands: any[]) => void;
  suggestionSelected: (commands: any[]) => void;
};

export function DiffCard({
  changeType,
  previewTabs,
  suggestions,
  diffDescription,
  approve,
  suggestionSelected,
}: IDiffCardProps) {
  const classes = useStyles();

  const color = (() => {
    if (changeType === 0) return AddedGreen;
    if (changeType === 1) return ChangedYellow;
    if (changeType === 2) return RemovedRed;
    return AddedGreen;
  })();

  const [previewTab, setPreviewTab] = useState(previewTabs[0].title);

  const selectedPreviewTab = previewTabs.find((i) => i.title === previewTab)!;

  useEffect(() => {
    setPreviewTab(previewTabs[0].title);
  }, [diffDescription.diffHash]);

  return (
    <>
      <div className={classes.titleHeader}>
        <Typography
          variant="caption"
          style={{ color: OpticBlueReadable, fontWeight: 600, marginRight: 3 }}
        >
          observed diff:{' '}
        </Typography>
        <ICopyRender variant="caption" copy={diffDescription.title} />
      </div>
      <div className={classes.preview}>
        {/*{isLoading && <LoadingExample lines={3} />}*/}
        {previewTabs.length && (
          <div className={classes.previewHeader}>
            <Typography
              variant="caption"
              style={{ color: OpticBlueReadable, marginRight: 5 }}
            >
              {/*{isNewRegion ? 'new body: ' : 'observed as: '}*/}
            </Typography>
            {previewTab && (
              <DiffTabs
                value={previewTab}
                style={{ marginBottom: 5 }}
                onChange={(e: any, newValue: any) => setPreviewTab(newValue)}
              >
                {previewTabs.map((tab, index) => (
                  <DiffTab
                    key={index}
                    label={tab.title}
                    value={tab.title}
                    invalid={tab.invalid}
                    selected={previewTab === tab.title}
                  />
                ))}
              </DiffTabs>
            )}
            <div style={{ flex: 1 }} />
            <IgnoreButton
              selectedPreviewTab={selectedPreviewTab}
              previewTabs={previewTabs}
            />
          </div>
        )}

        <div className={classes.previewScroll}>
          {previewTabs.map((tab, index) => {
            if (tab.title === previewTab) {
              return (
                <RenderExampleBody
                  description={diffDescription}
                  assertion={diffDescription.assertion}
                  trailsAreCorrect={!tab.invalid}
                  jsonTrails={tab.jsonTrailsByInteractions}
                  getJsonBodyToPreview={(interaction: any) => {
                    const body = diffDescription.getJsonBodyToPreview(
                      interaction
                    );
                    return body;
                  }}
                  interactionPointer={tab.interactionPointers[0]}
                />
              );
            } else {
              return null;
            }
          })}
        </div>

        {/*<InteractionBodyViewerAllJS*/}
        {/*  body={{*/}
        {/*    asJson: exampleGitHub,*/}
        {/*  }}*/}
        {/*/>*/}
      </div>

      <div className={classes.suggestionRegion}>
        <Typography
          variant="caption"
          component="div"
          style={{
            color: OpticBlueReadable,
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          suggested changes:
        </Typography>
        <SuggestionGroup
          suggestions={suggestions}
          onSuggestionSelected={(commands: any[]) => {
            suggestionSelected(commands);
          }}
          onApprove={(commands: any[]) => {
            approve(diffDescription.diffHash, commands);
          }}
        />
      </div>
    </>
  );
}

function RenderExampleBody({
  interactionPointer,
  getJsonBodyToPreview,
  jsonTrails,
  trailsAreCorrect,
  description,
  assertion,
}: {
  getJsonBodyToPreview: (interaction: any) => BodyPreview;
  interactionPointer: string;
  jsonTrails: { [key: string]: IJsonTrail[] };
  trailsAreCorrect: boolean;
  description: any;
  assertion: any;
}) {
  const { loading, data } = useInteraction(interactionPointer);
  const actualBody = useMemo<any | undefined>(() => {
    if (data) {
      return getJsonBodyToPreview(data);
    } else {
      return undefined;
    }
  }, [data]);

  if (actualBody) {
    return (
      <InteractionBodyViewerAllJS
        description={description}
        assertion={assertion}
        jsonTrails={jsonTrails[interactionPointer]}
        trailsAreCorrect={trailsAreCorrect}
        body={actualBody}
      />
    );
  }

  return <LoadingExample lines={50} />;
}

function LoadingExample({ lines = 3 }: { lines: number }) {
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
    alignItems: 'center',
    display: 'flex',
    justifyContents: 'center',
    padding: 8,
  },
  suggestionWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 1,
    flex: 1,
    flexBasis: 'auto',
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
    display: 'flex',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  previewHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 1,
  },
  previewScroll: {
    overflow: 'scroll',
  },
  suggestionRegion: {
    backgroundColor: 'white',
    padding: 8,
    paddingRight: 0,
  },
}));

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
})((props: any) => (
  <Tabs {...props} TabIndicatorProps={{ children: <div /> }} />
));

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
})((props: any) => {
  return (
    <Tab
      disableRipple
      fullWidth={props.fullWidth}
      value={props.value}
      onChange={props.onChange}
      selected={props.selected}
      classes={{ root: props.classes.root }}
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

function IgnoreButton({
  selectedPreviewTab,
  previewTabs,
}: {
  selectedPreviewTab: IInteractionPreviewTab;
  previewTabs: IInteractionPreviewTab[];
}) {
  const classes = useStyles();
  if (!selectedPreviewTab) {
    return null;
  }

  const lastOne =
    previewTabs.filter((i) => i.invalid).length === 1 &&
    selectedPreviewTab.invalid;

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
                style={{ color: 'black' }}
                copy={[
                  plain(
                    'Discarding these examples will change the suggestions Optic provides.'
                  ),
                ]}
              />
              {lastOne && (
                <Typography variant="caption" color="textPrimary">
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
            // endpointActions.addIgnoreRule(selectedPreviewTab.ignoreRule);
          }
        }}
        // disabled={!selectedPreviewTab && selectedPreviewTab.ignoreRule}
        className={classes.ignoreButton}
        size="small"
        endIcon={<BlockIcon style={{ width: 10, height: 10 }} />}
      >
        discard
      </Button>
    </LightTooltip>
  );
}
