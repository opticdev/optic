//helpers
import { CheckAssertions } from '@useoptic/analytics/lib/interfaces/ApiCheck';

export function failingAssertions(
  assertions: CheckAssertions[]
): CheckAssertions[] {
  return assertions.filter((i) => i && !i.passed);
}
