import Tap from 'tap';
import { createCliConfig } from '../../src';

Tap.test('config.createCliConfig', async (test) => {
  test.test(
    'can create a generic cli config given PackageJson and ProcessEnv',
    async (t) => {
      const packageJsonStable = {
        name: 'test-package',
        version: '1.2.4',
      };
      const packageJsonPrerelease = {
        name: 'test-package',
        version: '1.2.3-rc.4',
      };

      const envDevelopment = {
        OPTIC_DEVELOPMENT: 'yes',
      };

      t.matchSnapshot(createCliConfig(packageJsonStable, {}), 'basic output');
      t.matchSnapshot(
        createCliConfig(packageJsonStable, envDevelopment),
        'development env'
      );
      t.matchSnapshot(
        createCliConfig(packageJsonPrerelease, {}),
        'prerelease output'
      );
    }
  );
});
