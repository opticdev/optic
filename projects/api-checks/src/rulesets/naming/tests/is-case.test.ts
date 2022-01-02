import { isCase } from '../is-case';
import { NameMustBe } from '../config';

describe('is case ', () => {
  const diverseExamples = [
    'kebab-case-for-fun',
    'camelCaseForFun',
    'PascalCaseForFun',
    'snake_case_for_fun',
    'technicallycamelcase',
    'with A Space',
    'Pascalwithoutfriends',
    'camelwithoutfriends',
    'snake',
    'kebabwithoutfriends',
    'some-kebab-someCamel',
    '',
    'RANDOM',
  ];

  function testWith(rule: NameMustBe) {
    return diverseExamples.map((example) => [example, isCase(example, rule)]);
  }

  it('param case matches correct examples', () => {
    expect(testWith(NameMustBe.paramCase)).toMatchSnapshot();
  });
  it('camel case matches correct examples', () => {
    expect(testWith(NameMustBe.camelCase)).toMatchSnapshot();
  });
  it('snake case matches correct examples', () => {
    expect(testWith(NameMustBe.snakeCase)).toMatchSnapshot();
  });
  it('pascal case matches correct examples', () => {
    expect(testWith(NameMustBe.pascalCase)).toMatchSnapshot();
  });
});
