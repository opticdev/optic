import React, { useContext } from 'react';
import { DiffType, IDiff, ShapeDiffTypes } from '../../../services/diff/types';
import { IPatchOpenAPI } from '../../../services/patch/types';
import { InteractiveDiffMachineType } from '../../machine';
import { opticJsonSchemaDiffer } from '../../../services/diff/differs/json-schema-json-diff';
import { IPatchGroup } from '../../../services/patch/incremental-json-patch/json-patcher';
import {
  DiffBetweenSpecs,
  showDiffBetweenSpecs,
} from '../utils/show-diff-between-specs';
import { JsonSchemaPatch } from '../../../services/diff/differs/json-schema-json-diff/plugins/plugin-types';

export type DiffAgentContextInput = Omit<
  DiffAgentContext,
  'computePossiblePatches'
>;

type DiffAgentContext = {
  skipQuestion: () => void;
  skipInteraction: () => void;
  answer: (id: string, answer: any) => void;
  diffMachine: InteractiveDiffMachineType;
  computePossiblePatches: (diff: IDiff) => Promise<PatchPreview[]>;
};

export const DiffAgentContext =
  React.createContext<DiffAgentContext>(undefined);

export function DiffAgentContextProvider(props: {
  context: DiffAgentContextInput;
  children: React.ReactElement;
}) {
  return (
    <DiffAgentContext.Provider
      value={{
        ...props.context,
        computePossiblePatches: async (diff) =>
          previewPossiblePatches(
            diff,
            props.context.diffMachine.state.context.specInterface.patch
          ),
      }}
    >
      {props.children}
    </DiffAgentContext.Provider>
  );
}

export function useDiffAgentActions() {
  return useContext(DiffAgentContext)!;
}

export type PatchPreview = {
  effect: string;
  preview: DiffBetweenSpecs;
  jsonSchemaPatch: JsonSchemaPatch;
};

async function previewPossiblePatches(
  diff: IDiff,
  patch: IPatchOpenAPI
): Promise<PatchPreview[]> {
  const patcher = patch.forkedPatcher();
  switch (diff.type) {
    case DiffType.BodyUnmatchedType:
    case DiffType.BodyAdditionalProperty:
    case DiffType.BodyMissingRequiredProperty:
      const differ = opticJsonSchemaDiffer();

      const patches = differ.diffToPatch(diff as ShapeDiffTypes, patcher);

      const allPatches = patches.map(async (p) => {
        const forked = await patch.fork();
        forked.patch.property(p);

        const filePatches = await forked.save({ dryRun: true });

        return {
          preview: showDiffBetweenSpecs(filePatches),
          effect: p.effect,
          jsonSchemaPatch: p,
        };
      });

      return Promise.all(allPatches);

    default:
      throw new Error(
        'should not reach patch preview for this kind of diff ' + diff.type
      );
  }

  return [];
}
