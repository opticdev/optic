export type ErrorMessageInput<Data> = string | ((d: Data) => string);
export function ErrorMessage<Data>(
  input: ErrorMessageInput<Data>
): (Data) => string {
  if (typeof input === 'string') {
    return (data: Data) => input;
  } else {
    return (data) => {
      try {
        return input(data);
      } catch (e: any) {
        return 'rule eval issue: ' + e.message;
      }
    };
  }
}
