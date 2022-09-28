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
