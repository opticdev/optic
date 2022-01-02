import { ApiCheckService } from '../../sdk/api-check-service';
import { ApiCheckDslContext } from '../../sdk/api-change-dsl';
import { NamingChecksConfig } from './config';
import { requestHeaderRules, responseHeaderRules } from './name-rules';

export function namingRules(config: NamingChecksConfig) {
  const service = new ApiCheckService<ApiCheckDslContext>();

  if (config.requestHeaders)
    service.useRules(requestHeaderRules(config.requestHeaders));
  if (config.responseHeaders)
    service.useRules(responseHeaderRules(config.responseHeaders));
  if (config.requestProperties)
    service.useRules(responseHeaderRules(config.requestProperties));
  if (config.responseProperties)
    service.useRules(responseHeaderRules(config.responseProperties));
  if (config.queryParameters)
    service.useRules(responseHeaderRules(config.queryParameters));

  return service;
}
