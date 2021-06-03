export type HttpInteraction = any; // TODO: define a strong type

export async function* intoJSONL(
  interactions: AsyncIterable<HttpInteraction>
): AsyncIterable<string> {
  for await (let interaction of interactions) {
    yield `${JSON.stringify(interaction)}\n`;
  }
}
