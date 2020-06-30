import { useCaptureContext } from '../../../contexts/CaptureContext';
import { useEffect, useState } from 'react';
import { JsonHelper, ScalaJSHelpers } from '@useoptic/domain';

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
    const getSuggestions = async () => {
      if (diff) {
        const result = await diffService.listSuggestions(
          diff,
          currentInteraction
        );
        if (mounted) {
          setSuggestions(result);
        }
      } else {
        if (mounted) {
          setSuggestions([]);
        }
      }
    };
    getSuggestions();
    return () => (mounted = false);
  }, [diff.toString()]);

  return suggestions;
}

export function useInitialBodyPreview(
  diff,
  currentInteraction,
  inferPolymorphism = false
) {
  const { diffService } = useCaptureContext();

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let mounted = true;
    const getInitialPreview = async () => {
      if (diff && currentInteraction) {
        const result = await diffService.loadInitialPreview(
          diff,
          currentInteraction,
          inferPolymorphism
        );
        if (mounted) {
          setPreview(result);
        }
      } else {
        if (mounted) {
          setPreview(null);
        }
      }
    };
    getInitialPreview();
    return () => (mounted = false);
  }, [
    diff.diff.toString(),
    currentInteraction && currentInteraction.toString(),
  ]);

  return preview;
}
