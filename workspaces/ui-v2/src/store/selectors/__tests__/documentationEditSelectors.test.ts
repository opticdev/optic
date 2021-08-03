import { RootState } from '<src>/store/root';
import {
  getValidContributions,
  getDocumentationEditStagedCount,
  isEndpointRemoved,
  isEndpointEditable,
  isFieldRemoved,
  isFieldRemovedRoot,
  isEndpointFieldEditable,
} from '../documentationEditSelectors';

import { getMockReduxStore } from './testHelpers';

let store: RootState;
beforeEach(() => {
  store = getMockReduxStore();
});

describe('getValidContributions', () => {
  test('returns all valid contributions', () => {
    expect(getValidContributions(store)).toMatchSnapshot();
  });

  test('filters out contributions that are for deleted endpoints', () => {
    store.documentationEdits.removedEndpoints.push({
      pathId: 'path_UOIsxzICu5',
      method: 'GET',
    });
    expect(getValidContributions(store)).toMatchSnapshot();
  });

  // TODO FLEB unskip when implemented
  test.skip('filters out contributions that are for deleted fields', () => {});

  // TODO FLEB unskip when implemented
  test.skip('filters out contributions with the same existing contributions value', () => {});
});

describe('getDocumentationEditStagedCount', () => {
  test('contributions', () => {
    expect(getDocumentationEditStagedCount(store)).toBe(2);
  });

  // TODO FLEB unskip when implemented filter contributions and filter endpoint removal
  test.skip('with deleted endpoints and fields', () => {
    store.documentationEdits.removedEndpoints.push({
      pathId: 'path_UOIsxzICu5',
      method: 'GET',
    });
  });
});

test('isEndpointRemoved', () => {
  store.documentationEdits.removedEndpoints.push({
    pathId: 'path_UOIsxzICu5',
    method: 'GET',
  });
  expect(
    isEndpointRemoved({
      pathId: 'path_UOIsxzICu5',
      method: 'GET',
    })(store)
  ).toBe(true);
  expect(
    isEndpointRemoved({
      pathId: 'path_UOIsxzICu5',
      method: 'POST',
    })(store)
  ).toBe(false);
});

test('isEndpointEditable', () => {
  store.documentationEdits.removedEndpoints.push({
    pathId: 'path_UOIsxzICu5',
    method: 'GET',
  });

  for (const isEditing of [true, false]) {
    store.documentationEdits.isEditing = isEditing;
    expect(
      isEndpointEditable({
        pathId: 'path_UOIsxzICu5',
        method: 'GET',
      })(store)
    ).toBe(false);
    expect(
      isEndpointEditable({
        pathId: 'path_UOIsxzICu5',
        method: 'POST',
      })(store)
    ).toBe(isEditing);
  }
});

test('isFieldRemoved', () => {
  store.documentationEdits.fieldEdits.removedFields.push('field_p1mYG7RoTV');
  // Fields and all nested fields should be removed
  const removedFields = ['field_p1mYG7RoTV', 'field_y1zK0XALx0'];
  const nonRemovedFields = ['field_cOmYY7RoTV'];
  for (const fieldId of removedFields) {
    expect(isFieldRemoved(fieldId)(store)).toBe(true);
  }
  for (const fieldId of nonRemovedFields) {
    expect(isFieldRemoved(fieldId)(store)).toBe(false);
  }
});

test('isFieldRemovedRoot', () => {
  store.documentationEdits.fieldEdits.removedFields.push('field_p1mYG7RoTV');
  // Fields and all nested fields should be removed
  const removedRootFields = ['field_p1mYG7RoTV'];
  const nonRemovedRootFields = ['field_cOmYY7RoTV', 'field_y1zK0XALx0'];
  for (const fieldId of removedRootFields) {
    expect(isFieldRemovedRoot(fieldId)(store)).toBe(true);
  }
  for (const fieldId of nonRemovedRootFields) {
    expect(isFieldRemovedRoot(fieldId)(store)).toBe(false);
  }
});

test('isEndpointFieldEditable', () => {
  store.documentationEdits.fieldEdits.removedFields.push('field_p1mYG7RoTV');
  store.documentationEdits.isEditing = true;

  for (const endpointDeleted of [false, true]) {
    if (endpointDeleted) {
      store.documentationEdits.removedEndpoints.push({
        pathId: 'path_UOIsxzICu5',
        method: 'GET',
      });
    }
    // endpoint starts as not deleted

    const removedFields = ['field_p1mYG7RoTV', 'field_y1zK0XALx0'];
    const nonRemovedFields = ['field_cOmYY7RoTV'];
    for (const fieldId of removedFields) {
      expect(
        isEndpointFieldEditable({
          fieldId,
          pathId: 'path_UOIsxzICu5',
          method: 'GET',
        })(store)
      ).toBe(false);
    }
    for (const fieldId of nonRemovedFields) {
      expect(
        isEndpointFieldEditable({
          fieldId,
          pathId: 'path_UOIsxzICu5',
          method: 'GET',
        })(store)
      ).toBe(!endpointDeleted);
    }
  }
});
