import React from 'react';
import DiffInfo from './DiffInfo';
import ShapeDisplay from '../../components/shape-editor/ShapeDisplay';

export function DiffToDiffCard(diff, queries) {
  const diffJs = diff.asJs;
  const [type, diffData] = Object.entries(diff.asJs)[0];

  switch (type) {
    //operation level diffs
    case 'UnmatchedHttpStatusCode':
      return <DiffInfo title={`${diffData.statusCode} response observed`}
                       description="This response code is not documented in the specification"/>;
    //content type diffs
    case 'UnmatchedResponseContentType':
      return <DiffInfo title={`The \`content-type\` does not match the spec`}
                       description="Expected `a/b`" />
    case 'UnmatchedRequestContentType':
      return <DiffInfo title={`The \`content-type\` does not match the spec`}
                       description="Expected `a/b`" />

    //first time shapes observed
    case 'UnmatchedResponseBodyShape': {
      return <DiffInfo title="Shape Mismatch" description={ShapeDiffToCopy(diffData.shapeDiff, queries)}/>;
    }
    case 'UnmatchedRequestBodyShape': {
      return <DiffInfo title="Shape Mismatch" description={ShapeDiffToCopy(diffData.shapeDiff, queries)}/>;
    }
    default:
      return type;
  }
}


export function ShapeDiffToCopy(diff, queries) {
  const [type, diffData] = Object.entries(diff)[0];

  switch (type) {
    case 'NoExpectedShape':
      return 'A type is now known for part of the spec'
    //top level for body
    case 'UnsetShape':
      return 'Observed an initial shape for this body'
    case 'UnsetValue':
      return 'No body was sent'
    case 'NullValue':
      return `\`${diffData.key}\` was null`
    case 'ShapeMismatch':
      return 'The body shape has changed'
    case 'ListItemShapeMismatch': {
      const shapeStructure = queries.nameForShapeId(diffData.expectedList.shapeId)
      const name = shapeStructure.map(({name}) => name).join(' ')
      return `Some items in the list do not match \`${name}\``
    }
    case 'UnsetObjectKey':
      return `\`${diffData.key}\` is missing`
    case 'NullObjectKey':
      return `\`${diffData.key}\` is null`
    case 'UnexpectedObjectKey':
      return `\`${diffData.key}\` is present, but not expected`
    case 'KeyShapeMismatch': {
      const shapeStructure = queries.nameForShapeId(diffData.expected.shapeId)
      const name = shapeStructure.map(({name}) => name).join(' ')

      return ` \`${diffData.key}\` was not a \`${name}\``
    }
    case 'MultipleInterpretations': {
      return `Multiple shapes observed`
    }
    default:
      return 'Difference';
  }
}
