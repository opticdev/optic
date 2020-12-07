import { IHttpInteraction as Interaction } from '@useoptic/domain-types';
import Fs from 'fs-extra';
import Path from 'path';

export async function* exampleInteractions(
  num = 10
): AsyncIterable<Interaction> {
  const interaction = (await Fs.readJSON(
    Path.join(__dirname, 'example-interaction.json')
  )) as Interaction;

  for (let i = 0; i < num; i++) {
    yield interaction;
  }
}
