import { tabInPath } from '../tab-or-delete-in-path';

describe('tab or delete in path', () => {
  it('will append last component', () => {
    expect(
      tabInPath('/example/{exampleId}', '/example/123/status')
    ).toMatchSnapshot();
  });
  it('will append last component when trailing slash', () => {
    expect(
      tabInPath('/example/{exampleId}/', '/example/123/status')
    ).toMatchSnapshot();
  });

  it('will do nothing when full path', () => {
    expect(
      tabInPath('/example/{exampleId}/status', '/example/123/status')
    ).toMatchSnapshot();
  });

  it('will append constant 2nd component', () => {
    expect(tabInPath('/example', '/example/123/status')).toMatchSnapshot();
  });
});
