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
import { CaptureContext } from '../../../contexts/CaptureContext';
import {
  DiffResultHelper,
  getOrUndefined,
  JsonHelper,
  mapScala,
} from '@useoptic/domain';
import { DiffContext } from './DiffContext';
import { NewRegions } from './DiffPreview';
import { DiffCursor } from './DiffCursor';
import DiffReviewExpanded from './DiffReviewExpanded';
import { RfcContext } from '../../../contexts/RfcContext';
const newRegionsConst = 'new_regions';

export function DiffReviewPage(props) {
  const { captureId, method, pathId } = props;
  const classes = useStyles();

  const { rfcId, rfcService } = useContext(RfcContext);
  const rfcState = rfcService.currentState(rfcId);

  const { endpointDescriptor } = useContext(EndpointsContext);
  const {
    diffsForThisEndpoint,
    completed,
    setSelectedDiff,
    selectedDiff,
  } = useContext(DiffContext);

  const [currentTab, setCurrentTab] = useState(null);

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

      if (regions.newRegionCount > 0) {
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

  return (
    <div className={classes.container}>
      <div className={classes.navigationContainer}>
        <div className={classes.navRoot}>
          <div className={classes.header}>
            <Typography variant="subtitle2" className={classes.title}>
              {endpointDescriptor.endpointPurpose}
            </Typography>
            <PathAndMethodOverflowFriendly
              method={endpointDescriptor.httpMethod}
              path={endpointDescriptor.fullPath}
            />
          </div>

          <DocDivider />

          <div className={classes.tabScroll}>
            <Tabs
              orientation="vertical"
              className={classes.tabs}
              onChange={(_, value) => {
                setSelectedDiff(null);
                setCurrentTab(value);
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

              {regions.requestCount && (
                <Typography
                  variant="overline"
                  className={classes.sectionHeader}
                >
                  Request Body Diffs
                </Typography>
              )}

              {requestBodyTabs}

              {regions.requestCount && (
                <DocDivider style={{ marginTop: 16, marginBottom: 16 }} />
              )}

              {responseBodyTabs}
            </Tabs>
          </div>
        </div>
      </div>
      <div className={classes.pageContainer}>
        <div className={classes.center}>
          {currentTab === newRegionsConst && (
            <NewRegions
              // ignoreDiff={ignoreDiff}
              newRegions={JsonHelper.seqToJsArray(regions.newRegions)}
            />
          )}

          {currentTab && currentTab !== newRegionsConst && (
            <>
              <DiffCursor
                diffs={JsonHelper.seqToJsArray(
                  regions.bodyDiffsForId(currentTab)
                )}
                setSelectedDiff={setSelectedDiff}
                selectedDiff={selectedDiff}
                completed={completed}
              />
              {selectedDiff && <DiffReviewExpanded diff={selectedDiff} />}
            </>
          )}

          <Fab
            variant="extended"
            className={classes.fab}
            color="primary"
            size="small"
            classes={{
              label: classes.fabLabel,
            }}
          >
            <DoneIcon fontSize="small" style={{ marginRight: 5 }} />
            Finalize
          </Fab>
        </div>
      </div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
  navigationContainer: {
    width: 230,
    overflow: 'hidden',
    display: 'flex',
  },
  pageContainer: {
    display: 'flex',
    flex: 1,
    overflow: 'scroll',
    height: '100vh',
    justifyContent: 'center',
  },
  navRoot: {
    flexGrow: 1,
    position: 'fixed',
    width: 'inherit',
    height: '100vh',
    overflowY: 'scroll',
    display: 'flex',
    flexDirection: 'column',
    borderRight: `1px solid ${theme.palette.grey[300]}`,
    background: theme.palette.grey[100],
  },
  chips: {
    marginLeft: 10,
  },
  tabScroll: {
    paddingTop: 16,
    flexGrow: 1,
    flexShirnk: 1,
    overflow: 'scroll',
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
    paddingBottom: 300,
    maxWidth: 1200,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 22,
  },
  statsSection: {
    paddingBottom: theme.spacing(2),
  },
  progressStats: {
    paddingLeft: theme.spacing(1),
    color: DocDarkGrey,
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
    alignItems: 'center',
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
    textAlign: 'center',
    marginBottom: 4,
  },
}));
