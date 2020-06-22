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
  }, [diff.toString()]);

  return description;
}

export function useInteractionWithPointer(pointer) {
  const { diffService } = useCaptureContext();
  const [interaction, setInteraction] = useState(null);
  const [interactionScala, setInteractionScala] = useState(null);

  useEffect(() => {
    const getInteraction = async () => {
      if (pointer) {
        const interaction =
          (await diffService.loadInteraction(pointer)).interaction || null;
        setInteraction(interaction);
        setInteractionScala(JsonHelper.fromInteraction(interaction));
      } else {
        setInteraction(null);
        setInteractionScala(null);
      }
    };
    getInteraction();
  }, [pointer]);

  if (interaction && interactionScala) {
    return { interaction, interactionScala };
  }
}

export function useSuggestionsForDiff(diff, currentInteraction) {
  const { diffService } = useCaptureContext();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const getSuggestions = async () => {
      if (diff) {
        setSuggestions(
          await diffService.listSuggestions(diff, currentInteraction)
        );
      } else {
        setSuggestions([]);
      }
    };
    getSuggestions();
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
    const getInitialPreview = async () => {
      if (diff && currentInteraction) {
        setPreview(
          await diffService.loadInitialPreview(
            diff,
            currentInteraction,
            inferPolymorphism
          )
        );
      } else {
        setPreview(null);
      }
    };
    getInitialPreview();
  }, [diff.toString(), currentInteraction]);

  return preview;
}
