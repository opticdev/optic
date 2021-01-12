import { useCaptureContext } from '../../../contexts/CaptureContext';
import { useEffect, useState } from 'react';
import { JsonHelper, ScalaJSHelpers } from '@useoptic/domain';
import { RequirementForDiffsToHaveASuggestionFailed } from '@useoptic/analytics/lib/events/errors';
export function useDiffDescription(diff) {
  const { diffService } = useCaptureContext();
  const [description, setDescription] = useState(null);

  useEffect(() => {
    const getDescription = async () => {
      setDescription((await diffService.loadDescription(diff)) || null);
    };
    getDescription();
  }, [diff.diff.toString()]);

  return description;
}

export function useInteractionWithPointer(pointer) {
  const { captureService } = useCaptureContext();
  const [interaction, setInteraction] = useState(null);

  useEffect(() => {
    let mounted = true;
    const getInteraction = async () => {
      if (pointer) {
        setInteraction(null);
        const interaction =
          (await captureService.loadInteraction(pointer)).interaction || null;
        if (mounted) {
          setInteraction({
            interaction,
            interactionScala: JsonHelper.fromInteraction(interaction),
          });
        }
      } else {
        if (mounted) {
          setInteraction(null);
        }
      }
    };

    getInteraction();

    return () => (mounted = false);
  }, [pointer]);

  return interaction;
}

export function useSuggestionsForDiff(diff, currentInteraction) {
  const { diffService } = useCaptureContext();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    let mounted = true;
    console.log('look here ', mounted);
    const getSuggestions = async () => {
      if (diff) {
        const result = await diffService.listSuggestions(
          diff,
          currentInteraction
        );
        if (mounted) {
          setSuggestions(result);
          if (result.length === 0) {
            // trackUserEvent(
            //   RequirementForDiffsToHaveASuggestionFailed.with({
            //     diff: diff.toString(),
            //   })
            // );
          }
        }
      } else {
        if (mounted) {
          setSuggestions([]);
        }
      }
    };
    getSuggestions();
    return () => (mounted = false);
  }, [diff && diff.diff.toString()]);

  return suggestions;
}

window.naiveCache = {};

export function useInitialBodyPreview(
  diff,
  currentInteraction,
  inferPolymorphism = false,
  endpointId
) {
  const { diffService } = useCaptureContext();

  const [preview, setPreview] = useState(null);
  const [loadingInferPoly, setLoadingInferPoly] = useState(false);

  useEffect(() => {
    window.naiveCache = {};
  }, [endpointId]);

  useEffect(() => {
    let mounted = true;
    const cacheKey = diff.toString() + inferPolymorphism.toString();
    console.log('cache key ' + cacheKey);
    const getInitialPreview = async () => {
      if (diff && currentInteraction) {
        if (inferPolymorphism) {
          setLoadingInferPoly(true);
        }

        const result = window.naiveCache[cacheKey]
          ? await Promise.resolve(window.naiveCache[cacheKey])
          : await diffService.loadInitialPreview(
              diff,
              currentInteraction,
              inferPolymorphism
            );

        if (mounted) {
          setLoadingInferPoly(false);
          setPreview(result);
          window.naiveCache[cacheKey] = result;
        }
      } else {
        if (mounted) {
          setLoadingInferPoly(false);
          setPreview(null);
        }
      }
    };
    getInitialPreview();
    return () => (mounted = false);
  }, [
    diff.diff.toString(),
    currentInteraction && currentInteraction.toString(),
    inferPolymorphism,
  ]);

  return { preview, loadingInferPoly };
}
