// @ts-nocheck
import { IValueAffordanceSerializationWithCounter } from '@useoptic/cli-shared/build/diffs/initial-types';
import equals from 'lodash.isequal';
import { IJsonTrail } from '@useoptic/cli-shared/build/diffs/json-trail';
import {
  ICoreShapeKinds,
  IRequestBodyLocation,
  IResponseBodyLocation,
} from '../Interfaces';

export interface IgnoreRule {
  diffHash: string;
  specificInteractions?: string[];
  examplesOfCoreShapeKinds?: ICoreShapeKinds;
  newBodyInRequest?: IRequestBodyLocation;
  newBodyInResponse?: IResponseBodyLocation;
}

export function transformAffordanceMappingByIgnoreRules(
  i: IValueAffordanceSerializationWithCounter,
  diffHash: string,
  jsonTrail: IJsonTrail,
  rules: IgnoreRule[]
): IValueAffordanceSerializationWithCounter {
  const relevantRules = rules.filter(
    (i) => i.diffHash === diffHash && !!i.examplesOfCoreShapeKinds
  );

  // no reason to copy if nothing will change
  if (relevantRules.length === 0) {
    return i;
  }

  const copied: IValueAffordanceSerializationWithCounter = JSON.parse(
    JSON.stringify(i)
  );

  const result = relevantRules.reduce((values, rule) => {
    const coreShapeKind: ICoreShapeKinds = rule.examplesOfCoreShapeKinds!;

    const keyMapping = {
      [ICoreShapeKinds.StringKind]: 'wasString',
      [ICoreShapeKinds.NumberKind]: 'wasNumber',
      [ICoreShapeKinds.BooleanKind]: 'wasBoolean',
      [ICoreShapeKinds.NullableKind]: 'wasNull',
      [ICoreShapeKinds.ListKind]: 'wasArray',
      [ICoreShapeKinds.ObjectKind]: 'wasObject',
      [ICoreShapeKinds.OptionalKind]: 'wasMissing',
    };

    const key: string = keyMapping[coreShapeKind]!;

    values.interactions[key] = []; // remove pointers to these references
    values.interactions[key + 'Trails'] = {}; // remove json trails
    values.affordances = values.affordances.map((i) => {
      if (equals(i.trail, jsonTrail)) {
        return { ...i, [key]: false }; // flip 'wasX' to false
      } else {
        return i;
      }
    });

    return values;
  }, copied);

  return result;
}

/*
usage

 const ignoreRulesProcessed = transformAffordanceMappingByIgnoreRules(
    learnedTrails,
    diff.diffHash,
    diff.asShapeDiff()!.jsonTrail,
    [ignoreRule]
  );

  const { suggestions, previewTabs } = interpretShapeDiffs(
    diff,
    ignoreRulesProcessed,
    services
  );
 */
