import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {DocDarkGrey, DocDivider, DocGrey} from '../../requests/DocConstants';
import Rating from '@material-ui/lab/Rating';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import AddIcon from '@material-ui/icons/Add';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Badge from '@material-ui/core/Badge';
import {AddedGreen, RemovedRed, ChangedYellow, AddedGreenBackground} from '../../../contexts/ColorContext';
import {Button, Checkbox} from '@material-ui/core';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Switch from '@material-ui/core/Switch';
import WifiIcon from '@material-ui/icons/Wifi';
import classNames from 'classnames';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {
  getOrUndefined,
  mapScala,
  CompareEquality,
  filterScala,
  lengthScala,
  headOrUndefined,
  DiffPreviewer,
  JsonHelper,
  toOption,
  opticEngine
} from '@useoptic/domain';
import {DiffContextStore, withDiffContext} from './DiffContext';
import {DocSubGroup} from '../../requests/DocSubGroup';
import DiffHunkViewer from './DiffHunkViewer';
import {primary} from '../../../theme';
import DiffReviewExpanded from './DiffReviewExpanded';
import Toolbar from '@material-ui/core/Toolbar';
import {withRfcContext} from '../../../contexts/RfcContext';
import SimulatedCommandContext from '../SimulatedCommandContext';
import {Show} from '../../shared/Show';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  blur: {
    opacity: .3,
    pointerEvents: 'none'
  },
  header: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: '#f0f1f2',
    borderBottom: '1px solid',
    borderBottomColor: '#b2b2b2',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hunkHeader: {
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: '#f0f1f2',
    borderBottom: '1px solid',
    borderBottomColor: '#b2b2b2',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'start',
    justifyContent: 'start',
  },
  heading: {
    fontSize: theme.typography.pxToRem(17),
    padding: 0,
    fontWeight: theme.typography.fontWeightRegular,
  },
  wrapper: {
    overflow: 'hidden',
    marginTop: 42,
    // border: '1px solid',
  },
  hunk: {
    backgroundColor: 'white',
    minHeight: 300,
  },
  subheader: {
    fontWeight: 500,
    color: primary,
    paddingBottom: 0,
    marginBottom: 0,
    height: 33,
    textDecoration: 'underline'
  },
  diffsNewRegion: {
    display: 'flex',
    flexDirection: 'row'
  }
}));
const addition = <FiberManualRecordIcon style={{width: '.7em', height: '.7em', color: AddedGreen}}/>;

const update = <FiberManualRecordIcon style={{width: '.7em', height: '.7em', color: ChangedYellow}}/>;

const removal = <FiberManualRecordIcon style={{width: '.7em', height: '.7em', color: RemovedRed}}/>;


export default function DiffPreview() {
  const classes = useStyles();

  return (
    <Paper className={classes.wrapper} elevation={2}>
      <div className={classes.header}>
        <Typography style={{marginLeft: 11}} variant="subtitle2">The Field X was added</Typography>
        <div style={{flex: 1}}/>
        {addition}
        {update}
        {removal}
        <Button style={{marginLeft: 5}}>Resolve</Button>
      </div>
      <div className={classes.diffs}>

        <div className={classes.hunk}>
          <div className={classes.hunkHeader}>
            <Typography style={{marginLeft: 11, fontSize: 11, fontWeight: 200}} variant="subtitle2">Request
              Body</Typography>
            <Typography style={{marginLeft: 11, fontSize: 11, fontWeight: 200}}
                        variant="subtitle2">application/json</Typography>
          </div>
        </div>

      </div>
    </Paper>
  );
}

function _NewRegions(props) {
  const {regions, ignoreDiff, acceptSuggestion} = props;
  const classes = useStyles();

  const [deselected, setDeselected] = useState([]);
  const [showExpanded, setShowExpanded] = useState(false);

  if (regions.isEmpty) {
    return null;
  }

  const isDeselected = (diff) => !!deselected.find(i => CompareEquality.between(i, diff.diff));
  const onChange = (diff) => (e) => {
    if (!e.target.checked) {
      setDeselected([...deselected, diff.diff]);
    } else {
      setDeselected(deselected.filter(i => !CompareEquality.between(i, diff.diff)));
    }
  };

  const onApply = () => {
    const allIgnored = filterScala(regions.diffBlocks)(diffBlock => isDeselected(diffBlock)).map(i => i.diff);
    ignoreDiff(...allIgnored);
    const allApproved = filterScala(regions.diffBlocks)(diffBlock => !isDeselected(diffBlock)).map(i => i.firstSuggestion);
    acceptSuggestion(...allApproved);


  };

  const newRequests = mapScala(regions.diffBlocks)((diff) => {
    if (diff.inRequest) {
      return (
        <ListItem>
          <ListItemText primary={getOrUndefined(diff.contentType) || 'No Body'}
                        secondary={`Observed ${diff.count} times`}
                        primaryTypographyProps={{style: {fontSize: 14}}}
                        secondaryTypographyProps={{style: {fontSize: 12}}}
          />
          <ListItemSecondaryAction>
            <Checkbox
              checked={!isDeselected(diff)}
              onChange={onChange(diff)}
              color="primary"
            />
          </ListItemSecondaryAction>
        </ListItem>
      );
    }
  }).filter(i => !!i);

  const newResponses = mapScala(regions.diffBlocks)((diff) => {
    if (diff.inResponse) {
      return (
        <ListItem>
          <ListItemText
            primary={`${getOrUndefined(diff.statusCode)} Response ${getOrUndefined(diff.contentType) || 'No Body'}`}
            secondary={`Observed ${diff.count} times`}
            primaryTypographyProps={{style: {fontSize: 14}}}
            secondaryTypographyProps={{style: {fontSize: 12}}}
          />
          <ListItemSecondaryAction>
            <Checkbox
              checked={!isDeselected(diff)}
              onChange={onChange(diff)}
              color="primary"
            />
          </ListItemSecondaryAction>
        </ListItem>
      );
    }
  }).filter(i => !!i);

  return (
    <Paper className={classes.wrapper} elevation={2}>
      <div className={classes.header}>
        {addition}
        <Typography style={{marginLeft: 11}} variant="subtitle2">Undocumented Requests / Responses</Typography>
        <div style={{flex: 1}}/>
        <Button size="small"
                color="primary"
                style={{marginRight: 8}}
                startIcon={<VisibilityIcon color="primary"/>}
                onClick={() => setShowExpanded(true)}>
          Expand Examples
        </Button>
        <Button style={{marginLeft: 5}} color="secondary" onClick={onApply}>Add to Specification</Button>
      </div>
      <div className={classes.diffsNewRegion}>
        {newRequests.length > 0 && (
          <List style={{flex: 1, borderRight: '1px solid #e2e2e2'}}
                subheader={<ListSubheader className={classes.subheader}>New Requests</ListSubheader>}>
            {newRequests}
          </List>)}
        {newResponses.length > 0 && (
          <List style={{flex: 1}}
                subheader={<ListSubheader className={classes.subheader}>New Responses</ListSubheader>}>
            {newResponses}
          </List>
        )}
      </div>

      {showExpanded && (
        <>
          <DocDivider/>
          <DiffReviewExpanded
            interactions={regions.allInteractions}
            exampleOnly={true}
            render={(interaction) => {
              return {
                request: getOrUndefined(DiffPreviewer.previewBody(interaction.request.body)),
                response: getOrUndefined(DiffPreviewer.previewBody(interaction.response.body)),
                httpMethod: interaction.request.method,
                url: interaction.request.path,
              };
            }}
          />
        </>
      )}

    </Paper>
  );
}

export const NewRegions = withDiffContext(_NewRegions);


function _ShapeDiffRegion(props) {
  const {ignoreDiff, acceptSuggestion, selectedDiff, eventStore, rfcId, selectedInterpretation, title, region} = props;
  const classes = useStyles();

  if (lengthScala(region) === 0) {
    return null;
  }

  return (
    <div>
      <Typography variant="h6" color="primary"
                  style={{marginBottom: 12}}>{title}</Typography>
      {mapScala(region)(r => {
        return (
          <DocSubGroup title={r.name}>
            {mapScala(r.diffBlocks)(diff => {
              const inFocus = selectedDiff && diff.containsDiff(selectedDiff.diff);
              const shouldBlur = selectedDiff && !inFocus && selectedInterpretation;
              //only render changes in card that is in focus
              if (inFocus) {
                const simulatedCommands = selectedInterpretation ? JsonHelper.seqToJsArray(selectedInterpretation.commands) : [];
                return (
                  <SimulatedCommandContext
                    rfcId={rfcId}
                    eventStore={eventStore.getCopy(rfcId)}
                    commands={simulatedCommands}
                    shouldSimulate={true}
                  >
                    <ShapeDiffCard suggestion={inFocus && selectedInterpretation} diff={diff} inFocus={inFocus}
                                   shouldBlur={shouldBlur}/>
                  </SimulatedCommandContext>
                );
              } else {
                return <ShapeDiffCard suggestion={inFocus && selectedInterpretation} diff={diff} inFocus={inFocus}
                                      shouldBlur={shouldBlur}/>;
              }
            })}

          </DocSubGroup>
        );
      })}
      <DocDivider/>

    </div>
  );
}

function _ShapeDiffCard(props) {
  const {diff, suggestion, inFocus, selectedDiff, clearPreview, acceptSuggestion, shouldBlur, rfcService, rfcId} = props;
  const classes = useStyles();

  const {description} = diff;
  const [showExpanded, setShowExpanded] = useState(false);
  const currentRfcState = rfcService.currentState(rfcId);
  let preview = diff.previewRender(headOrUndefined(diff.interactions), toOption(currentRfcState));

  const title = <>{addition}<Typography style={{marginLeft: 11}}
                                        variant="subtitle2">{diff.description.title}</Typography></>;

  const showFinalize = selectedDiff && CompareEquality.between(selectedDiff, diff) && suggestion;

  const apply = () => {
    acceptSuggestion(suggestion);
    clearPreview();
  };

  return (
    <Paper className={classNames(classes.wrapper, {[classes.blur]: shouldBlur})} elevation={2}>
      <div className={classes.header}>
        {addition}
        <Typography style={{marginLeft: 11}} variant="subtitle2">{diff.description.title}</Typography>
        <div style={{flex: 1}}/>

        {(!showFinalize && !showExpanded) &&
        <Button size="small"
                color="primary"
                style={{marginRight: 8}}
                startIcon={<VisibilityIcon color="primary"/>}
                onClick={() => setShowExpanded(true)}>Expand Examples</Button>}

        {showFinalize && <Button size="small" style={{marginRight: 8}} onClick={clearPreview}>Reset</Button>}
        {showFinalize &&
        <Button color="secondary" variant="outlined" size="small" onClick={apply}>Apply Changes</Button>}
      </div>


      <div className={classes.diffsNewRegion} style={{flexDirection: 'column'}}>
        {showExpanded ? (
          <DiffReviewExpanded
            suggestion={suggestion}
            diff={diff}
            diffDescription={diff.description}
            inFocus={inFocus}
            interactions={diff.interactions}
            render={(interaction) => {
              return {
                request: getOrUndefined(diff.previewRequest(interaction, toOption(currentRfcState))),
                response: getOrUndefined(diff.previewResponse(interaction, toOption(currentRfcState))),
                httpMethod: interaction.request.method,
                url: interaction.request.path,
              };
            }}
          />
        ) : (
          <DiffHunkViewer
            suggestion={suggestion}
            diff={diff}
            preview={preview}
            diffDescription={description}/>
        )}
      </div>
    </Paper>
  );
}

const ShapeDiffCard = withRfcContext(withDiffContext(_ShapeDiffCard));

export const ShapeDiffRegion = withRfcContext(withDiffContext(_ShapeDiffRegion));
