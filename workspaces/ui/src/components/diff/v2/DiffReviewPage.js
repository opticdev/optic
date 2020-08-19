import React, { useContext, useEffect, useState } from 'react';
import { DocDarkGrey, DocDivider } from '../../docs/DocConstants';
import Tabs from '@material-ui/core/Tabs';
import { CustomNavTab, CustomNavTabDense } from './CustomNavTab';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import DoneIcon from '@material-ui/icons/Done';
import { EndpointsContext } from '../../../contexts/EndpointContext';
import { PathAndMethod, PathAndMethodOverflowFriendly } from './PathAndMethod';
import {
  CaptureContext,
  useCaptureContext,
} from '../../../contexts/CaptureContext';
import {
  DiffResultHelper,
  getOrUndefined,
  JsonHelper,
  mapScala,
} from '@useoptic/domain';
import { DiffContext } from './DiffContext';
import { NewRegions } from './DiffNewRegions';
import { DiffCursor } from './DiffCursor';
import DiffReviewExpanded from './DiffReviewExpanded';
import { RfcContext } from '../../../contexts/RfcContext';
import LinearProgress from '@material-ui/core/LinearProgress';
import Fade from '@material-ui/core/Fade';
import CircularProgress from '@material-ui/core/CircularProgress';
import { DiffStats } from './Stats';
import { DiffLoading } from './LoadingNextDiff';
import { IgnoreDiffContext, SuggestionsContext } from './DiffPageNew';
import FinalizeDialog from './Finalize';
import { track } from '../../../Analytics';
import Button from '@material-ui/core/Button';

export const newRegionsConst = 'new_regions';

export function DiffReviewPage(props) {
  const { captureId, method, pathId } = props;
  const classes = useStyles();

  const { rfcId, rfcService } = useContext(RfcContext);
  const { reset } = useContext(DiffContext);
  const { acceptedSuggestions } = useContext(SuggestionsContext);
  const rfcState = rfcService.currentState(rfcId);

  const { endpointDescriptor } = useContext(EndpointsContext);
  const { diffsForThisEndpoint, completed } = useContext(DiffContext);

  const [currentTab, setCurrentTab] = useState(null);
  const [showFinalize, setShowFinalize] = useState(false);

  const { ignoreDiff } = useContext(IgnoreDiffContext);

  const regions = DiffResultHelper.groupEndpointDiffsByRegion(
    diffsForThisEndpoint,
    rfcState,
    method,
    pathId
  );

  useEffect(() => {
    if (!currentTab) {
      const firstRequestIdWithDiff = getOrUndefined(
        regions.firstRequestIdWithDiff
      );

      const firstResponseIdWithDiff = getOrUndefined(
        regions.firstResponseIdWithDiff
      );

      if (regions.newRegionsCount > 0) {
        setCurrentTab(newRegionsConst);
      } else if (firstRequestIdWithDiff) {
        setCurrentTab(firstRequestIdWithDiff);
      } else if (firstResponseIdWithDiff) {
        setCurrentTab(firstResponseIdWithDiff);
      }
    }
  });

  const requestBodyTabs = mapScala(regions.requestDiffs)((i) => {
    return (
      <CustomNavTabDense
        label={getOrUndefined(i.contentType) || 'No Body'}
        disabled={i.count === 0}
        value={i.id}
        count={i.count}
      />
    );
  });

  const responseBodyTabs = mapScala(regions.responseDiffs)((i) => {
    //must be flat for some reason. has to do with tab context and a material UI bug
    return [
      <Typography variant="overline" className={classes.sectionHeader}>
        {i.statusCode} Response Body
      </Typography>,
      mapScala(i.regions)((c) => {
        return (
          <CustomNavTabDense
            label={getOrUndefined(c.contentType) || 'No Body'}
            value={c.id}
            disabled={c.count === 0}
            count={c.count}
          />
        );
      }),
      <DocDivider style={{ marginTop: 16, marginBottom: 16 }} />,
    ];
  });

  useEffect(() => {
    if (showFinalize || (completed && regions.empty)) {
      track('Rendered Finalize Card');
    }
  }, [showFinalize, completed, regions.empty]);

  return (
    <div className={classes.container}>
      <div className={classes.navigationContainer}>
        <div className={classes.navRoot}>
          <div className={classes.header}>
            <Typography variant="subtitle2" className={classes.title}>
              {endpointDescriptor.endpointPurpose || 'Unnamed Endpoint'}
            </Typography>
            <PathAndMethodOverflowFriendly
              method={endpointDescriptor.httpMethod}
              path={endpointDescriptor.fullPath}
            />
          </div>

          <DocDivider />

          <div className={classes.suggestionsBox}>
            <Typography variant="caption" className={classes.suggestionsCount}>
              {acceptedSuggestions.length} approved
            </Typography>
            <div style={{ flex: 1 }} />
            <Button
              size="small"
              color="primary"
              onClick={reset}
              classes={{ root: classes.buttonSmall }}
            >
              Reset
            </Button>
            <Button
              size="small"
              color="primary"
              onClick={() => setShowFinalize(true)}
              classes={{ root: classes.buttonSmall }}
            >
              Commit
            </Button>
          </div>

          <DocDivider />

          <div className={classes.tabScroll}>
            <Tabs
              orientation="vertical"
              className={classes.tabs}
              onChange={(_, value) => {
                if (value !== currentTab) {
                  setCurrentTab(value);
                }
              }}
              value={currentTab}
            >
              <CustomNavTabDense
                label={`Loading`}
                value={null}
                style={{ display: 'none' }}
              />
              <CustomNavTabDense
                label={`Review New Regions`}
                value={newRegionsConst}
                count={regions.newRegionsCount}
                disabled={!regions.newRegionsCount}
                style={{ marginBottom: 17 }}
              />

              {requestBodyTabs.length > 0 && (
                <Typography
                  variant="overline"
                  className={classes.sectionHeader}
                >
                  Request Body Diffs
                </Typography>
              )}

              {requestBodyTabs}

              {requestBodyTabs.length > 0 && (
                <DocDivider style={{ marginTop: 16, marginBottom: 16 }} />
              )}

              {responseBodyTabs}
            </Tabs>
          </div>
          <DiffStats />
        </div>
      </div>
      <div className={classes.pageContainer}>
        <div className={classes.center}>
          {!currentTab && !completed && <DiffLoading show={true} />}

          {currentTab === newRegionsConst && (
            <NewRegions
              ignoreDiff={ignoreDiff}
              captureId={captureId}
              endpointId={pathId + method}
              newRegions={JsonHelper.seqToJsArray(regions.newRegions)}
            />
          )}

          {currentTab && currentTab !== newRegionsConst && (
            <DiffCursor
              captureId={captureId}
              key={currentTab}
              diffs={JsonHelper.seqToJsArray(
                regions.bodyDiffsForId(currentTab)
              )}
              completed={completed}
              tab={currentTab}
            />
          )}
        </div>
      </div>
      <FinalizeDialog
        captureId={captureId}
        open={showFinalize || (completed && regions.empty)}
        canOnlyReset={regions.empty && completed}
        close={() => setShowFinalize(false)}
      />
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
  },
  navigationContainer: {
    width: 230,
    overflow: 'hidden',
    display: 'flex',
  },
  pageContainer: {
    justifyContent: 'center',
    flexGrow: 1,
  },
  navRoot: {
    flexGrow: 1,
    position: 'fixed',
    width: 'inherit',
    height: '100vh',
    overflowY: 'visible',
    overflowX: 'visible',
    display: 'flex',
    flexDirection: 'column',
    borderRight: `1px solid ${theme.palette.grey[300]}`,
    background: theme.palette.grey[100],
    zIndex: 1000,
  },
  chips: {
    marginLeft: 10,
  },
  tabScroll: {
    paddingTop: 16,
    flexGrow: 1,
    flexShirnk: 1,
  },
  tabs: {
    marginLeft: theme.spacing(2),
  },
  indent: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(1),
  },
  center: {
    flex: 1,
    maxWidth: 1200,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
    paddingBottom: theme.spacing(1),
    margin: '0 auto',
  },
  statsSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingLeft: theme.spacing(1),
  },
  progressStats: {
    paddingLeft: theme.spacing(1),
    color: DocDarkGrey,
    flex: 1,
  },
  progressWrapper: {
    height: 6,
    width: '100%',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 1,
    width: '100%',
    alignItems: 'left',
    justifyContent: 'center',
    paddingBottom: 6,
    margin: theme.spacing(1),
  },
  formControl: {
    paddingLeft: 35,
    paddingRight: 15,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  stats: {
    marginTop: 20,
    paddingBottom: 15,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  subStat: {
    paddingBottom: 15,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  listItemInner: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    marginBottom: 11,
  },
  disabled: {
    pointerEvents: 'none',
    opacity: 0.5,
  },
  paper: {
    marginBottom: 15,
  },
  diffContainer: {
    display: 'flex',
    height: '100vh',
    paddingLeft: 32,
    paddingRight: 32,
    flexDirection: 'row',
    overflow: 'scroll',
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'center',
  },
  diffWrapper: {
    flex: 1,
    padding: '24px 0px 144px',
    maxWidth: 1280,
  },
  sectionHeader: {
    fontWeight: 400,
    fontSize: 11,
    color: DocDarkGrey,
  },
  fab: {
    position: 'fixed',
    bottom: 15,
    right: 15,
  },
  fabLabel: {
    paddingRight: 8,
  },
  title: {
    fontSize: 14,
    padding: 7,
    textAlign: 'left',
    marginBottom: 4,
  },
  suggestionsBox: {
    display: 'flex',
    paddingLeft: 18,
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionsCount: {
    fontSize: 10,
    color: DocDarkGrey,
  },
  buttonSmall: {
    fontSize: 10,
    padding: 4,
    minWidth: 40,
  },
}));
