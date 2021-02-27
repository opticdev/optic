import { Command } from '@oclif/command';
import { CaptureInteractionIterator } from '@useoptic/cli-shared/build/captures/avro/file-system/interaction-iterator';
import { getPathsRelativeToConfig, readApiConfig } from '@useoptic/cli-config';
import OS from 'os';
import cli from 'cli-ux';
import path from 'path';
import fs from 'fs-extra';
import { IgnoreFileHelper } from '@useoptic/cli-config/build/helpers/ignore-file-interface';
import { getOrCreateAnonId } from '@useoptic/cli-config/build/opticrc/optic-rc';
const pJson = require('../../../package.json');

export default class EndpointDelete extends Command {
  static description = 'delete an endpoint (the dirty WIP way).';
  static hidden: boolean = true;

  static args = [
    {
      name: 'method',
      description:
        'the pathID of the endpoint to delete /documentation/paths/{pathId}/methods/{method}',
      required: true,
    },
    {
      name: 'pathId',
      description:
        'the method of the endpoint to delete /documentation/paths/{pathId}/methods/{method}',
      required: true,
    },
  ];

  async run() {
    const { args } = this.parse(EndpointDelete);
    const { pathId, method } = args;

    const { specStorePath } = await getPathsRelativeToConfig();

    const specEvents: any[] = await fs.readJson(specStorePath);

    const collectedEdges: string[] = [];

    const filteredEventsPass1: any[] = [];
    //first pass, find all request / responses added
    specEvents.forEach((i) => {
      if (
        i['RequestAdded'] &&
        i.RequestAdded.pathId === pathId &&
        i.RequestAdded.httpMethod === method.toUpperCase()
      ) {
        collectedEdges.push(i.RequestAdded.requestId);
      } else if (
        i['ResponseAddedByPathAndMethod'] &&
        i.ResponseAddedByPathAndMethod.pathId === pathId &&
        i.ResponseAddedByPathAndMethod.httpMethod === method.toUpperCase()
      ) {
        collectedEdges.push(i.ResponseAddedByPathAndMethod.responseId);
      } else {
        filteredEventsPass1.push(i);
      }
    });

    const finalSpec = filteredEventsPass1.filter((i) => {
      const setsADeletedRequestBody =
        i['RequestBodySet'] &&
        collectedEdges.includes(i.RequestBodySet.requestId);
      const setsADeletedResponseBody =
        i['ResponseBodySet'] &&
        collectedEdges.includes(i.ResponseBodySet.responseId);

      return !(setsADeletedRequestBody || setsADeletedResponseBody);
    });

    await fs.writeFile(specStorePath, prepareEvents(finalSpec));

    console.log('spec updated! refresh the page');
  }
}

//changing soon so insourcing
function prepareEvents(events: any): string {
  return `[
${events.map((x: any) => JSON.stringify(x)).join('\n,')}
]`;
}
