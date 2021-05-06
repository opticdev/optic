import React, { FC, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { IForkableSpectacle } from '@useoptic/spectacle';

import {
  EditableTextField,
  TextFieldVariant,
} from '<src>/optic-components/common';
import { TwoColumnFullWidth } from '<src>/optic-components/layouts/TwoColumnFullWidth';
import { DiffCard } from '<src>/optic-components/diffs/render/DiffCard';
import { SimulatedCommandStore } from '<src>/optic-components/diffs/contexts/SimulatedCommandContext';
import { useSharedDiffContext } from '<src>/optic-components/hooks/diffs/SharedDiffContext';
import {
  useDebouncedFn,
  useStateWithSideEffect,
} from '<src>/optic-components/hooks/util';
import { useDiffReviewCapturePageLink } from '<src>/optic-components/navigation/Routes';
import { IInterpretation } from '<src>/lib/Interfaces';
import { getEndpointId } from '<src>/optic-components/utilities/endpoint-utilities';
import { useRunOnKeypress } from '<src>/optic-components/hooks/util';

import {
  RenderedDiffHeaderProps,
  RenderedDiffHeader,
} from './RenderedDiffHeader';
import { EndpointDocumentationPane } from '../EndpointDocumentationPane';

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
  endpoint: RenderedDiffHeaderProps['endpoint'];
  spectacle: IForkableSpectacle;
  shapeDiffs: RenderedDiffHeaderProps['shapeDiffs'];
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
    approveCommandsForDiff,
    isDiffHandled,
    setEndpointName: setGlobalDiffEndpointName,
    addDiffHashIgnore,
    setCommitModalOpen,
    hasDiffChanges,
  } = useSharedDiffContext();

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
    for (let i = 0; i < shapeDiffs.length; i++) {
      const shapeDiff = shapeDiffs[i];
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
    return shapeDiffs.length - 1;
  };

  const [currentIndex, setCurrentIndex] = useState(getNextIncompleteDiff());
  const [previewCommands, setPreviewCommands] = useState<any[]>([]);
  const renderedDiff = shapeDiffs[currentIndex];
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
            shapeDiffs={shapeDiffs}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
          />
          <DiffCard
            key={renderedDiff.diffDescription?.diffHash}
            updatedSpecChoices={(choices) => {
              setPreviewCommands(renderedDiff.toCommands(choices));
            }}
            diffDescription={renderedDiff.diffDescription!}
            handled={isDiffHandled(renderedDiff.diffDescription!.diffHash)}
            previewTabs={renderedDiff.previewTabs}
            specChoices={renderedDiff.updateSpecChoices}
            approve={() => {
              approveCommandsForDiff(
                renderedDiff.diffDescription!.diffHash,
                previewCommands
              );
              setCurrentIndex(
                getNextIncompleteDiff(renderedDiff.diffDescription!.diffHash)
              );
            }}
            ignore={() => {
              addDiffHashIgnore(renderedDiff.diffDescription!.diffHash);
              setCurrentIndex(
                getNextIncompleteDiff(renderedDiff.diffDescription!.diffHash)
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
            highlightedLocation={
              shapeDiffs[currentIndex].diffDescription?.location
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
