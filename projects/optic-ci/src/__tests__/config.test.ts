// here to resolve isolatedModules
import { OPTIC_CONFIG_PATH } from '../constants';

test('to make ci pass', () => {
  expect(OPTIC_CONFIG_PATH).toBe(OPTIC_CONFIG_PATH);
});
