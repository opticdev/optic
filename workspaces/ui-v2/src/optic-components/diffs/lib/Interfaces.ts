import { ICopy } from '../render/ICopyRender';

export enum IChangeType {
  Added,
  Changed,
  Removed,
}

interface ICopyPair {
  activeTense: ICopy[];
  pastTense: ICopy[];
}

export interface ISuggestion {
  action: ICopyPair;
  commands: any[];
  changeType: IChangeType;
}
