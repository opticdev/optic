import React, {useContext, useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {DocDarkGrey, DocDivider, DocGrey} from '../../requests/DocConstants';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Badge from '@material-ui/core/Badge';
import {Button, CardActions, Checkbox, Collapse, ListItemAvatar, Tooltip} from '@material-ui/core';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
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
import {DiffContext, DiffContextStore, withDiffContext} from './DiffContext';
import {DocSubGroup} from '../../requests/DocSubGroup';
import DiffHunkViewer from './DiffHunkViewer';
import {ChangedYellowBackground, primary, RemovedRedBackground, AddedGreenBackground} from '../../../theme';
import DiffReviewExpanded from './DiffReviewExpanded';
import Toolbar from '@material-ui/core/Toolbar';
import {withRfcContext} from '../../../contexts/RfcContext';
import SimulatedCommandContext from '../SimulatedCommandContext';
import Scrolling from './Scrolling';
import {ShapeExpandedStore} from './shape_viewers/ShapeRenderContext';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import Card from '@material-ui/core/Card';
import {UpdatedBlue} from '../../../contexts/ColorContext';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import {PulsingOptic} from './DiffHelperCard';
import {PathAndMethod} from './PathAndMethod';
import {DiffToolTip} from './shape_viewers/styles';


const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  blur: {
    opacity: .3,
    pointerEvents: 'none'
  },
  header: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 5,
    fontWeight: 800,
  },
  hunkHeader: {
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    color: '#25292e',
    minHeight: 40,
    backgroundColor: '#eaebff',
    fontWeight: 800,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'start',
    justifyContent: 'start',
  },
  location: {
    marginLeft: 12
  },
  diff: {
    fontSize: 12,
    fontWeight: 600,
    color: '#f8333c',
    marginLeft: 11,
    flex: 1,
    paddingLeft: 30
  },
  crumb: {
    fontSize: 12,
    textTransform: 'uppercase'
  },
  heading: {
    fontSize: theme.typography.pxToRem(17),
    padding: 0,
    fontWeight: theme.typography.fontWeightRegular,
  },
  wrapper: {
    overflow: 'hidden',
    borderLeft: `3px solid ${UpdatedBlue}`
  },
  hunk: {
    backgroundColor: 'white',
    minHeight: 300,
  },
  subheader: {
    fontWeight: 100,
    paddingBottom: 0,
    marginBottom: 0,
    height: 33,
  },
  diffsNewRegion: {
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: 5,
    maxWidth: 670
  },
  diffCursor: {
    position: 'sticky',
    top: 1,
    zIndex: 500,
    paddingTop: 10,
    paddingBottom: 10,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    borderLeft: `3px solid ${UpdatedBlue}`
  },
  diffTitle: {
    fontSize: 19,
    fontWeight: 400,
    paddingLeft: 11,
  },
  diffCursorActions: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10
  },
  diffItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'baseline',
    paddingLeft: 5
  }
}));
const addition = <FiberManualRecordIcon style={{width: '.7em', height: '.7em', color: AddedGreenBackground}}/>;

const update = <FiberManualRecordIcon style={{width: '.7em', height: '.7em', color: ChangedYellowBackground}}/>;

const removal = <FiberManualRecordIcon style={{width: '.7em', height: '.7em', color: RemovedRedBackground}}/>;

export function DiffCursor(props) {
  const classes = useStyles();
  const {diffs} = props;
  const diffCount = lengthScala(diffs);

  const {selectedDiff, setSelectedDiff} = useContext(DiffContext);

  const [showAllDiffs, setShowAllDiffs] = useState(false);

  useEffect(() => {
    if (selectedDiff === null && diffCount > 0) {
      setSelectedDiff(headOrUndefined(diffs));
      setShowAllDiffs(false);
    }
  }, [selectedDiff, diffCount]);

  const DiffItem = ({diff, button}) => {

    return (
      <ListItem button={button} className={classes.diffItem} onClick={() => {
        setSelectedDiff(diff);
        setShowAllDiffs(false);
      }}>
        <Typography variant="h5" className={classes.diffTitle}>{diff.description.title}</Typography>
        <BreadcumbX location={JsonHelper.seqToJsArray(diff.location)}/>
      </ListItem>
    );
  };

  if (!selectedDiff && diffCount === 0) {
    return null;
  }

  return (
    <Card className={classes.diffCursor} elevation={3}>
      <div style={{flex: 1}}>
        {(!showAllDiffs && selectedDiff) && <DiffItem button={false} diff={selectedDiff}/>}
        <Collapse in={showAllDiffs}>
          <Typography variant="subtitle2" style={{paddingLeft: 12}}>Choose a diff to review</Typography>
          <List>
            {mapScala(diffs)(diff => <DiffItem diff={diff} button={true}/>)}
          </List>
        </Collapse>
      </div>
      {!showAllDiffs && (
        <div className={classes.diffCursorActions}>
          <Typography variant="overline" style={{color: DocDarkGrey, marginRight: 10}}>{diffCount} diffs</Typography>
          <DiffToolTip title="See all Diffs">
            <IconButton color="primary" disabled={diffCount <= 1} onClick={() => setShowAllDiffs(true)}>
              <MenuOpenIcon/>
            </IconButton>
          </DiffToolTip>
        </div>
      )}
    </Card>
  );

}

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
  const {newRegions, ignoreDiff, acceptSuggestion, endpointPurpose, method, fullPath} = props;
  const classes = useStyles();

  const [deselected, setDeselected] = useState([]);
  const [showExpanded, setShowExpanded] = useState(false);

  if (lengthScala(newRegions) === 0) {
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
    const allIgnored = filterScala(newRegions)(diffBlock => isDeselected(diffBlock)).map(i => i.diff);
    ignoreDiff(...allIgnored);
    const allApproved = filterScala(newRegions)(diffBlock => !isDeselected(diffBlock)).map(i => i.firstSuggestion);
    acceptSuggestion(...allApproved);


  };

  const newRequests = mapScala(newRegions)((diff) => {
    if (diff.inRequest) {
      return (
        <ListItem>
          <ListItemAvatar>
            <Checkbox
              checked={!isDeselected(diff)}
              onChange={onChange(diff)}
              color="primary"
            />
          </ListItemAvatar>
          <ListItemText primary={getOrUndefined(diff.contentType) || 'No Body'}
                        secondary={`Observed ${diff.count} times`}
                        primaryTypographyProps={{style: {fontSize: 14}}}
                        secondaryTypographyProps={{style: {fontSize: 12}}}
          />
        </ListItem>
      );
    }
  }).filter(i => !!i);

  const newResponses = mapScala(newRegions)((diff) => {
    if (diff.inResponse) {
      return (
        <ListItem>
          <ListItemAvatar>
            <Checkbox
              checked={!isDeselected(diff)}
              onChange={onChange(diff)}
              color="primary"
            />
          </ListItemAvatar>
          <ListItemText
            primary={`${getOrUndefined(diff.statusCode)} Response ${getOrUndefined(diff.contentType) || 'No Body'}`}
            secondary={`Observed ${diff.count} times`}
            primaryTypographyProps={{style: {fontSize: 14}}}
            secondaryTypographyProps={{style: {fontSize: 12}}}
          />
        </ListItem>
      );
    }
  }).filter(i => !!i);

  const copy = (newResponses.length > 0 && newRequests.length > 0) && 'request and response types'
  const copyFallback = (newResponses.length > 0 && newRequests.length === 0) ? 'response types' : 'request types'

  const approveCount = newResponses.length + newRequests.length - deselected.length

  return (
    <Card className={classes.wrapper} elevation={2}>
      <div className={classes.header}>
        <Typography variant="h6" color="primary">Generate Initial Documentation</Typography>
        <Typography variant="caption" color="textSecondary">{`New ${copy || copyFallback} types observed. Click Approve to document them.`}</Typography>
        {/*<div>*/}
        {/*  <Typography variant="h6">{endpointPurpose}</Typography>*/}
        {/*  <PathAndMethod method={method}*/}
        {/*                 path={fullPath}/>*/}
        {/*</div>*/}
      </div>

      <div style={{float: 'right', marginTop: -55}}><PulsingOptic/></div>
      <div className={classes.diffsNewRegion}>
        {newRequests.length > 0 && (
          <List style={{flex: 1}}
                subheader={<ListSubheader className={classes.subheader}>Requests</ListSubheader>}>
            {newRequests}
          </List>)}
        {newResponses.length > 0 && (
          <List style={{flex: 1}}
                subheader={<ListSubheader className={classes.subheader}>Responses</ListSubheader>}>
            {newResponses}
          </List>
        )}
      </div>
      <CardActions style={{float: 'right', padding: 15}}>
        <Button color="primary" variant="contained" disabled={approveCount === 0} onClick={onApply}>Approve ({approveCount})</Button>
      </CardActions>
    </Card>
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
      {mapScala(region)(r => {
        return (
          <>
            {mapScala(r.diffBlocks)(diff => {
              const inFocus = selectedDiff && diff.containsDiff(selectedDiff.diff);
              const shouldBlur = selectedDiff && !inFocus && selectedInterpretation;
              //only render changes in card that is in focus


              const inner = (() => {
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
              })();

              return (
                <ShapeExpandedStore>
                  {inner}
                </ShapeExpandedStore>
              );
            })}

          </>
        );
      })}
      <DocDivider/>

    </div>
  );
}

export const BreadcumbX = (props) => {
  const classes = useStyles();
  const {location, itemStyles} = props;
  return (
    <Breadcrumbs className={classes.location} separator={<span style={{fontSize: 13, ...itemStyles}}>{'›'}</span>}
                 aria-label="breadcrumb">{location.filter(i => !!i).map(n => <Typography style={itemStyles}
                                                                                         className={classes.crumb}
                                                                                         color="primary">{n}</Typography>)}</Breadcrumbs>
  );
};

function _ShapeDiffCard(props) {
  const {diff, suggestion, inFocus, selectedDiff, clearPreview, acceptSuggestion, shouldBlur, rfcService, rfcId} = props;
  const classes = useStyles();

  const {description} = diff;
  const location = JsonHelper.seqToJsArray(diff.location);
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
        <Breadcrumbs className={classes.location} separator={<span style={{fontSize: 13}}>{'›'}</span>}
                     aria-label="breadcrumb">{location.map(n => <Typography className={classes.crumb}
                                                                            color="primary">{n}</Typography>)}</Breadcrumbs>
        <Typography className={classes.diff} variant="subtitle2">{diff.description.title}</Typography>

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
          <Scrolling>
            <DiffHunkViewer
              suggestion={suggestion}
              diff={diff}
              preview={preview}
              diffDescription={description}/>
          </Scrolling>
        )}
      </div>
    </Paper>
  );
}

const ShapeDiffCard = withRfcContext(withDiffContext(_ShapeDiffCard));

export const ShapeDiffRegion = withRfcContext(withDiffContext(_ShapeDiffRegion));
