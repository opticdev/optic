import React, { useState } from 'react';
import {
  AddedGreen,
  ChangedYellow,
  OpticBlue,
  OpticBlueLightened,
  OpticBlueReadable,
  RemovedRed,
  secondary,
} from '../../theme';
import { makeStyles } from '@material-ui/styles';
import { Skeleton } from '@material-ui/lab';
import { ICopy } from './ICopyRender';
import WarningIcon from '@material-ui/icons/Warning';
import CheckIcon from '@material-ui/icons/Check';

import { Tab, Tabs, Typography, withStyles } from '@material-ui/core';
import InteractionBodyViewerAllJS from './IDiffExampleViewer';
import { IChangeType, ISuggestion } from '../../../lib/Interfaces';
import { SuggestionGroup } from './SuggestionGroup';

type IDiffCardProps = {
  changeType: IChangeType;
  suggestions: ISuggestion[];
};

export function DiffCard({ changeType, suggestions }: IDiffCardProps) {
  const classes = useStyles();

  // const color = (() => {
  //   if (changeType === 0) return AddedGreen;
  //   if (changeType === 1) return ChangedYellow;
  //   if (changeType === 2) return RemovedRed;
  //   return AddedGreen;
  // })();

  // return (
  //   <>
  //     <div className={classes.titleHeader}>
  //       <FiberManualRecordIcon
  //         style={{ width: 15, marginLeft: 5, marginRight: 5, color }}
  //       />
  //       <ICopyRender
  //         variant="caption"
  //         copy={[
  //           {
  //             text: 'Undocumented Field ',
  //             style: ICopyStyle.Bold,
  //           },
  //           {
  //             text: 'thisField',
  //             style: ICopyStyle.Code,
  //           },
  //         ]}
  //       />
  //     </div>
  //     <div style={{ flex: 1 }} />
  //   </>
  // );

  const previewTabs: IInteractionPreviewTab[] = [
    { title: 'was string', allowsExpand: true, assertion: [], invalid: true },
    { title: 'was number', allowsExpand: true, assertion: [], invalid: true },
  ];

  const [previewTab, setPreviewTab] = useState(previewTabs[0].title);

  return (
    <>
      <div className={classes.suggestionRegion}>
        <SuggestionGroup suggestions={suggestions} />
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
                // onChange={(e, newValue) => setPreviewTab(newValue)}
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
          </div>
        )}
        <InteractionBodyViewerAllJS
          body={{
            asJson: exampleGitHub,
          }}
        />
      </div>
    </>
  );
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
    minHeight: 32,
    display: 'flex',
    alignItems: 'center',
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
    overflow: 'scroll',
  },
  previewHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 4,
    position: 'sticky',
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

export interface IInteractionPreviewTab {
  title: string;
  allowsExpand: boolean;
  invalid: boolean;
  assertion: ICopy[];
  // jsonTrailsByInteractions: { [key: string]: IJsonTrail[] };
  // interactionPointers: string[];
  // ignoreRule: IgnoreRule;
}

const exampleGitHub = {
  url: 'https://api.github.com/repos/octocat/Hello-World/pulls/1347',
  id: 1,
  node_id: 'MDExOlB1bGxSZXF1ZXN0MQ==',
  html_url: 'https://github.com/octocat/Hello-World/pull/1347',
  diff_url: 'https://github.com/octocat/Hello-World/pull/1347.diff',
  patch_url: 'https://github.com/octocat/Hello-World/pull/1347.patch',
  issue_url: 'https://api.github.com/repos/octocat/Hello-World/issues/1347',
  commits_url:
    'https://api.github.com/repos/octocat/Hello-World/pulls/1347/commits',
  review_comments_url:
    'https://api.github.com/repos/octocat/Hello-World/pulls/1347/comments',
  review_comment_url:
    'https://api.github.com/repos/octocat/Hello-World/pulls/comments{/number}',
  comments_url:
    'https://api.github.com/repos/octocat/Hello-World/issues/1347/comments',
  statuses_url:
    'https://api.github.com/repos/octocat/Hello-World/statuses/6dcb09b5b57875f334f61aebed695e2e4193db5e',
  number: 1347,
  state: 'open',
  locked: true,
  title: 'Amazing new feature',
  user: {
    login: 'octocat',
    id: 1,
    node_id: 'MDQ6VXNlcjE=',
    avatar_url: 'https://github.com/images/error/octocat_happy.gif',
    gravatar_id: '',
    url: 'https://api.github.com/users/octocat',
    html_url: 'https://github.com/octocat',
    followers_url: 'https://api.github.com/users/octocat/followers',
    following_url:
      'https://api.github.com/users/octocat/following{/other_user}',
    gists_url: 'https://api.github.com/users/octocat/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/octocat/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/octocat/subscriptions',
    organizations_url: 'https://api.github.com/users/octocat/orgs',
    repos_url: 'https://api.github.com/users/octocat/repos',
    events_url: 'https://api.github.com/users/octocat/events{/privacy}',
    received_events_url: 'https://api.github.com/users/octocat/received_events',
    type: 'User',
    site_admin: false,
  },
  body: 'Please pull these awesome changes in!',
  labels: [
    {
      id: 208045946,
      node_id: 'MDU6TGFiZWwyMDgwNDU5NDY=',
      url: 'https://api.github.com/repos/octocat/Hello-World/labels/bug',
      name: 'bug',
      description: "Something isn't working",
      color: 'f29513',
      default: true,
    },
  ],
};
