export type BooleanAssertion<Context> =
  | boolean
  | ((value: boolean, context: Context) => void);
