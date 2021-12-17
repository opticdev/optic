import { ApiCheckService } from '../../sdk/api-check-service';
import { ApiCheckDslContext } from '../../sdk/api-change-dsl';

export function breakingChanges() {
  const service = new ApiCheckService<ApiCheckDslContext>();

  service.useRules(require('./operations').rules);
  service.useRules(require('./properties').rules);

  return service;
}
