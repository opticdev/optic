import React, { FC, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { TwoColumnFullWidth } from '../../../layouts/TwoColumnFullWidth';
import { DiffHeader } from '../../../diffs/DiffHeader';
import { DiffCard } from '../../../diffs/render/DiffCard';
import { makeStyles } from '@material-ui/styles';
import { AddContribution } from '../../../../lib/command-factory';

import { EndpointDocumentationPane } from '../EndpointDocumentationPane';
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
import { IEndpoint } from '../../../hooks/useEndpointsHook';
import { IForkableSpectacle } from '@useoptic/spectacle';
import { useDiffReviewCapturePageLink } from '../../../navigation/Routes';
import { getEndpointId } from '../../../utilities/endpoint-utilities';
import { DiffLinks } from './DiffLinks';
import { IInterpretation } from '../../../../lib/Interfaces';
import { useDebouncedFn, useStateWithSideEffect } from '../../../hooks/util';

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

type ReviewEndpointDiffPageProps = {
  endpoint: IEndpoint;
  spectacle: IForkableSpectacle;
  shapeDiffs: IInterpretation[];
  method: string;
  pathId: string;
};

export const ReviewEndpointDiffPage: FC<ReviewEndpointDiffPageProps> = ({
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

  const debouncedSetName = useDebouncedFn(setGlobalDiffEndpointName, 200);
  const {
    value: endpointName,
    setValue: setEndpointName,
  } = useStateWithSideEffect({
    initialValue: endpoint.purpose,
    sideEffect: (newName: string) =>
      debouncedSetName(
        endpointId,
        AddContribution(endpointId, 'purpose', newName)
      ),
  });
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
                  setValue={setEndpointName}
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
