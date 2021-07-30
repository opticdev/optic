import { RootState } from '<src>/store/root';
import {
  getShapeRenderer,
  createFlatList,
  convertShapeToQueryParameters,
} from '../shapeSelectors';

import { getMockReduxStore } from './testHelpers';

let store: RootState;
beforeEach(() => {
  store = getMockReduxStore();
});
describe('getShapeRenderer', () => {
  test('loading', () => {
    store.shapes.rootShapes['shape_123'] = {
      loading: true,
    };
    expect(getShapeRenderer('shape_123')(store)).toEqual({
      loading: true,
    });
  });

  test('no shape', () => {
    expect(getShapeRenderer('shape_123')(store)).toEqual({
      loading: true,
    });
  });

  test('error', () => {
    store.shapes.rootShapes['shape_123'] = {
      loading: false,
      error: new Error('asd'),
    };
    const shapeState = getShapeRenderer('shape_123')(store);
    expect(shapeState.loading).toBe(false);
    expect(shapeState.error).toBeTruthy();
  });

  test('converts shapes to shape renderers', () => {
    const shapeState = getShapeRenderer('shape_cEkQAVQ3ib')(store);
    expect(shapeState.loading).toBe(false);
    expect(shapeState.data).toMatchSnapshot();
  });

  test('converts shapes to shape renderers with changelog', () => {
    const shapeState = getShapeRenderer(
      'shape_cEkQAVQ3ib',
      'batchcommitid'
    )(store);
    expect(shapeState.loading).toBe(false);
    expect(shapeState.data).toMatchSnapshot();
  });
});

describe('createFlatList', () => {
  test('converts shape to a contribution list', () => {
    const shapeState = getShapeRenderer('shape_cEkQAVQ3ib')(store);
    expect(
      createFlatList(shapeState.data!, 'path_UOIsxzICu5.GET')
    ).toMatchSnapshot();
  });
});

describe('convertShapeToQueryParameters', () => {
  test('converts a shape renderer into a query parameter', () => {
    const shapeState = getShapeRenderer('shape_tNRgroSwLj')(store);
    expect(convertShapeToQueryParameters(shapeState.data!)).toMatchSnapshot();
  });
});
