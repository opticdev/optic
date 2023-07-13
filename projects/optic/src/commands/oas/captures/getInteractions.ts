import fs from 'node:fs/promises';
import fsSync from 'fs';
import path from 'path';
import { captureStorage } from './capture-storage';
import { CapturedInteractions } from '../../capture/interactions/captured-interactions';
import { InputErrors } from '../reporters/feedback';
import { HarEntries } from './streams/sources/har';
import * as AT from '../lib/async-tools';
import { PostmanCollectionEntries } from './streams/sources/postman';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

async function* handleServerPathPrefix(
  interactions: CapturedInteractions,
  spec: OpenAPIV3.Document
): CapturedInteractions {
  const hostBaseMap: { [key: string]: string } = {};

  spec.servers?.forEach((server) => {
    try {
      // add absolute in case url is relative (valid in OpenAPI, ignored when absolute)
      const parsed = new URL(server.url);

      const pathName = parsed.pathname;
      // remove trailing slash
      if (pathName.endsWith('/') && pathName.length > 1) {
        hostBaseMap[parsed.host] = pathName.substring(0, pathName.length - 1);
      } else {
        hostBaseMap[parsed.host] = pathName;
      }
    } catch (e) {}
  });

  for await (const interaction of interactions) {
    const host = interaction.request.host;
    if (hostBaseMap[host] && hostBaseMap[host] !== '/') {
      const base = hostBaseMap[host];
      if (interaction.request.path.startsWith(base)) {
        const adjustedPath =
          interaction.request.path === base
            ? '/'
            : interaction.request.path.replace(base, '');
        yield {
          ...interaction,
          request: {
            ...interaction.request,
            path: adjustedPath,
          },
        };
      } else {
        // Otherwise this is a request we should ignore since it doesn't match the base path for the hostBaseMap
        continue;
      }
    } else {
      yield interaction;
    }
  }
}

export async function getInteractions(
  options: { har?: string; postman?: string },
  spec: OpenAPIV3.Document,
  specPath: string,
  feedback: any
): Promise<CapturedInteractions> {
  const sources: CapturedInteractions[] = [];

  const { trafficDirectory } = await captureStorage(specPath);

  const captureDirectoryContents = (await fs.readdir(trafficDirectory)).sort();

  // check
  if (options.har) {
    // override with a har
    let absoluteHarPath = path.resolve(options.har);
    if (!fsSync.existsSync(absoluteHarPath)) {
      return await feedback.inputError(
        'Provided HAR path is invalid',
        InputErrors.HAR_FILE_NOT_FOUND
      );
    }
    const isDir = fsSync.lstatSync(absoluteHarPath).isDirectory();
    const harPaths = isDir
      ? fsSync
          .readdirSync(absoluteHarPath)
          .filter((filePath) => path.extname(filePath).toLowerCase() === '.har')
          .map((filePath) => path.join(absoluteHarPath, filePath))
      : [absoluteHarPath];

    for (const path of harPaths) {
      let harFile = fsSync.createReadStream(path);
      let harEntryResults = HarEntries.fromReadable(harFile);
      let harEntries = AT.unwrapOr(harEntryResults, (err) => {});
      sources.push(CapturedInteractions.fromHarEntries(harEntries));
    }
  } else if (options.postman) {
    const absolutePath = path.resolve(options.postman);
    if (!fsSync.existsSync(absolutePath)) {
      return await feedback.inputError(
        'Postman collection file could not be found at given path',
        InputErrors.POSTMAN_FILE_NOT_FOUND
      );
    }
    let collectionFile = fsSync.createReadStream(absolutePath);
    let postmanEntryResults =
      PostmanCollectionEntries.fromReadable(collectionFile);
    let postmanEntries = AT.unwrapOr(postmanEntryResults, (err) => {
      let message = `Postman collection entry skipped: ${err.message}`;
      console.warn(message); // warn, skip and keep going
    });
    sources.push(CapturedInteractions.fromPostmanCollection(postmanEntries));
  } else {
    // default is capture directory
    captureDirectoryContents.forEach((potentialCapture) => {
      // completed captures only
      if (potentialCapture.endsWith('.har')) {
        let harFile = fsSync.createReadStream(
          path.join(trafficDirectory, potentialCapture)
        );
        let harEntryResults = HarEntries.fromReadable(harFile);
        let harEntries = AT.unwrapOr(harEntryResults, (err) => {});

        sources.push(CapturedInteractions.fromHarEntries(harEntries));
      }
    });
  }

  if (sources.length < 1) {
    return await feedback.inputError(
      'no traffic captured for this OpenAPI spec. Run "oas capture" command',
      InputErrors.CAPTURE_METHOD_MISSING
    );
  }

  return handleServerPathPrefix(AT.merge(...sources), spec);
}
