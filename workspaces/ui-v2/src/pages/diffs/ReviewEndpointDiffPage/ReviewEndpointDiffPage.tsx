import React, { FC, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { IForkableSpectacle } from '@useoptic/spectacle';

import { EditableTextField, TextFieldVariant } from '<src>/components';
import { TwoColumnFullWidth } from '<src>/components';
import { DiffCard } from '<src>/pages/diffs/components/DiffCard';
import { SimulatedCommandStore } from '<src>/pages/diffs/contexts/SimulatedCommandContext';
import { useSharedDiffContext } from '<src>/pages/diffs/contexts/SharedDiffContext';
import {
  useDebouncedFn,
  useStateWithSideEffect,
  useRunOnKeypress,
} from '<src>/hooks/util';
import { useDiffReviewCapturePageLink } from '<src>/components/navigation/Routes';
import { IInterpretation } from '<src>/lib/Interfaces';
import { getEndpointId } from '<src>/utils';

import {
  RenderedDiffHeaderProps,
  RenderedDiffHeader,
} from './RenderedDiffHeader';
import { EndpointDocumentationPane } from '../EndpointDocumentationPane';
import { useLastBatchCommitId } from '<src>/hooks/useBatchCommits';

const useRedirectForDiffCompleted = (allDiffs: IInterpretation[]) => {
  const history = useHistory();
  const diffReviewPage = useDiffReviewCapturePageLink();
  const { isDiffHandled } = useSharedDiffContext();

  useEffect(() => {
    if (
      allDiffs.length > 0 &&
      allDiffs.every((i) => isDiffHandled(i.diffDescription.diffHash))
    ) {
      history.push(diffReviewPage.linkTo());
    }
  }, [allDiffs, diffReviewPage, history, isDiffHandled]);
};

type ReviewEndpointDiffPageProps = {
  endpoint: RenderedDiffHeaderProps['endpoint'];
  spectacle: IForkableSpectacle;
  allDiffs: RenderedDiffHeaderProps['allDiffs'];
  method: string;
  pathId: string;
};

export const ReviewEndpointDiffPage: FC<ReviewEndpointDiffPageProps> = ({
  endpoint,
  spectacle,
  allDiffs,
  method,
  pathId,
}) => {
  useRedirectForDiffCompleted(allDiffs);
  const {
    approveCommandsForDiff,
    isDiffHandled,
    setEndpointName: setGlobalDiffEndpointName,
    addDiffHashIgnore,
    setCommitModalOpen,
    hasDiffChanges,
  } = useSharedDiffContext();

  const batchCommit = useLastBatchCommitId();

  const debouncedSetName = useDebouncedFn(setGlobalDiffEndpointName, 200);
  const {
    value: endpointName,
    setValue: setEndpointName,
  } = useStateWithSideEffect({
    initialValue: endpoint.purpose,
    sideEffect: (newName: string) => debouncedSetName(endpointId, newName),
  });
  const endpointId = getEndpointId({ method, pathId });

  const getNextIncompleteDiff = (recentlyCompletedDiff?: string): number => {
    for (let i = 0; i < allDiffs.length; i++) {
      const shapeDiff = allDiffs[i];
      if (!shapeDiff.diffDescription) {
        continue;
      }

      const isRecentlyCompletedDiff =
        !!recentlyCompletedDiff &&
        recentlyCompletedDiff === shapeDiff.diffDescription.diffHash;
      const diffHandled = isDiffHandled(shapeDiff.diffDescription.diffHash);
      if (!(isRecentlyCompletedDiff || diffHandled)) {
        return i;
      }
    }

    // If all diffs are complete we should stick on the last rendered diff
    return allDiffs.length - 1;
  };

  const [currentIndex, setCurrentIndex] = useState(getNextIncompleteDiff());
  const [previewCommands, setPreviewCommands] = useState<any[]>([]);
  const renderedDiff = allDiffs[currentIndex];
  const onKeyPress = useRunOnKeypress(
    () => {
      if (hasDiffChanges()) {
        setCommitModalOpen(true);
      }
    },
    {
      keys: new Set(['Enter']),
      inputTagNames: new Set(['input']),
    }
  );

  return (
    <TwoColumnFullWidth
      left={
        <>
          <RenderedDiffHeader
            endpoint={endpoint}
            allDiffs={allDiffs}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
          />
          <DiffCard
            key={renderedDiff.diffDescription.diffHash}
            updatedSpecChoices={(choices) => {
              setPreviewCommands(renderedDiff.toCommands(choices));
            }}
            diffDescription={renderedDiff.diffDescription}
            handled={isDiffHandled(renderedDiff.diffDescription.diffHash)}
            previewTabs={renderedDiff.previewTabs}
            specChoices={renderedDiff.updateSpecChoices}
            approve={() => {
              approveCommandsForDiff(
                renderedDiff.diffDescription.diffHash,
                previewCommands
              );
              setCurrentIndex(
                getNextIncompleteDiff(renderedDiff.diffDescription.diffHash)
              );
            }}
            ignore={() => {
              addDiffHashIgnore(renderedDiff.diffDescription.diffHash);
              setCurrentIndex(
                getNextIncompleteDiff(renderedDiff.diffDescription.diffHash)
              );
            }}
          />
        </>
      }
      right={
        <SimulatedCommandStore
          spectacle={spectacle}
          previewCommands={previewCommands}
        >
          <EndpointDocumentationPane
            method={method}
            pathId={pathId}
            lastBatchCommit={batchCommit}
            highlightedLocation={
              allDiffs[currentIndex].diffDescription.location
            }
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
            onKeyPress={onKeyPress}
          />
        </SimulatedCommandStore>
      }
    />
  );
};
