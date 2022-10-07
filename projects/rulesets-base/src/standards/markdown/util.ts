import { AttributeAssertions } from '../attribute/assertions';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export function bullets(...items: (string | undefined)[]): string {
  if (!items.length) return '';
  return (
    items
      .filter((i) => Boolean(i))
      .map((i) => `- ${i}`)
      .join('\n') + '\n'
  );
}

export function codeblock(code: string, lang: string): string {
  return `\`\`\`${lang}\n${code}\n\`\`\``;
}

export function indent(input: string, amount: number = 2): string {
  const spacer = ''.padStart(amount, ' ');
  return input
    .split('\n')
    .map((i) => `${spacer}${i}`)
    .join('\n');
}

export type MarkdownSequence = string[];

export const Markdown = {
  h1: (heading: string) => `# ${heading}\n`,
  h2: (heading: string) => `## ${heading}\n`,
  h3: (heading: string) => `### ${heading}\n`,
  p: (inline: string) => `\n${inline}\n`,
  bold: (inline: string) => `**${inline}**`,
  indent: (sequence: MarkdownSequence, amount: number = 2) =>
    indent(sequence.join('\n'), amount),
  bullets: (...items: (string | undefined)[]) => bullets(...items),
};

export function AttributeMustBlock(
  key: string,
  musts: string[],
  extendsSchema?: OpenAPIV3.SchemaObject
): string {
  const extendsSchemaText = extendsSchema
    ? indent(
        [
          '\n',
          'extends schema:\n',
          codeblock(JSON.stringify(extendsSchema, null, 2), 'json'),
          '\n',
        ].join(''),
        2
      )
    : '';

  if (musts.length === 1) {
    return `\`${key}\` - ${musts[0]}` + extendsSchemaText;
  } else {
    return `\`${key}\`\n${indent(bullets(...musts), 2)}` + extendsSchemaText;
  }
}

export function renderAttributes(input: {
  [key: string]: AttributeAssertions<any, any>;
}): string[] {
  const keys = Object.keys(input).sort();

  return keys.map((key) => {
    const rules = input[key]!;

    let extendSchema: OpenAPIV3.SchemaObject | undefined;

    if (Array.isArray(rules)) {
      rules.forEach((i) => {
        if ('always' in i && 'extendSchema' in i.always) {
          extendSchema = i.always.extendSchema;
        }
      });

      return (
        AttributeMustBlock(
          key,
          rules.map((i) => i.ruleName),
          extendSchema
        ) + '\n\n'
      );
    } else {
      if (!rules.ruleName) return '';
      if ('always' in rules && 'extendSchema' in rules.always) {
        extendSchema = rules.always.extendSchema;
      }

      return AttributeMustBlock(key, [rules.ruleName], extendSchema) + '\n\n';
    }
  });
}
