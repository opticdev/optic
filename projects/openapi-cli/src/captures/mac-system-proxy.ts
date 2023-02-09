export function parseMacNetworkLine(line: string): {
  enabled: boolean;
  host: string;
  port: string;
  authenticated: boolean;
} {
  const match = line.match(
    /Enabled: (Yes|No)\nServer: ([:/\da-zA-Z.\-_]*)\nPort: (\d+)\nAuthenticated Proxy Enabled: (0|1)/
  );

  if (match) {
    const [_, enabled, host, port, authenticated] = match;

    return {
      enabled: enabled === 'Yes',
      host,
      port,
      authenticated: authenticated === 'Yes',
    };
  } else {
    throw new Error(`Unexpected proxy config returned from networksetup`);
  }
}
