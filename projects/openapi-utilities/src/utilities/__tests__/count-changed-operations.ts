import { countOperationsModifications } from '../count-changed-operations';
import {
  OpenApiKind,
  ChangeType,
  ChangeVariant,
} from '../../openapi/sdk/types';

const postAddition: ChangeVariant<OpenApiKind.Operation> = {
  location: {
    jsonPath: '/paths/~1user~1{username}/post',
    conceptualPath: ['operations', '/user/{}', 'post'],
    kind: OpenApiKind.Operation,
    conceptualLocation: { method: 'post', path: '/user/{username}' },
  },
  added: {
    tags: ['user'],
    summary: 'post',
    operationId: 'postUser',
    method: 'post',
    pathPattern: '/user/{username}',
  },
  changeType: ChangeType.Added,
};

const putRemoval: ChangeVariant<OpenApiKind.Operation> = {
  location: {
    jsonPath: '/paths/~1user~1{username}/put',
    conceptualPath: ['operations', '/user/{}', 'put'],
    kind: OpenApiKind.Operation,
    conceptualLocation: { method: 'put', path: '/user/{username}' },
  },
  removed: {
    before: {
      tags: ['user'],
      summary: 'put',
      operationId: 'putUser',
      method: 'put',
      pathPattern: '/user/{username}',
    },
  },
  changeType: ChangeType.Removed,
};

const patchChange: ChangeVariant<OpenApiKind.Operation> = {
  location: {
    jsonPath: '/paths/~1user~1{username}/patch',
    conceptualPath: ['operations', '/user/{}', 'patch'],
    kind: OpenApiKind.Operation,
    conceptualLocation: { method: 'patch', path: '/user/{username}' },
  },
  changed: {
    before: {
      summary: 'patch',
      operationId: 'patchUser',
      method: 'patch',
      pathPattern: '/user/{username}',
    },
    after: {
      tags: ['user'],
      summary: 'patch',
      operationId: 'patchUser',
      method: 'patch',
      pathPattern: '/user/{username}',
    },
  },
  changeType: ChangeType.Changed,
};

const nestedPatchChange: ChangeVariant<OpenApiKind.Request> = {
  location: {
    jsonPath: '/paths/~1user~1{username}/patch/requestBody',
    conceptualPath: ['operations', '/user/{}', 'patch', 'requestBody'],
    kind: OpenApiKind.Request,
    conceptualLocation: {
      method: 'patch',
      path: '/user/{username}',
      inRequest: {},
    },
  },
  added: { description: '' },
  changeType: ChangeType.Added,
};

describe('countOperationsModifications', () => {
  it('counts an addition, a change and a removal correctly', () => {
    const count = countOperationsModifications([
      postAddition,
      patchChange,
      nestedPatchChange,
      putRemoval,
    ]);
    expect(count.added).toBe(1);
    expect(count.changed).toBe(1);
    expect(count.removed).toBe(1);
  });
});
