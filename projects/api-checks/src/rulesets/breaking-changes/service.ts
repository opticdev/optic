import { ApiCheckService } from '../../sdk/api-check-service';
import { ApiCheckDslContext } from '../../sdk/api-change-dsl';

export interface BreakingChecksConfig {}

export function breakingChangeRules(config: BreakingChecksConfig = {}) {
  const service = new ApiCheckService<ApiCheckDslContext>();

  // removing top level entities
  service.useRulesFrom(require('./operation-removed.rule').default.runner());
  service.useRulesFrom(require('./status-code-removed.rule').default.runner());

  // query params
  service.useRulesFrom(
    require('./query-param-optional-to-required-changed.rule').default.runner()
  );
  service.useRulesFrom(
    require('./query-param-required-added.rule').default.runner()
  );
  service.useRulesFrom(
    require('./query-param-type-changed.rule').default.runner()
  );

  // body parameters
  service.useRulesFrom(
    require('./request-body-property-optional-to-required-changed.rule').default.runner()
  );

  service.useRulesFrom(
    require('./request-body-property-required-added.rule').default.runner()
  );

  service.useRulesFrom(
    require('./request-body-property-type-changed.rule').default.runner()
  );

  service.useRulesFrom(
    require('./response-body-property-removed.rule').default.runner()
  );
  service.useRulesFrom(
    require('./response-body-property-required-to-optional-changed.rule').default.runner()
  );

  service.useRulesFrom(
    require('./response-body-property-type-changed.rule').default.runner()
  );

  return service;
}
