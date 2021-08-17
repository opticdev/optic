import React, { FC } from 'react';
import { JsonType } from '@useoptic/optic-domain';

import { IShapeRenderer } from '<src>/types';
import * as Theme from '<src>/styles/theme';

export const ShapeTypeSummary: FC<{
  shapes: IShapeRenderer[];
  required: boolean;
  hasColoredFields?: boolean;
}> = ({ shapes, required, hasColoredFields }) => {
  const optionalText = required ? '' : ' (optional)';
  const components = shapes.map(({ jsonType }: { jsonType: JsonType }) => (
    <span
      key={jsonType}
      style={{
        color: hasColoredFields
          ? Theme.jsonTypeColors[jsonType]
          : Theme.GrayText,
      }}
    >
      {jsonType.toString().toLowerCase()}
    </span>
  ));
  if (shapes.length === 1) {
    return (
      <>
        {components} {optionalText}
      </>
    );
  } else {
    const last = components.pop();
    const secondToLast = components.pop();
    return (
      <>
        {components.map((component) => (
          <span key={component.key}>{component}, </span>
        ))}
        {secondToLast} or {last} {optionalText}
      </>
    );
  }
};
