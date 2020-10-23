import { ICaptureService, IDiffService } from '../../services/diff';
import { DiffRfcBaseState } from './diff-rfc-base-state';

export interface InteractiveSessionConfig {
  captureService: ICaptureService;
  diffService: IDiffService;
  rfcBaseState: DiffRfcBaseState;
}
