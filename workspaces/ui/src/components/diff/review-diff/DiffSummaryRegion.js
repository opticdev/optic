import React, { useState } from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import { DocDarkGrey } from '../../../components/docs/DocConstants';
import {
  AddedGreen,
  ChangedYellow,
  OpticBlue,
  primary,
  RemovedRed,
  RemovedRedBackground,
  secondary,
  UpdatedBlue,
  UpdatedBlueBackground,
} from '../../../theme';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import Card from '@material-ui/core/Card';
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@material-ui/core/Divider';
import InteractionBodyViewer from '../../../components/diff/v2/shape_viewers/InteractionBodyViewer';
import Chip from '@material-ui/core/Chip';
import withStyles from '@material-ui/core/styles/withStyles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { HardCodedDiffExamples } from '../../../components/diff/v2/shape_viewers/DiffReviewTypes';

export function DiffSummaryRegion(props) {
  const classes = useStyles();

  const {} = props.diff;
  debugger;

  const {
    mainInterpretation,
    readableIdentifier,
    kind,
    location,
    tasks,
    suggestions,
    diffs,
  } = props.diff || HardCodedDiffExamples[0];

  const [previewTab, setPreviewTab] = useState(diffs[0].oneWordName);
  const jsonExample = diffs.find((i) => i.oneWordName === previewTab)
    .jsonExample;

  const [suggestionId, setSuggestionId] = useState(suggestions[0].id);
  const [approved, setApproved] = useState(false);
  const suggestion = suggestions.find((i) => i.id === suggestionId);
  const choseIgnore = suggestionId === 'ignore'; //this is a hack for the demo

  const color = (() => {
    if (kind === 0) return AddedGreen;
    if (kind === 1) return ChangedYellow;
    if (kind === 2) return RemovedRed;
  })();
  const locationRender = (() => {
    if (location.inRequest) {
      return (
        <>
          Request Body <Code>{location.contentType}</Code>
        </>
      );
    }
    if (location.inResponse) {
      return (
        <>
          {location.statusCode} Response Body{' '}
          <Code>{location.contentType}</Code>
        </>
      );
    }
  })();

  const openHeader = (
    <>
      <FiberManualRecordIcon
        style={{ width: 15, marginLeft: 5, marginRight: 10, color }}
      />

      <Typography variant="h6" className={classes.diffText}>
        {mainInterpretation}: <Code>{readableIdentifier}</Code>
      </Typography>
      <div style={{ flex: 1 }} />
      <Button
        size="small"
        color="primary"
        variant="contained"
        onClick={() => setApproved(true)}
      >
        Approve
      </Button>
    </>
  );

  const approvedHeader = approved && (
    <>
      <CheckCircleOutlineIcon
        style={{
          width: 15,
          marginLeft: 5,
          marginRight: 10,
          color: UpdatedBlue,
        }}
      />

      <Typography variant="h6" className={classes.diffText}>
        {suggestion.pastTense}
      </Typography>
      <div style={{ flex: 1 }} />
      <Button size="small" color="default" onClick={() => setApproved(false)}>
        Unstage
      </Button>
    </>
  );

  return (
    <Card
      className={classes.root}
      elevation={2}
      style={{ marginBottom: approved ? 15 : 50 }}
    >
      <div className={classes.cardHeader}>
        {approved ? approvedHeader : openHeader}
      </div>
      <Collapse in={!approved}>
        <Divider style={{ marginBottom: 10 }} />
        <div className={classes.cardInner}>
          <div className={classes.location}>
            {locationRender}
            <div style={{ marginTop: 5 }}>
              Traffic observed from tasks{' '}
              {tasks
                .map((i) => <Code>{i}</Code>)
                .reduce((prev, curr) => [prev, ', ', curr])}
            </div>
          </div>
          <div className={classes.interpretations}>
            <FormControl component="fieldset">
              <FormLabel component="legend">
                <Typography variant="overline">Suggestions:</Typography>
              </FormLabel>
              <RadioGroup
                value={suggestionId}
                onChange={(e, v) => setSuggestionId(v)}
              >
                {suggestions.map((suggestion, index) => {
                  return (
                    <FormControlLabel
                      value={suggestion.id}
                      control={<Radio size="small" />}
                      label={
                        <span style={{ fontFamily: 'Ubuntu Mono' }}>
                          {suggestion.action}
                        </span>
                      }
                    />
                  );
                })}
                <FormControlLabel
                  value="ignore"
                  control={<Radio size="small" />}
                  label={
                    <span style={{ opacity: 0.8, fontFamily: 'Ubuntu Mono' }}>
                      Ignore these Diffs
                    </span>
                  }
                />
              </RadioGroup>
            </FormControl>
          </div>
        </div>
        <div className={classes.preview}>
          <div className={classes.previewHeader}>
            <DiffTabs
              value={previewTab}
              style={{ marginBottom: 5 }}
              onChange={(e, newValue) => setPreviewTab(newValue)}
            >
              {diffs
                .map((i) => i.oneWordName)
                .map((diff, index) => (
                  <DiffTab label={diff} value={diff} />
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
          <InteractionBodyViewer
            diff={undefined}
            key={JSON.stringify(jsonExample)}
            diffDescription={undefined}
            selectedInterpretation={undefined}
            jsonBody={jsonExample}
          />
        </div>
      </Collapse>
    </Card>
  );
}

const codeStyles = makeStyles((theme) => ({
  codeInline: {
    padding: 3,
    paddingLeft: 5,
    paddingRight: 5,
    fontWeight: 100,
    backgroundColor: UpdatedBlueBackground,
    fontFamily: 'Ubuntu Mono',
  },
}));

export const Code = (props) => {
  const classes = codeStyles();
  return <span className={classes.codeInline}>{props.children}</span>;
};

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
    padding: 6,
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
    marginTop: 14,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
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
