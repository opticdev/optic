import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { DocDarkGrey, DocDivider } from '../../docs/DocConstants';
import {
  Button,
  CardActions,
  Checkbox,
  Collapse,
  ListItemAvatar,
} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import classNames from 'classnames';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {
  CompareEquality,
  filterScala,
  getIndex,
  getOrUndefined,
  headOrUndefined,
  JsonHelper,
  lengthScala,
  mapScala,
  toOption,
} from '@useoptic/domain';
import { DiffContext, withDiffContext } from './DiffContext';
import {
  AddedGreenBackground,
  ChangedYellowBackground,
  RemovedRedBackground,
  UpdatedBlue,
} from '../../../theme';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import { PulsingOptic } from './DiffHelperCard';
import { DiffToolTip } from './shape_viewers/styles';
import Pagination from '@material-ui/lab/Pagination';
import { RfcContext } from '../../../contexts/RfcContext';
import DiffHunkViewer from './DiffHunkViewer';
import { ShapeExpandedStore } from './shape_viewers/ShapeRenderContext';
import { ShapeBox } from './DiffReviewExpanded';
import { ShapeOnlyViewer } from './shape_viewers/ShapeOnlyShapeRows';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { LightTooltip } from '../../tooltips/LightTooltip';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  blur: {
    opacity: 0.3,
    pointerEvents: 'none',
  },
  header: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 5,
    fontWeight: 800,
  },
  region: {
    padding: 18,
  },
  regionHeader: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 16,
  },
  approveNewRegions: {
    position: 'sticky',
    top: 0,
    width: '100%',
    height: 55,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingRight: 20,
  },
  newContentPreview: {
    paddingTop: 16,
    paddingRight: 8,
    display: 'flex',
    flexDirection: 'row',
  },
  unchecked: {
    pointerEvents: 'none',
    opacity: 0.38,
  },
  uncheckedText: {
    pointerEvents: 'none',
    opacity: 0.68,
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
    marginLeft: 12,
  },
  diff: {
    fontSize: 12,
    fontWeight: 600,
    color: '#f8333c',
    marginLeft: 11,
    flex: 1,
    paddingLeft: 30,
  },
  crumb: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: theme.typography.pxToRem(17),
    padding: 0,
    fontWeight: theme.typography.fontWeightRegular,
  },
  wrapper: {
    overflow: 'hidden',
    borderLeft: `3px solid ${UpdatedBlue}`,
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
    flexDirection: 'column',
    paddingLeft: 5,
    justifyContent: 'center',
  },
  diffCursor: {
    position: 'sticky',
    top: 0,
    zIndex: 500,
    paddingTop: 10,
    paddingBottom: 10,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    borderLeft: `3px solid ${UpdatedBlue}`,
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
    paddingRight: 10,
  },
  diffItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'baseline',
    paddingLeft: 5,
  },
}));
const addition = (
  <FiberManualRecordIcon
    style={{ width: '.7em', height: '.7em', color: AddedGreenBackground }}
  />
);

const update = (
  <FiberManualRecordIcon
    style={{ width: '.7em', height: '.7em', color: ChangedYellowBackground }}
  />
);

const removal = (
  <FiberManualRecordIcon
    style={{ width: '.7em', height: '.7em', color: RemovedRedBackground }}
  />
);

export function DiffCursor(props) {
  const classes = useStyles();
  const { diffs } = props;
  const diffCount = lengthScala(diffs);

  const { selectedDiff, setSelectedDiff } = useContext(DiffContext);

  const [showAllDiffs, setShowAllDiffs] = useState(false);

  useEffect(() => {
    if (selectedDiff === null && diffCount > 0) {
      setSelectedDiff(headOrUndefined(diffs));
      setShowAllDiffs(false);
    }
  }, [selectedDiff, diffCount]);

  try {
    console.log('diff ' + selectedDiff.diff);
  } catch (e) {}

  const DiffItem = ({ diff, button }) => {
    return (
      <ListItem
        button={button}
        className={classes.diffItem}
        onClick={() => {
          setSelectedDiff(diff);
          setShowAllDiffs(false);
        }}
      >
        <Typography variant="h5" className={classes.diffTitle}>
          {diff.description.title}
        </Typography>
        <BreadcumbX location={JsonHelper.seqToJsArray(diff.location)} />
      </ListItem>
    );
  };

  if (!selectedDiff && diffCount === 0) {
    return null;
  }

  return (
    <Card className={classes.diffCursor} elevation={3}>
      <div style={{ flex: 1 }}>
        {!showAllDiffs && selectedDiff && (
          <DiffItem button={false} diff={selectedDiff} />
        )}
        <Collapse in={showAllDiffs}>
          <Typography variant="subtitle2" style={{ paddingLeft: 12 }}>
            Choose a diff to review
          </Typography>
          <List>
            {mapScala(diffs)((diff, n) => (
              <DiffItem key={n} diff={diff} button={true} />
            ))}
          </List>
        </Collapse>
      </div>
      {!showAllDiffs && (
        <div className={classes.diffCursorActions}>
          <Typography
            variant="overline"
            style={{ color: DocDarkGrey, marginRight: 10 }}
          >
            {diffCount} diffs
          </Typography>
          <DiffToolTip title="See all Diffs">
            <IconButton
              color="primary"
              disabled={diffCount <= 1}
              onClick={() => setShowAllDiffs(true)}
            >
              <MenuOpenIcon />
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
        <Typography style={{ marginLeft: 11 }} variant="subtitle2">
          The Field X was added
        </Typography>
        <div style={{ flex: 1 }} />
        {addition}
        {update}
        {removal}
        <Button style={{ marginLeft: 5 }}>Resolve</Button>
      </div>
      <div className={classes.diffs}>
        <div className={classes.hunk}>
          <div className={classes.hunkHeader}>
            <Typography
              style={{ marginLeft: 11, fontSize: 11, fontWeight: 200 }}
              variant="subtitle2"
            >
              Request Body
            </Typography>
            <Typography
              style={{ marginLeft: 11, fontSize: 11, fontWeight: 200 }}
              variant="subtitle2"
            >
              application/json
            </Typography>
          </div>
        </div>
      </div>
    </Paper>
  );
}

function _NewRegions(props) {
  const {
    newRegions,
    ignoreDiff,
    acceptSuggestion,
    endpointPurpose,
    method,
    fullPath,
  } = props;
  const classes = useStyles();

  const [deselected, setDeselected] = useState([]);
  const [showExpanded, setShowExpanded] = useState(false);
  const [inferPolymorphism, setInferPolymorphism] = React.useState(false);

  if (lengthScala(newRegions) === 0) {
    return null;
  }

  const isDeselected = (diff) =>
    !!deselected.find((i) => CompareEquality.between(i, diff.diff));
  const onChange = (diff) => (e) => {
    if (!e.target.checked) {
      setDeselected([...deselected, diff.diff]);
    } else {
      setDeselected(
        deselected.filter((i) => !CompareEquality.between(i, diff.diff))
      );
    }
  };

  const onApply = () => {
    const allIgnored = filterScala(newRegions)((diffBlock) =>
      isDeselected(diffBlock)
    ).map((i) => i.diff);
    ignoreDiff(...allIgnored);
    const allApproved = filterScala(newRegions)(
      (diffBlock) => !isDeselected(diffBlock)
    ).map((i) => {
      return i.suggestion(inferPolymorphism);
    });
    acceptSuggestion(...allApproved);
  };

  const ignoreAll = () => {
    const allIgnored = mapScala(newRegions)((i) => i.diff);
    ignoreDiff(...allIgnored);
  };

  const PreviewNewBodyRegion = ({ diff, inferPolymorphism }) => {
    const isChecked = !isDeselected(diff);
    const { interactions } = diff;
    const length = lengthScala(interactions);

    const [interactionIndex, setInteractionIndex] = React.useState(1);

    useEffect(() => {
      setInteractionIndex(1);
    }, [diff]);

    const currentInteraction = getIndex(interactions)(interactionIndex - 1);
    const preview = getOrUndefined(diff.previewRender(currentInteraction));
    const shapePreview = getOrUndefined(
      diff.previewShape(currentInteraction, inferPolymorphism)
    );

    return (
      <>
        <Card className={classes.regionHeader} elevation={2}>
          <Checkbox
            checked={isChecked}
            onChange={onChange(diff)}
            color="primary"
          />
          <ListItemText
            className={classNames({
              [classes.uncheckedText]: !isChecked,
            })}
            primary={
              diff.inRequest
                ? getOrUndefined(diff.contentType) || 'No Body'
                : `${getOrUndefined(diff.statusCode)} Response ${
                    getOrUndefined(diff.contentType) || 'No Body'
                  }`
            }
            secondary={`Observed ${diff.count} times`}
            primaryTypographyProps={{ style: { fontSize: 14 } }}
            secondaryTypographyProps={{ style: { fontSize: 12 } }}
          />

          <div style={{ flex: 1 }} />
          {length > 1 && (
            <Pagination
              color="primary"
              className={classNames({ [classes.unchecked]: !isChecked })}
              style={{ display: 'flex' }}
              count={length}
              page={interactionIndex}
              showLastButton={length > 5}
              size="small"
              onChange={(e, pageNumber) => setInteractionIndex(pageNumber)}
            />
          )}
        </Card>

        <div
          className={classNames(classes.newContentPreview, {
            [classes.unchecked]: !isChecked,
          })}
        >
          <div style={{ width: '55%', paddingRight: 15 }}>
            {preview && (
              <ShapeBox
                header={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <BreadcumbX
                      itemStyles={{ fontSize: 13, color: 'white' }}
                      location={['Example']}
                    />
                    <div style={{ flex: 1 }}></div>
                    <span style={{ color: 'white' }}>⮕</span>
                  </div>
                }
              >
                <ShapeExpandedStore>
                  <DiffHunkViewer preview={preview} exampleOnly />
                </ShapeExpandedStore>
              </ShapeBox>
            )}
          </div>
          <div style={{ flex: 1 }}>
            {shapePreview && (
              <ShapeBox
                header={
                  <BreadcumbX
                    itemStyles={{ fontSize: 13, color: 'white' }}
                    location={['Documented Shape']}
                  />
                }
              >
                <ShapeExpandedStore>
                  <ShapeOnlyViewer preview={shapePreview} exampleOnly />
                </ShapeExpandedStore>
              </ShapeBox>
            )}
          </div>
        </div>
      </>
    );
  };

  const newRequests = mapScala(newRegions)((diff) => {
    if (diff.inRequest) {
      return (
        <PreviewNewBodyRegion
          diff={diff}
          inferPolymorphism={inferPolymorphism}
        />
      );
    }
  }).filter((i) => !!i);

  const newResponses = mapScala(newRegions)((diff) => {
    if (diff.inResponse) {
      return (
        <PreviewNewBodyRegion
          diff={diff}
          inferPolymorphism={inferPolymorphism}
        />
      );
    }
  }).filter((i) => !!i);

  const copy =
    newResponses.length > 0 &&
    newRequests.length > 0 &&
    'request and response types';
  const copyFallback =
    newResponses.length > 0 && newRequests.length === 0
      ? 'response types'
      : 'request types';

  const approveCount =
    newResponses.length + newRequests.length - deselected.length;

  return (
    <Card className={classes.wrapper} elevation={2}>
      <div className={classes.header}>
        <Typography variant="h5" color="primary">
          Generate Initial Documentation
        </Typography>
        <Typography variant="body2" color="textSecondary">{`New ${
          copy || copyFallback
        } types observed. Review them, then click Document Bodies`}</Typography>
        {/*<div>*/}
        {/*  <Typography variant="h6">{endpointPurpose}</Typography>*/}
        {/*  <PathAndMethod method={method}*/}
        {/*                 path={fullPath}/>*/}
        {/*</div>*/}
      </div>

      <div style={{ float: 'right', marginTop: -55 }}>
        <PulsingOptic />
      </div>

      <div className={classes.approveNewRegions}>
        <LightTooltip title="Use all example requests to infer all the Optional, Nullable and OneOfs in your bodies automatically. If you leave this option disabled, Optic will allow you to review the polymorphism in your API manually.">
          <FormControlLabel
            style={{ marginRight: 12 }}
            control={
              <Switch
                checked={inferPolymorphism}
                onChange={(e) => setInferPolymorphism(e.target.checked)}
                color="primary"
              />
            }
            labelPlacement="start"
            label={
              <Typography variant="body1" color="textSecondary">
                Infer Polymorphism
              </Typography>
            }
          />
        </LightTooltip>
        <Button color="default" onClick={ignoreAll} style={{ marginRight: 10 }}>
          Ignore All
        </Button>
        <Button
          color="primary"
          variant="contained"
          disabled={approveCount === 0}
          onClick={onApply}
        >
          Document ({approveCount}) bodies
        </Button>
      </div>

      <DocDivider style={{ marginTop: 20, marginBottom: 20 }} />

      <div className={classes.diffsNewRegion}>
        {newRequests.length > 0 && (
          <div className={classes.region}>
            <Typography variant="h6" color="primary">
              Requests
            </Typography>
            {newRequests}
          </div>
        )}

        <DocDivider style={{ marginTop: 30, marginBottom: 20 }} />

        {newResponses.length > 0 && (
          <div className={classes.region}>
            <Typography variant="h6" color="primary">
              Responses
            </Typography>
            {newResponses}
          </div>
        )}
      </div>
    </Card>
  );
}

export const NewRegions = withDiffContext(_NewRegions);

export const BreadcumbX = (props) => {
  const classes = useStyles();
  const { location, itemStyles } = props;
  return (
    <Breadcrumbs
      className={classes.location}
      separator={<span style={{ fontSize: 13, ...itemStyles }}>{'›'}</span>}
      aria-label="breadcrumb"
    >
      {location
        .filter((i) => !!i)
        .map((n) => (
          <Typography
            key={n}
            style={itemStyles}
            className={classes.crumb}
            color="primary"
          >
            {n}
          </Typography>
        ))}
    </Breadcrumbs>
  );
};
