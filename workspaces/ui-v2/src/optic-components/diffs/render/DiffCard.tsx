import React, { useEffect, useMemo, useState } from 'react';
import {
  AddedGreen,
  OpticBlue,
  OpticBlueLightened,
  OpticBlueReadable,
  secondary,
} from '../../theme';
import { makeStyles } from '@material-ui/styles';
import { Skeleton } from '@material-ui/lab';
import { ICopyRender } from './ICopyRender';
import WarningIcon from '@material-ui/icons/Warning';
import CheckIcon from '@material-ui/icons/Check';

import { Tab, Tabs, Typography, withStyles } from '@material-ui/core';
import InteractionBodyViewerAllJS from './IDiffExampleViewer';
import {
  BodyPreview,
  IDiffDescription,
  IInteractionPreviewTab,
  IPatchChoices,
} from '../../../lib/Interfaces';
import { IJsonTrail } from '../../../../../cli-shared/build/diffs/json-trail';
import { BuildSpecPatch } from './BuildSpecPatch';
import { useInteraction } from '../../hooks/useInteraction';
import { useSharedDiffContext } from '../../hooks/diffs/SharedDiffContext';

type IDiffCardProps = {
  previewTabs: IInteractionPreviewTab[];
  diffDescription: IDiffDescription;
  approve: () => void;
  ignore: () => void;
  handled: boolean;
  specChoices?: IPatchChoices;
  updatedSpecChoices: (choices?: IPatchChoices) => void;
};

export function DiffCard({
  previewTabs,
  diffDescription,
  approve,
  ignore,
  specChoices,
  updatedSpecChoices,
}: IDiffCardProps) {
  const classes = useStyles();

  const [previewTab, setPreviewTab] = useState(
    previewTabs.length ? previewTabs[0].title : undefined
  );

  useEffect(() => {
    if (previewTabs.length) {
      setPreviewTab(previewTabs[0].title);
    }
  }, [previewTabs.length, setPreviewTab, previewTabs]);

  useEffect(() => {
    if (previewTabs.length) {
      setPreviewTab(previewTabs[0].title);
    }
  }, [diffDescription.diffHash, setPreviewTab, previewTabs]);

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
        {previewTabs.length && (
          <div className={classes.previewHeader}>
            {previewTab && (
              <DiffTabs
                value={previewTab}
                style={{ marginBottom: 5 }}
                onChange={(e: any, newValue: any) => setPreviewTab(newValue)}
              >
                {previewTabs.map((tab, index) => (
                  <DiffTab
                    key={tab.title}
                    label={tab.title}
                    value={tab.title}
                    invalid={tab.invalid}
                    selected={previewTab === tab.title}
                  />
                ))}
              </DiffTabs>
            )}
          </div>
        )}

        <div className={classes.previewScroll}>
          {previewTabs.map((tab, index) => {
            if (tab.title === previewTab) {
              return (
                <RenderExampleBody
                  key={tab.title}
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
      </div>

      <div className={classes.suggestionRegion}>
        <BuildSpecPatch
          approved={approve}
          diffHash={diffDescription.diffHash}
          patchChoices={specChoices}
          onPathChoicesUpdated={updatedSpecChoices}
          ignore={ignore}
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
  const { captureId } = useSharedDiffContext();
  const { data } = useInteraction(captureId, interactionPointer);
  const actualBody = useMemo<any | undefined>(() => {
    if (data) {
      return getJsonBodyToPreview(data);
    } else {
      return undefined;
    }
  }, [data, getJsonBodyToPreview]);

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
