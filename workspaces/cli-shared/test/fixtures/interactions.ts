import { IHttpInteraction as Interaction } from '@useoptic/domain-types';
import Fs from 'fs-extra';
import Path from 'path';

export async function* exampleInteractions(
  num = 10,
  path = Path.join(__dirname, 'example-interaction.json')
): AsyncIterable<Interaction> {
  const interaction = (await Fs.readJSON(path)) as Interaction;

  for (let i = 0; i < num; i++) {
    yield interaction;
  }
}
