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

//helpers
export function failingAssertions(
  assertions: CheckAssertions[]
): CheckAssertions[] {
  return assertions.filter((i) => i && !i.passed);
}
