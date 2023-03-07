import { beforeAll, it, describe, expect } from '@jest/globals';
import { parseMacNetworkLine } from './mac-system-proxy';

describe('mac', () => {
  const macNetworkServiceLine =
    'Enabled: Yes\nServer: 127.0.0.1\nPort: 8000\nAuthenticated Proxy Enabled: 0';
  const macDisabledServiceLine =
    'Enabled: No\nServer: 127.0.0.1\nPort: 8000\nAuthenticated Proxy Enabled: 0';

  const macDisabledLineNoProxy =
    'Enabled: No\nServer: \nPort: 8000\nAuthenticated Proxy Enabled: 0';

  it('works when disabled', () => {
    expect(parseMacNetworkLine(macDisabledServiceLine)).toMatchInlineSnapshot(`
      {
        "authenticated": false,
        "enabled": false,
        "host": "127.0.0.1",
        "port": "8000",
      }
    `);
  });
  it('works when enabled', () => {
    expect(parseMacNetworkLine(macNetworkServiceLine)).toMatchInlineSnapshot(`
      {
        "authenticated": false,
        "enabled": true,
        "host": "127.0.0.1",
        "port": "8000",
      }
    `);
  });
  it('works when host is empty', () => {
    expect(parseMacNetworkLine(macDisabledLineNoProxy)).toMatchInlineSnapshot(`
      {
        "authenticated": false,
        "enabled": false,
        "host": "",
        "port": "8000",
      }
    `);
  });
});
