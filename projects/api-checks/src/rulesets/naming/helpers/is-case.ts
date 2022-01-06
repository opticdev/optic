import { NameMustBe } from './config';

function regexForRule(nameRule: NameMustBe) {
  switch (nameRule) {
    case NameMustBe.camelCase:
      return /^[a-z]+(?:[A-Z][a-z]+)*$/;
    case NameMustBe.paramCase:
      return /^([a-z][a-z0-9]*)(-[a-z0-9]+)*$/;
    case NameMustBe.pascalCase:
      return /^[A-Z][a-z]+(?:[A-Z][a-z]+)*$/;
    case NameMustBe.snakeCase:
      return /^[a-z]+(?:_[a-z]+)*$/;
    default:
      return /(.*?)/;
  }
}

export function isCase(example: string, nameRule: NameMustBe): boolean {
  return regexForRule(nameRule).test(example);
}
