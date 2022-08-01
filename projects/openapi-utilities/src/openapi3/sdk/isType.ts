import {
  FactVariant,
  ChangeVariant,
  OpenApiKind,
  IFact,
  IChange,
} from './types';

// We need these type asserters since we don't have a top level property to
// narrow types
// https://stackoverflow.com/a/50872262 -> No narrowing by nested properties
export const isFactVariant = <FactKind extends OpenApiKind>(
  fact: IFact,
  kind: FactKind
): fact is Extract<IFact, FactVariant<FactKind>> => fact.location.kind === kind;

export const isChangeVariant = <ChangeKind extends OpenApiKind>(
  change: IChange,
  kind: ChangeKind
): change is Extract<IChange, ChangeVariant<ChangeKind>> =>
  change.location.kind === kind;

export const isFactOrChangeVariant = <Kind extends OpenApiKind>(
  factOrChange: IFact | IChange,
  kind: Kind
): factOrChange is
  | Extract<IChange, ChangeVariant<Kind>>
  | Extract<IFact, FactVariant<Kind>> => factOrChange.location.kind === kind;
