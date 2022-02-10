/*

  Events the interactive diff machine knows how to handle.
 */

import { ApiTraffic } from '../services/traffic/types';
import { IDiff, IDiffService } from '../services/diff/types';
import { SpecInterface } from '../services/openapi-read-patch-interface';

export enum DiffEventEnum {
  Traffic_Observed = 'TRAFFIC_OBSERVED',
  Agent_Submitted_Patch = 'Agent_Submitted_Patch',
  Reread_Specification = 'Reread_Specification',
  Agent_Skipped_Interaction = 'Agent_Skipped_Interaction',
  Bypass_Error = 'Bypass_Error',
}

export type InteractiveDiffEvents =
  | { type: DiffEventEnum.Traffic_Observed; example: ApiTraffic }
  | { type: DiffEventEnum.Agent_Submitted_Patch; dropCurrentTraffic: boolean }
  | { type: DiffEventEnum.Agent_Skipped_Interaction }
  | { type: DiffEventEnum.Reread_Specification }
  | { type: DiffEventEnum.Bypass_Error };

/*
  Machine state is responsible for
  - keeping a queue of traffic that must be processed, and throwing out interactions that come in once full
  - keep track of its skipping behavior with stats
  - run diff services, and decide if it should show a question to the user, emit patches, or continue
 */

export interface Context {
  skippedCount: number;
  observedCount: number;
  diffsCount: number;
  totalPatchesSaved: number;
  queue: ApiTraffic[];
  diffs: IDiff[];
  diffService: IDiffService | undefined;
  specInterface: SpecInterface | undefined;
}

/*
  Machine options, to moderate behavior

 */

export interface InteractiveDiffMachineOptions {
  maxQueue: number;
}

export const baselineDefaults: InteractiveDiffMachineOptions = {
  maxQueue: 20,
};
