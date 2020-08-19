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
  getOrUndefinedJson,
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
import InteractionBodyViewer from './shape_viewers/InteractionBodyViewer';
import { ShapeExpandedStore } from './shape_viewers/ShapeRenderContext';
import { ShapeBox } from './DiffReviewExpanded';
import { ShapeOnlyViewer } from './shape_viewers/ShapeOnlyShapeRows';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { LightTooltip } from '../../tooltips/LightTooltip';
import { useCaptureContext } from '../../../contexts/CaptureContext';
import LinearProgress from '@material-ui/core/LinearProgress';
import {
  useDiffDescription,
  useInitialBodyPreview,
  useInteractionWithPointer,
} from './DiffHooks';
import { Show } from '../../shared/Show';
import { track } from '../../../Analytics';

function _NewRegions(props) {
  const { newRegions, ignoreDiff, captureId, endpointId } = props;

  const classes = useStyles();

  const { acceptSuggestion } = useContext(DiffContext);
  const { diffService, captureService } = useCaptureContext();

  const [deselected, setDeselected] = useState([]);
  const [finished, setFinished] = useState(false);
  const [showExpanded, setShowExpanded] = useState(false);
  const [inferPolymorphism, setInferPolymorphism] = React.useState(false);

  useEffect(() => {
    track("Show Initial Documentation Page", props)
  }, [])
  
  if (newRegions.length === 0) {
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

  const onApply = async () => {
    setFinished(true);
    const allIgnored = newRegions
      .filter((diffBlock) => isDeselected(diffBlock))
      .map((i) => i.diff);

    ignoreDiff(...allIgnored);

    const allApproved = await Promise.all(
      newRegions
        .filter((diffBlock) => !isDeselected(diffBlock))
        .map(async (i) => {
          //@todo this is messy and doubles the compute
          const { interaction } = await captureService.loadInteraction(
            i.firstInteractionPointer
          );

          const cacheKey = i.toString() + inferPolymorphism.toString();
          const cached = window.naiveCache && window.naiveCache[cacheKey];
          //@todo this dups something large. @dev good spot for the state chart
          const { suggestion } = cached
            ? cached
            : await diffService.loadInitialPreview(
                i,
                JsonHelper.fromInteraction(interaction),
                inferPolymorphism
              );

          debugger;

          return getOrUndefined(suggestion);
        })
    );
    track('Documented Changes');

    acceptSuggestion(...allApproved);
  };

  const ignoreAll = () => {
    const allIgnored = newRegions.map((i) => i.diff);
    ignoreDiff(...allIgnored);
  };

  const newRequests =
    !finished &&
    newRegions
      .map((diff) => {
        if (diff.inRequest) {
          return (
            <PreviewNewBodyRegion
              diff={diff}
              key={diff.diff.toString()}
              isDeselected={isDeselected}
              onChange={onChange}
              inferPolymorphism={inferPolymorphism}
              endpointId={endpointId}
            />
          );
        }
      })
      .filter((i) => !!i);

  const newResponses =
    !finished &&
    newRegions
      .map((diff) => {
        if (diff.inResponse) {
          return (
            <PreviewNewBodyRegion
              diff={diff}
              isDeselected={isDeselected}
              onChange={onChange}
              key={diff.diff.toString()}
              inferPolymorphism={inferPolymorphism}
              endpointId={endpointId}
            />
          );
        }
      })
      .filter((i) => !!i);

  if (newRequests.length || newResponses.length) {
    track('Diff New Bodies', {
      requestCount: newRequests.length,
      responseCount: newResponses.length,
      regions: [
        newRequests.map((i) => i.locationString),
        newResponses.map((i) => i.locationString),
      ],
    });
  }

  track('Show Initial Documentation Page', props);

  const approveCount =
    newResponses.length + newRequests.length - deselected.length;

  return (
    <>
      <Card className={classes.header} elevation={2}>
        <div style={{ flex: 1 }}>
          <Typography variant="h5" color="primary" style={{ fontSize: 22 }}>
            Generate Initial Documentation
          </Typography>
        </div>
        <div className={classes.approveNewRegions}>
          <LightTooltip
            title={
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                When you turn this option on, Optic will try to infer which
                fields are Optional, Nullable or OneOfs in your bodies. This can
                save you a lot of time when documenting large APIs. Leave this
                option disabled to review the polymorphism in your API manually.
                <Typography
                  variant="caption"
                  style={{ marginTop: 12, color: DocDarkGrey }}
                >
                  A random 20 examples from this capture will be used for the
                  inference, it may not catch everything.{' '}
                </Typography>
              </div>
            }
          >
            <FormControlLabel
              style={{ marginRight: 12 }}
              control={
                <Switch
                  size="medium"
                  checked={inferPolymorphism}
                  disabled={finished}
                  onChange={(e) => {
                    setInferPolymorphism(e.target.checked);
                    if (e.target.checked) {
                      track('Infer polymorhpism', { captureId });
                    }
                  }}
                  color="primary"
                />
              }
              labelPlacement="start"
              label={
                <Typography
                  variant="body1"
                  color="textSecondary"
                  style={{ fontSize: 12 }}
                >
                  Infer Polymorphism
                </Typography>
              }
            />
          </LightTooltip>
          <Button
            size="small"
            color="default"
            onClick={ignoreAll}
            disabled={finished}
            style={{ marginRight: 10 }}
          >
            Ignore All
          </Button>
          <Button
            size="small"
            color="primary"
            variant="contained"
            disabled={approveCount === 0 || finished}
            onClick={onApply}
          >
            Document ({approveCount || ''}) bodies
          </Button>
        </div>
        {finished && <LinearProgress />}
      </Card>

      {!finished && (
        <div className={classes.wrapper}>
          <div className={classes.diffsNewRegion}>
            {newRequests.length > 0 && (
              <div className={classes.region}>
                <Typography variant="h6" color="primary">
                  Requests
                </Typography>
                {newRequests}
              </div>
            )}

            <Show when={newRequests.length}>
              <DocDivider style={{ marginTop: 30, marginBottom: 20 }} />
            </Show>

            {newResponses.length > 0 && (
              <div className={classes.region}>
                <Typography variant="h6" color="primary">
                  Responses
                </Typography>
                {newResponses}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export class NewRegions extends React.Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const result = CompareEquality.between(
      nextProps.newRegions,
      this.props.newRegions
    );

    //@todo add ignore here
    return !result;
  }

  render() {
    console.log('rendering all over again');
    return <_NewRegions {...this.props} />;
  }
}

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

const PreviewNewBodyRegion = ({
  diff,
  inferPolymorphism,
  isDeselected,
  onChange,
  endpointId,
}) => {
  const isChecked = !isDeselected(diff);
  const classes = useStyles();
  const length = diff.interactionsCount;

  const [interactionIndex, setInteractionIndex] = React.useState(1);

  useEffect(() => {
    setInteractionIndex(1);
  }, [diff.diff ? diff.diff.toString() : undefined]);

  const currentInteractionPointer = getIndex(diff.interactionPointers)(
    interactionIndex - 1
  );

  const currentInteraction = useInteractionWithPointer(
    currentInteractionPointer
  );

  const { preview: initialBody, loadingInferPoly } = useInitialBodyPreview(
    diff,
    currentInteraction && currentInteraction.interactionScala,
    inferPolymorphism,
    endpointId
  );

  if (!currentInteraction || !initialBody || loadingInferPoly) {
    return <LinearProgress />;
  }

  const bodyPreview = getOrUndefined(initialBody.bodyPreview);
  const shapePreview = getOrUndefined(initialBody.shapePreview);

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
          secondary={`Observed ${diff.interactionsCount} times`}
          primaryTypographyProps={{ style: { fontSize: 14 } }}
          secondaryTypographyProps={{ style: { fontSize: 12 } }}
        />

        <div style={{ flex: 1 }} />
        {length > 1 && getOrUndefined(diff.contentType) && (
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
          {process.env.REACT_APP_FLATTENED_SHAPE_VIEWER == 'true' &&
          currentInteraction ? (
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
              <InteractionBodyViewer
                body={
                  diff.inRequest
                    ? currentInteraction.interactionScala.request.body
                    : currentInteraction.interactionScala.response.body
                }
              />
            </ShapeBox>
          ) : (
            process.env.REACT_APP_FLATTENED_SHAPE_VIEWER !== 'true' &&
            bodyPreview && (
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
                  <DiffHunkViewer preview={bodyPreview} exampleOnly />
                </ShapeExpandedStore>
              </ShapeBox>
            )
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

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  blur: {
    opacity: 0.3,
    pointerEvents: 'none',
  },
  header: {
    backgroundColor: 'white',
    padding: 8,
    paddingLeft: 12,
    display: 'flex',
    justifyContent: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 500,
    alignItems: 'center',
  },
  region: {
    padding: 5,
  },
  regionHeader: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 16,
    paddingRight: 12,
  },
  approveNewRegions: {
    paddingRight: 10,
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
    paddingTop: 18,
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
