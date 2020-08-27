import exp from 'constants';

export interface CheckAssertions {
  passed: boolean;
}

export interface CommandIsLongRunning extends CheckAssertions {
  command: string;
}

export interface ApiProcessStartsOnAssignedHost extends CheckAssertions {
  expectedHost: string;
}

export interface ApiProcessStartsOnAssignedPort extends CheckAssertions {
  expectedPort: string;
}

export interface ProxyCanStartAtInboundUrl extends CheckAssertions {
  hostname: string;
}

export interface ProxyTargetUrlResolves extends CheckAssertions {
  targetHostname: string;
}

//wrap up
export interface CheckAssertionsResult {
  passed: boolean;
  mode: string;
  taskName: string;
  task: {
    command?: string;
    inboundUrl?: string;
    targetUrl?: string;
  };
  recommended?: {
    commandIsLongRunning: CommandIsLongRunning;
    apiProcessStartsOnAssignedHost: ApiProcessStartsOnAssignedHost;
    apiProcessStartsOnAssignedPort: ApiProcessStartsOnAssignedPort;
    proxyCanStartAtInboundUrl: ProxyCanStartAtInboundUrl;
  };
  manual?: {
    proxyCanStartAtInboundUrl: ProxyCanStartAtInboundUrl;
    proxyTargetUrlResolves: ProxyTargetUrlResolves;
  };
}
