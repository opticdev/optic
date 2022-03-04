import { NameMustBe } from './config';

function regexForRule(nameRule: NameMustBe) {
  switch (nameRule) {
    case NameMustBe.camelCase:
      return /^[a-z][a-z0-9]*(?:[A-Z0-9][a-z0-9]+)*$/;
    case NameMustBe.capitalParamCase:
      return /^[A-Z0-9][a-z0-9]*(-[A-Z0-9][a-z0-9]*)*$/;
    case NameMustBe.paramCase:
      return /^[a-z0-9]+(-[a-z0-9]+)*$/;
    case NameMustBe.pascalCase:
      return /^[A-Z][a-z0-9]+(?:[A-Z0-9][a-z0-9]+)*$/;
    case NameMustBe.snakeCase:
      return /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
    default:
      return /(.*?)/;
  }
}

export function isCase(example: string, nameRule: NameMustBe): boolean {
  return regexForRule(nameRule).test(example);
}
