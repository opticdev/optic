// function newShapeId
// function newPathId
// function newRequestId
// function newResponseId
// function newRequestParameterId
// function newShapeParameterId
// function newFieldId
import shortId from 'shortid';

export interface DomainIdGenerator {
  newShapeId: () => string;
  newPathId: () => string;
  newRequestId: () => string;
  newResponseId: () => string;
  newShapeParameterId: () => string;
  newFieldId: () => string;
}

export function newDeterministicIdGenerator(): DomainIdGenerator {
  const newShapeId = sequentialId('shape');
  const newPathId = sequentialId('path');
  const newRequestId = sequentialId('request');
  const newResponseId = sequentialId('response');
  const newShapeParameterId = sequentialId('shape-parameter');
  const newFieldId = sequentialId('field');

  return {
    newShapeId,
    newPathId,
    newRequestId,
    newResponseId,
    newShapeParameterId,
    newFieldId,
  };
}

export function newRandomIdGenerator(): DomainIdGenerator {
  const newShapeId = randomId('shape');
  const newPathId = randomId('path');
  const newRequestId = randomId('request');
  const newResponseId = randomId('response');
  const newShapeParameterId = randomId('shape-parameter');
  const newFieldId = randomId('field');

  return {
    newShapeId,
    newPathId,
    newRequestId,
    newResponseId,
    newShapeParameterId,
    newFieldId,
  };
}

function sequentialId(prefix: string) {
  let number = 0;
  return () => {
    const id = `${prefix}_${number}`;
    number = number + 1;
    return id;
  };
}
function randomId(prefix: string) {
  return () => {
    return `${prefix}_${shortId.generate()}`;
  };
}
