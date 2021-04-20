import * as React from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { TwoColumnFullWidth } from '../../layouts/TwoColumnFullWidth';
import { DiffHeader } from '../../diffs/DiffHeader';
import { DiffCard } from '../../diffs/render/DiffCard';
import sortBy from 'lodash.sortby';
import { makeStyles } from '@material-ui/styles';
import {
  IInterpretation,
  IRequestBodyLocation,
  IResponseBodyLocation,
} from '../../../lib/Interfaces';
import { ICopyRender } from '../../diffs/render/ICopyRender';
import { EndpointDocumentationPane } from './EndpointDocumentationPane';
import { useEndpointDiffs } from '../../hooks/diffs/useEndpointDiffs';
import { useShapeDiffInterpretations } from '../../hooks/diffs/useDiffInterpretations';
import { useSharedDiffContext } from '../../hooks/diffs/SharedDiffContext';
import {
  Collapse,
  IconButton,
  List,
  ListItem,
  ListSubheader,
  Typography,
} from '@material-ui/core';
import { ArrowLeft, ArrowRight } from '@material-ui/icons';
import MenuIcon from '@material-ui/icons/Menu';
import { SimulatedCommandStore } from '../../diffs/contexts/SimulatedCommandContext';
import { EndpointName } from '../../documentation/EndpointName';
import { useEndpoint } from '../../hooks/useEndpointsHook';
import { SpectacleContext } from '../../../spectacle-implementations/spectacle-provider';
import { IForkableSpectacle } from '@useoptic/spectacle';
import { useDiffReviewCapturePageLink } from '../../navigation/Routes';

export function ReviewEndpointDiffPage(props: any) {
  const { match } = props;
  const { method, pathId } = match.params;

  const classes = useStyles();
  const history = useHistory();
  const spectacle = useContext(SpectacleContext)!;

  const diffReviewPage = useDiffReviewCapturePageLink();
  // const lastBatchCommitId = useLastBatchCommitId();
  const endpointDiffs = useEndpointDiffs(pathId, method);
  const endpoint = useEndpoint(pathId, method);
  const {
    context,
    approveCommandsForDiff,
    isDiffHandled,
  } = useSharedDiffContext();

  const shapeDiffs = useShapeDiffInterpretations(
    endpointDiffs.shapeDiffs,
    context.results.trailValues,
  );

  const filteredShapeDiffs = shapeDiffs.results?.filter((i: any) => {
    return !isDiffHandled(i.diffDescription.diffHash);
  });

  const [showToc, setShowToc] = useState(false);
  const [previewCommands, setPreviewCommands] = useState<any[]>([]);
  const [selectedDiff, setSelectedDiffHash] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (filteredShapeDiffs[0]) {
      setPreviewCommands([]);
      setSelectedDiffHash(filteredShapeDiffs[0]!.diffDescription!.diffHash);
    } else if (
      shapeDiffs.results.length > 0 &&
      shapeDiffs.results.every((i) =>
        isDiffHandled(i.diffDescription?.diffHash!),
      )
    ) {
      history.push(diffReviewPage.linkTo());
    }
  }, [
    filteredShapeDiffs.length,
    diffReviewPage,
    filteredShapeDiffs,
    history,
    isDiffHandled,
    shapeDiffs.results,
  ]);

  const renderedDiff: IInterpretation | undefined = useMemo(() => {
    if (selectedDiff) {
      return shapeDiffs.results.find(
        (i) => i.diffDescription!.diffHash === selectedDiff,
      );
    }
  }, [selectedDiff, shapeDiffs]);

  const currentIndex = shapeDiffs.results.findIndex(
    (i) => i.diffDescription?.diffHash === selectedDiff,
  );
  const nextHash =
    shapeDiffs.results[currentIndex + 1]?.diffDescription?.diffHash;
  const previousHash =
    shapeDiffs.results[currentIndex - 1]?.diffDescription?.diffHash;

  const allDiffsHandled = filteredShapeDiffs.length === 0;

  if (allDiffsHandled) {
    return (
      <TwoColumnFullWidth
        left={
          <>
            <DiffHeader
              name={
                endpoint && (
                  <EndpointName
                    method={endpoint!.method}
                    fullPath={endpoint!.fullPath}
                    leftPad={0}
                  />
                )
              }
            />
            <div className={classes.centered}>
              <Typography variant="body2" color="primary">
                All Diffs for this Endpoint have been reviewed.
              </Typography>
            </div>
          </>
        }
        right={
          <SimulatedCommandStore
            spectacle={spectacle as IForkableSpectacle}
            previewCommands={previewCommands}
          >
            <EndpointDocumentationPane method={method} pathId={pathId} />
          </SimulatedCommandStore>
        }
      />
    );
  }

  return (
    <TwoColumnFullWidth
      left={
        <>
          <DiffHeader
            name={
              endpoint && (
                <EndpointName
                  method={endpoint!.method}
                  fullPath={endpoint!.fullPath}
                  leftPad={0}
                />
              )
            }
            secondary={
              <Collapse in={showToc}>
                <DiffLinks
                  shapeDiffs={shapeDiffs.results}
                  setSelectedDiffHash={(hash: string) => {
                    setSelectedDiffHash(hash);
                    setShowToc(false);
                  }}
                />
              </Collapse>
            }
          >
            <IconButton
              size="small"
              color="primary"
              onClick={() => setSelectedDiffHash(previousHash)}
              disabled={currentIndex === 0}
            >
              <ArrowLeft />
            </IconButton>
            <Typography variant="caption" color="textPrimary">
              ({currentIndex + 1}/{shapeDiffs.results.length})
            </Typography>
            <IconButton
              size="small"
              color="primary"
              onClick={() => setSelectedDiffHash(nextHash)}
              disabled={shapeDiffs.results.length - 1 === currentIndex}
            >
              <ArrowRight />
            </IconButton>
            <IconButton
              size="small"
              color="primary"
              onClick={() => setShowToc(!showToc)}
            >
              <MenuIcon style={{ width: 20, height: 20 }} />
            </IconButton>
          </DiffHeader>

          {renderedDiff && (
            <DiffCard
              key={renderedDiff.diffDescription?.diffHash}
              updatedSpecChoices={(choices) => {
                setPreviewCommands(renderedDiff?.toCommands(choices));
              }}
              diffDescription={renderedDiff.diffDescription!}
              handled={isDiffHandled(renderedDiff.diffDescription!.diffHash)}
              previewTabs={renderedDiff.previewTabs}
              changeType={renderedDiff.diffDescription!.changeType}
              specChoices={renderedDiff.updateSpecChoices}
              approve={() => {
                approveCommandsForDiff(
                  renderedDiff!.diffDescription!.diffHash,
                  previewCommands,
                );
              }}
            />
          )}
        </>
      }
      right={
        <SimulatedCommandStore
          spectacle={spectacle as IForkableSpectacle}
          previewCommands={previewCommands}
        >
          <EndpointDocumentationPane
            // lastBatchCommit={lastBatchCommitId}
            highlightedLocation={renderedDiff?.diffDescription?.location}
            method={method}
            pathId={pathId}
          />
        </SimulatedCommandStore>
      }
    />
  );
}

type Section = {
  requestId?: string;
  responseId?: string;
  statusCode?: number;
  contentType?: string;
};

function DiffLinks({
  shapeDiffs,
  setSelectedDiffHash,
}: {
  shapeDiffs: IInterpretation[];
  setSelectedDiffHash: (hash: string) => void;
}) {
  const classes = useStyles();
  const sections = useMemo<Section[]>(() => {
    const sections: Section[] = [];
    const inRequests: IRequestBodyLocation[] = sortBy(
      shapeDiffs
        .filter((i) => i.diffDescription?.location!.inRequest)
        .map((i) => i.diffDescription?.location.inRequest!),
      'contentType',
    );

    inRequests.forEach((req) => {
      const alreadyAdded = sections.find(
        (i) => i.requestId && i.requestId === req.requestId,
      );
      if (!alreadyAdded) {
        sections.push({
          requestId: req.requestId,
          contentType: req.contentType,
        });
      }
    });

    const inResponses: IResponseBodyLocation[] = sortBy(
      shapeDiffs
        .filter((i) => i.diffDescription?.location!.inResponse)
        .map((i) => i.diffDescription?.location.inResponse!),
      'statusCode',
    );

    inResponses.forEach((res) => {
      const alreadyAdded = sections.find(
        (i) => i.responseId && i.responseId === res.responseId,
      );
      if (!alreadyAdded) {
        sections.push({
          responseId: res.responseId,
          statusCode: res.statusCode,
          contentType: res.contentType,
        });
      }
    });
    return sections;
  }, [shapeDiffs]);

  return (
    <List>
      {sections.map((section) => {
        if (section.requestId) {
          return (
            <div>
              <ListSubheader className={classes.locationHeader}>
                {'Request Body ' + section.contentType}
              </ListSubheader>
              {shapeDiffs.map((i, index) => {
                if (
                  i.diffDescription?.location!.inRequest?.requestId ===
                  section.requestId
                )
                  return (
                    <ListItem
                      button
                      key={index}
                      onClick={() =>
                        setSelectedDiffHash(i.diffDescription!.diffHash)
                      }
                    >
                      <ICopyRender variant="" copy={i.diffDescription!.title} />
                    </ListItem>
                  );

                return null;
              })}
            </div>
          );
        } else if (section.responseId) {
          return (
            <div>
              <ListSubheader
                className={classes.locationHeader}
              >{`${section.statusCode} Response ${section.contentType}`}</ListSubheader>
              {shapeDiffs.map((i, index) => {
                if (
                  i.diffDescription?.location!.inResponse?.responseId ===
                  section.responseId
                )
                  return (
                    <ListItem
                      button
                      key={index}
                      onClick={() =>
                        setSelectedDiffHash(i.diffDescription!.diffHash)
                      }
                    >
                      <ICopyRender variant="" copy={i.diffDescription!.title} />
                    </ListItem>
                  );

                return null;
              })}
            </div>
          );
        }
        return null;
      })}
    </List>
  );
}

const useStyles = makeStyles((theme) => ({
  scroll: {
    overflow: 'scroll',
  },
  locationHeader: {
    fontSize: 10,
    height: 33,
  },
  centered: {
    padding: 10,
  },
}));
