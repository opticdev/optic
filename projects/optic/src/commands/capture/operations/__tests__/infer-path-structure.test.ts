import { beforeEach, describe, test, expect } from '@jest/globals';
import { PathInference } from '../infer-path-structure';

describe('from a fresh spec without known paths', () => {
  test('it will return the url if no inferences can be made', () => {
    const pathInference = new PathInference();
    expect(pathInference.getInferedPattern('/api/users/status')).toBe(
      '/api/users/status'
    );
  });

  test('it can guess the structure with obvious variables', () => {
    const pathInference = new PathInference();
    expect(
      pathInference.getInferedPattern('/organizations/648/repositories/11221')
    ).toBe('/organizations/{organization}/repositories/{repository}');
  });

  test('it can guess overlapping string types when observed', () => {
    const pathInference = new PathInference();
    pathInference.addObservedUrl('/organizations/opticdev/repositories/optic');
    pathInference.addObservedUrl(
      '/organizations/opticdev/repositories/optic-10'
    );
    pathInference.addObservedUrl('/organizations/opticdev/repositories/fun');
    pathInference.addObservedUrl('/organizations/acme-fun/repositories/demo');

    expect(
      pathInference.getInferedPattern(
        '/organizations/opticdev/repositories/fun'
      )
    ).toBe('/organizations/{organization}/repositories/{repository}');
  });

  test('it respects reserved paths', () => {
    const pathInference = new PathInference();
    pathInference.addObservedUrl('/api/123456789');
    pathInference.addObservedUrl('/api/987654311');
    expect(pathInference.getInferedPattern('/api/123456789')).toBe(
      '/api/123456789'
    );
  });
});

describe('with known paths', () => {
  let pathInference: PathInference;

  const knownPaths = [
    '/users/{username}/events/public',
    '/users',
    '/users/{username}',
    '/users/{username}/events',
    '/users/{username}/events/orgs/{org}',
    '/users/{username}/followers',
    '/users/{username}/following',
    '/users/{username}/following/{target_user}',
    '/users/{username}/gists',
    '/users/{username}/gpg_keys',
    '/users/{username}/gpg_keys/{key}',
    '/users/{username}/hovercard',
    '/users/{username}/installation',
    '/users/{username}/keys',
    '/users/{username}/keys',
    '/users/{username}/orgs',
    '/users/{username}/orgs',
    '/users/{username}/packages',
    '/users/{username}/packages/{package_type}/{package_name}',
  ];
  beforeEach(() => {
    pathInference = new PathInference();
    for (const url of knownPaths) {
      pathInference.addKnownPath(url);
    }
  });

  test('without observations', () => {
    expect(pathInference.getInferedPattern(`/users/auser/settings`)).toBe(
      `/users/{username}/settings`
    );
    expect(
      pathInference.getInferedPattern(`/organizations/opticdev/settings`)
    ).toBe(`/organizations/opticdev/settings`);
  });

  test('it respects existing known paths', () => {
    pathInference.addKnownPath('/users/friends');
    pathInference.addObservedUrl(`/users/friends/anotherfriend`);
    pathInference.addObservedUrl(`/users/friends/hello`);
    expect(pathInference.getInferedPattern(`/users/friends/myfriend`)).toBe(
      `/users/friends/{friend}`
    );
  });

  test('with different top level variables', () => {
    pathInference.addObservedUrl('/orders/3/products');
    pathInference.addObservedUrl('/orders/3');
    pathInference.addObservedUrl('/orders/3/tracking');
    pathInference.addObservedUrl('/users/m24-3343/addresses/1');
    pathInference.addObservedUrl('/users/n94-3343/addresses');
    pathInference.addObservedUrl('/users/n94-3343/addresses/4');
    pathInference.addObservedUrl('/health-check');
    pathInference.addObservedUrl('/rates/10005');
    expect(pathInference.getInferedPattern('/orders/3')).toBe(
      '/orders/{order}'
    );
    expect(pathInference.getInferedPattern('/orders/3/products')).toBe(
      '/orders/{order}/products'
    );
    expect(pathInference.getInferedPattern('/orders/3/tracking')).toBe(
      '/orders/{order}/tracking'
    );
    expect(pathInference.getInferedPattern('/users/m24-3343/addresses')).toBe(
      '/users/{username}/addresses'
    );
    expect(pathInference.getInferedPattern('/users/n94-3343/addresses/1')).toBe(
      '/users/{username}/addresses/{address}'
    );
    expect(pathInference.getInferedPattern('/health-check')).toBe(
      '/health-check'
    );
    expect(pathInference.getInferedPattern('/rates/10005')).toBe(
      '/rates/{rate}'
    );
  });

  test('collapsing a variable with constant siblings', () => {
    pathInference.addKnownPath('/projects');
    pathInference.addObservedUrl('/projects/my-project');
    pathInference.addObservedUrl('/projects/active');

    // Before adding, we expect this to be collapsed
    expect(pathInference.getInferedPattern('/projects/active')).toBe(
      '/projects/{project}'
    );
    // After adding, we expect this to be a constant
    pathInference.addKnownPath('/projects/active');
    expect(pathInference.getInferedPattern('/projects/active')).toBe(
      '/projects/active'
    );
    // We also expect other names to be constant
    expect(pathInference.getInferedPattern('/projects/inactive')).toBe(
      '/projects/inactive'
    );

    // But if we pass in a uuid or something variable-like we should be able to tell it is different
    expect(
      pathInference.getInferedPattern(
        '/projects/f6a55ab7-f30d-4738-a6b7-50edb7b10008'
      )
    ).toBe('/projects/{project}');
  });
});
