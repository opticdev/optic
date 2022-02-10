import { ApiCheckService } from '../../sdk/api-check-service';
import { ApiCheckDslContext } from '../../sdk/api-change-dsl';
import { NamingChecksConfig } from './helpers/config';

import requestHeaderRules from './request-header-names.rule';
import responseHeaderRules from './response-header-names.rule';
import requestPropertyRules from './request-property-names.rule';
import responsePropertyRules from './response-property-names.rule';
import queryNameRules from './request-query-names.rule';

export function namingRules(config: NamingChecksConfig) {
  const service = new ApiCheckService<ApiCheckDslContext>();

  if (config.requestHeaders)
    service.useRulesFrom(
      requestHeaderRules.runnerWithConfig(config.requestHeaders)
    );
  if (config.responseHeaders)
    service.useRulesFrom(
      responseHeaderRules.runnerWithConfig(config.responseHeaders)
    );
  if (config.requestProperties)
    service.useRulesFrom(
      requestPropertyRules.runnerWithConfig(config.requestProperties)
    );
  if (config.responseProperties)
    service.useRulesFrom(
      responsePropertyRules.runnerWithConfig(config.responseProperties)
    );
  if (config.queryParameters)
    service.useRulesFrom(
      queryNameRules.runnerWithConfig(config.queryParameters)
    );

  return service;
}
