export type BooleanAssertion<Context> =
  | boolean
  | ((value: boolean, context: Context) => void);

export function BooleanAssertionMarkdown(
  name: string,
  input: BooleanAssertion<any> | undefined
) {
  if (!input) return undefined;
  if (typeof input === 'boolean') {
    return `\`${name}\` must be ${input.toString()}`;
  } else if (`\`${name}\` passes function`) {
  }
}
