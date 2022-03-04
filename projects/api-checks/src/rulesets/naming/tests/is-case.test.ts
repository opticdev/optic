import { isCase } from '../helpers/is-case';
import { NameMustBe } from '../helpers/config';

describe('isCase', () => {
  test('camelCase', () => {
    const passingCases = [
      'camelCaseForFun',
      'technicallycamelcase',
      'camelwithoutfriends',
      'camel1With2Numbers3',
    ];
    const failingCases = [
      '',
      'kebab-case-for-fun',
      'snake_case_for_fun',
      'PascalCaseForFun',
      'Pascalwithoutfriends',
      '1NotCamel',
      '1leadingNumber', // TBD is this camelCase????
    ];

    for (const passingCase of passingCases) {
      expect(isCase(passingCase, NameMustBe.camelCase)).toBe(true);
    }

    for (const failingCase of failingCases) {
      expect(isCase(failingCase, NameMustBe.camelCase)).toBe(false);
    }
  });

  test('Capital-Param-Case', () => {
    const passingCases = [
      'Accept',
      'Accept-Encoding',
      'Authorization',
      'Cache-Control',
      'Connection',
      'Content-Type',
      'Host',
      'Referer',
      'User-Agent'
    ];
    const failingCases = [
      '',
      'camelCaseForFun',
      'some-kebab-someCamel',
      'snake_case_for_fun',
      'lower-param-case',
    ];

    for (const passingCase of passingCases) {
      expect(isCase(passingCase, NameMustBe.capitalParamCase)).toBe(true);
    }

    for (const failingCase of failingCases) {
      expect(isCase(failingCase, NameMustBe.capitalParamCase)).toBe(false);
    }
  });

  test('param-case', () => {
    const passingCases = [
      'kebab-case-for-fun',
      'snake',
      'kebabwithoutfriends',
      'param1-wit2h-num3bers',
      '1param-with-leading-number',
    ];
    const failingCases = [
      '',
      'camelCaseForFun',
      'some-kebab-someCamel',
      'snake_case_for_fun',
    ];

    for (const passingCase of passingCases) {
      expect(isCase(passingCase, NameMustBe.paramCase)).toBe(true);
    }

    for (const failingCase of failingCases) {
      expect(isCase(failingCase, NameMustBe.paramCase)).toBe(false);
    }
  });

  test('snake-case', () => {
    const passingCases = [
      'snake_case_for_fun',
      'snake',
      'technicallycamelcase',
      'camelwithoutfriends',
      'sna1kes_with2_3numbers',
      '1sna1kes_with2_3numbers',
    ];
    const failingCases = [
      '',
      'kebab-case-for-fun',
      'camelCaseForFun',
      'some-kebab-someCamel',
      'RANDOM',
    ];

    for (const passingCase of passingCases) {
      expect(isCase(passingCase, NameMustBe.snakeCase)).toBe(true);
    }

    for (const failingCase of failingCases) {
      expect(isCase(failingCase, NameMustBe.snakeCase)).toBe(false);
    }
  });

  test('PascalCase', () => {
    const passingCases = [
      'PascalCase',
      'Pascalcase',
      'P1ascalWi12Nu3mbers',
      'A1PascalCase',
    ];
    const failingCases = [
      '',
      'kebab-case-for-fun',
      'camelCaseForFun',
      'camelwithoutfriends',
      'some-kebab-someCamel',
      'RANDOM',
      'snake_case_for_fun',
      'snake',
      'technicallycamelcase',
    ];

    for (const passingCase of passingCases) {
      expect(isCase(passingCase, NameMustBe.pascalCase)).toBe(true);
    }

    for (const failingCase of failingCases) {
      expect(isCase(failingCase, NameMustBe.pascalCase)).toBe(false);
    }
  });
});
