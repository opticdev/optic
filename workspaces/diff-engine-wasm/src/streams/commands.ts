export type Command = { [key: string]: any };

export async function* intoJSONL(
  commands: AsyncIterable<Command>
): AsyncIterable<string> {
  for await (let command of commands) {
    yield `${JSON.stringify(command)}\n`;
  }
}
