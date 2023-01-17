export function getDefaultRulesetConfig(rulesetName: string): any {
  if (rulesetName === 'breaking-changes') {
    return {};
  } else if (rulesetName === 'naming') {
    return {
      required_on: 'added',
      requestHeaders: 'snake_case',
      queryParameters: 'snake_case',
      responseHeaders: 'snake_case',
      cookieParameters: 'snake_case',
      pathComponents: 'snake_case',
      properties: 'snake_case',
    };
  } else if (rulesetName === 'examples') {
    return {
      require_request_examples: true,
      require_response_examples: true,
      require_parameter_examples: true,
      required_on: 'always',
    };
  }

  return {};
}
