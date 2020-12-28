import {
  ICaptureService,
  IDiffService,
  ILoadInteractionResponse,
} from '../../services/diff';
import { DiffRfcBaseState } from './diff-rfc-base-state';

export interface InteractiveSessionConfig {
  loadInteraction: (pointer: string) => Promise<ILoadInteractionResponse>;
  rfcBaseState: DiffRfcBaseState;
}
