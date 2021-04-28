import React, { FC, useContext, useEffect, useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import debounce from 'lodash.debounce';
import { TwoColumnFullWidth } from '../../../layouts/TwoColumnFullWidth';
import { DiffHeader } from '../../../diffs/DiffHeader';
import { DiffCard } from '../../../diffs/render/DiffCard';
import { makeStyles } from '@material-ui/styles';
import { AddContribution } from '../../../../lib/command-factory';

import { EndpointDocumentationPane } from '../EndpointDocumentationPane';
import { useEndpointDiffs } from '../../../hooks/diffs/useEndpointDiffs';
import { useShapeDiffInterpretations } from '../../../hooks/diffs/useDiffInterpretations';
import { useSharedDiffContext } from '../../../hooks/diffs/SharedDiffContext';
import { Collapse, IconButton, Typography } from '@material-ui/core';
import { ArrowLeft, ArrowRight } from '@material-ui/icons';
import MenuIcon from '@material-ui/icons/Menu';
import { SimulatedCommandStore } from '../../../diffs/contexts/SimulatedCommandContext';
import {
  EndpointName,
  EditableTextField,
  TextFieldVariant,
} from '../../../common';
import { IEndpoint, useEndpoint } from '../../../hooks/useEndpointsHook';
import { SpectacleContext } from '../../../../spectacle-implementations/spectacle-provider';
import { IForkableSpectacle } from '@useoptic/spectacle';
import { useDiffReviewCapturePageLink } from '../../../navigation/Routes';
import { getEndpointId } from '../../../utilities/endpoint-utilities';
import { DiffLinks } from './DiffLinks';
import { IInterpretation } from '../../../../lib/Interfaces';

const useRedirectForDiffCompleted = (shapeDiffs: IInterpretation[]) => {
  const history = useHistory();
  const diffReviewPage = useDiffReviewCapturePageLink();
  const { isDiffHandled } = useSharedDiffContext();

  useEffect(() => {
    if (
      shapeDiffs.length > 0 &&
      shapeDiffs.every((i) => isDiffHandled(i.diffDescription?.diffHash!))
    ) {
      history.push(diffReviewPage.linkTo());
    }
  }, [shapeDiffs, diffReviewPage, history, isDiffHandled]);
};

export const ReviewEndpointDiffContainer: FC<
  RouteComponentProps<{
    method: string;
    pathId: string;
  }>
> = ({ match }) => {
  const { method, pathId } = match.params;

  const spectacle = useContext(SpectacleContext)!;

  // const lastBatchCommitId = useLastBatchCommitId();
  const endpointDiffs = useEndpointDiffs(pathId, method);
  const endpoint = useEndpoint(pathId, method);
  const { context } = useSharedDiffContext();

  const shapeDiffs = useShapeDiffInterpretations(
    endpointDiffs.shapeDiffs,
    context.results.trailValues
  );

  //
  // const newBodyDiffs = useNewBodyDiffInterpretations(
  //   endpointDiffs.newRegionDiffs,
  // );

  return !endpoint || shapeDiffs.loading ? (
    // @nic todo add in this loading state
    <div>TODO loading state</div>
  ) : (
    <ReviewEndpointDiffPage
      endpoint={endpoint}
      shapeDiffs={shapeDiffs.results}
      spectacle={spectacle as IForkableSpectacle}
      method={method}
      pathId={pathId}
    />
  );
};

type ReviewEndpointDiffPageProps = {
  endpoint: IEndpoint;
  spectacle: IForkableSpectacle;
  shapeDiffs: IInterpretation[];
  method: string;
  pathId: string;
};

const ReviewEndpointDiffPage: FC<ReviewEndpointDiffPageProps> = ({
  endpoint,
  spectacle,
  shapeDiffs,
  method,
  pathId,
}) => {
  useRedirectForDiffCompleted(shapeDiffs);
  const {
    isDiffHandled,
    setEndpointName: setGlobalDiffEndpointName,
  } = useSharedDiffContext();

  const [endpointName, setEndpointName] = useState(endpoint.purpose);
  const debouncedSetGlobalDiffEndpointName = useMemo(
    () => debounce(setGlobalDiffEndpointName, 200),
    [setGlobalDiffEndpointName]
  );
  const wrappedSetEndpointName = (newName: string) => {
    setEndpointName(newName);
    debouncedSetGlobalDiffEndpointName(
      endpointId,
      AddContribution(endpointId, 'purpose', newName)
    );
  };
  const endpointId = getEndpointId({ method, pathId });

  const filteredShapeDiffs = shapeDiffs.filter((i: any) => {
    return !isDiffHandled(i.diffDescription.diffHash);
  });

  const allDiffsHandled = filteredShapeDiffs.length === 0;

  const [previewCommands, setPreviewCommands] = useState<any[]>([]);

  return (
    <TwoColumnFullWidth
      left={
        allDiffsHandled ? (
          <AllDiffsHandled endpoint={endpoint} />
        ) : (
          <ReviewableDiffs
            endpoint={endpoint}
            shapeDiffs={shapeDiffs}
            previewCommands={previewCommands}
            setPreviewCommands={setPreviewCommands}
          />
        )
      }
      right={
        <SimulatedCommandStore
          spectacle={spectacle}
          previewCommands={previewCommands}
        >
          <EndpointDocumentationPane
            method={method}
            pathId={pathId}
            renderHeader={() => (
              <>
                <Helmet>
                  <title>{endpointName || 'Unnamed Endpoint'}</title>
                </Helmet>
                <EditableTextField
                  isEditing={true}
                  setEditing={() => {}}
                  value={endpointName}
                  setValue={wrappedSetEndpointName}
                  helperText="Help consumers by naming this endpoint"
                  defaultText="What does this endpoint do?"
                  variant={TextFieldVariant.REGULAR}
                />
              </>
            )}
          />
        </SimulatedCommandStore>
      }
    />
  );
};

const AllDiffsHandled: FC<{
  endpoint: ReviewEndpointDiffPageProps['endpoint'];
}> = ({ endpoint }) => {
  const classes = useStyles();

  return (
    <>
      <DiffHeader
        name={
          <EndpointName
            method={endpoint.method}
            fullPath={endpoint.fullPath}
            leftPad={0}
          />
        }
      />
      <div className={classes.centered}>
        <Typography variant="body2" color="primary">
          All Diffs for this Endpoint have been reviewed.
        </Typography>
      </div>
    </>
  );
};

const ReviewableDiffs: FC<{
  endpoint: ReviewEndpointDiffPageProps['endpoint'];
  shapeDiffs: ReviewEndpointDiffPageProps['shapeDiffs'];
  previewCommands: any;
  setPreviewCommands: (commands: any) => void;
}> = ({ endpoint, shapeDiffs, previewCommands, setPreviewCommands }) => {
  const [showToc, setShowToc] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { approveCommandsForDiff, isDiffHandled } = useSharedDiffContext();

  // If shapeDiffs.length is 0, the allDiffsHandled view will be rendered
  const renderedDiff = shapeDiffs[currentIndex];

  return (
    <>
      <DiffHeader
        name={
          <EndpointName
            method={endpoint!.method}
            fullPath={endpoint!.fullPath}
            leftPad={0}
          />
        }
        secondary={
          <Collapse in={showToc}>
            <DiffLinks
              shapeDiffs={shapeDiffs}
              setSelectedDiffHash={(hash: string) => {
                const hashIndex = shapeDiffs.findIndex(
                  (i) => i.diffDescription?.diffHash === hash
                );
                // findIndex possibly returns -1
                setCurrentIndex(Math.max(hashIndex, 0));
                setShowToc(false);
              }}
            />
          </Collapse>
        }
      >
        <IconButton
          size="small"
          color="primary"
          onClick={() => setCurrentIndex((prevIndex) => prevIndex - 1)}
          disabled={currentIndex === 0}
        >
          <ArrowLeft />
        </IconButton>
        <Typography variant="caption" color="textPrimary">
          ({currentIndex + 1}/{shapeDiffs.length})
        </Typography>
        <IconButton
          size="small"
          color="primary"
          onClick={() => setCurrentIndex((prevIndex) => prevIndex + 1)}
          disabled={shapeDiffs.length - 1 === currentIndex}
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
          specChoices={renderedDiff.updateSpecChoices}
          approve={() => {
            approveCommandsForDiff(
              renderedDiff!.diffDescription!.diffHash,
              previewCommands
            );
          }}
        />
      )}
    </>
  );
};

const useStyles = makeStyles((theme) => ({
  centered: {
    padding: 10,
  },
}));
