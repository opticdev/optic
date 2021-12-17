import {
  ApiChangeDsl,
  ApiCheckService,
  DslConstructorInput,
  ApiCheckDslContext,
} from '@useoptic/api-checks';

export function breakingChanges() {
  const service = new ApiCheckService<ApiCheckDslContext>();

  const dslConstructor = (input: DslConstructorInput<ApiCheckDslContext>) => {
    return new ApiChangeDsl(
      input.nextFacts,
      input.changelog,
      input.currentJsonLike,
      input.nextJsonLike,
      input.context
    );
  };

  service.useDslWithNamedRules(dslConstructor, require('./operations').rules);
  service.useDslWithNamedRules(dslConstructor, require('./properties').rules);

  return service;
}
