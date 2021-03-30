import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
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
import { useNextEndpointLink } from '../../hooks/diffs/useNextEndpointWithDiffLink';

export function ReviewEndpointDiffPage(props: any) {
  const { match } = props;
  const { method, pathId } = match.params;

  const history = useHistory();
  const nextLink = useNextEndpointLink();
  const endpointDiffs = useEndpointDiffs(pathId, method);
  const {
    context,
    approveCommandsForDiff,
    isDiffHandled,
  } = useSharedDiffContext();

  const shapeDiffs = useShapeDiffInterpretations(
    endpointDiffs.shapeDiffs,
    context.results.trailValues
  );

  const filteredShapeDiffs = shapeDiffs.results?.filter((i: any) => {
    return !isDiffHandled(i.diffDescription.diffHash);
  });

  const [showToc, setShowToc] = useState(false);
  const [previewCommands, setPreviewCommands] = useState<any[]>([]);
  const [selectedDiff, setSelectedDiffHash] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (filteredShapeDiffs[0]) {
      setPreviewCommands([]);
      setSelectedDiffHash(filteredShapeDiffs[0]!.diffDescription!.diffHash);
    } else if (
      shapeDiffs.results.length > 0 &&
      shapeDiffs.results.every((i) =>
        isDiffHandled(i.diffDescription?.diffHash!)
      )
    ) {
      history.push(nextLink);
    }
  }, [filteredShapeDiffs.length]);

  const renderedDiff: IInterpretation | undefined = useMemo(() => {
    if (selectedDiff) {
      return filteredShapeDiffs.find(
        (i) => i.diffDescription!.diffHash === selectedDiff
      );
    }
  }, [selectedDiff]);

  const currentIndex = shapeDiffs.results.findIndex(
    (i) => i.diffDescription?.diffHash === selectedDiff
  );
  const nextHash =
    filteredShapeDiffs[currentIndex + 1]?.diffDescription?.diffHash;
  const previousHash =
    filteredShapeDiffs[currentIndex - 1]?.diffDescription?.diffHash;

  return (
    <TwoColumnFullWidth
      left={
        <>
          <DiffHeader
            name={`Review (${
              endpointDiffs.newRegionDiffs.length +
              endpointDiffs.shapeDiffs.length
            }) Endpoint Diffs`}
            secondary={
              <Collapse in={showToc}>
                <DiffLinks
                  shapeDiffs={filteredShapeDiffs}
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
              ({currentIndex + 1}/{filteredShapeDiffs.length})
            </Typography>
            <IconButton
              size="small"
              color="primary"
              onClick={() => setSelectedDiffHash(nextHash)}
              disabled={filteredShapeDiffs.length - 1 === currentIndex}
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
              diffDescription={renderedDiff.diffDescription!}
              previewTabs={renderedDiff.previewTabs}
              changeType={renderedDiff.diffDescription!.changeType}
              suggestions={renderedDiff.suggestions}
              approve={approveCommandsForDiff}
              suggestionSelected={(commands) => setPreviewCommands(commands)}
            />
          )}
        </>
      }
      right={
        <SimulatedCommandStore previewCommands={previewCommands}>
          <EndpointDocumentationPane
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
      'contentType'
    );

    inRequests.forEach((req) => {
      const alreadyAdded = sections.find(
        (i) => i.requestId && i.requestId === req.requestId
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
      'statusCode'
    );

    inResponses.forEach((res) => {
      const alreadyAdded = sections.find(
        (i) => i.responseId && i.responseId === res.responseId
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
  }, [shapeDiffs.length]);

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
}));
