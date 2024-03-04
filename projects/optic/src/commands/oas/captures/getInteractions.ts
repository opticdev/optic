import fs from 'node:fs/promises';
import fsSync from 'fs';
import path from 'path';
import { captureStorage } from './capture-storage';
import { InputErrors } from '../reporters/feedback';
import * as AT from '../lib/async-tools';
import { FlatOpenAPIV3, FlatOpenAPIV3_1 } from '@useoptic/openapi-utilities';
import { CapturedInteractions } from '../../capture/sources/captured-interactions';
import { PostmanCollectionEntries } from '../../capture/sources/postman';
import { HarEntries } from '../../capture/sources/har';
import {
  createHostBaseMap,
  filterIgnoredInteractions,
  handleServerPathPrefix,
} from '../../capture/interactions/grouped-interactions';

export async function getInteractions(
  options: { har?: string; postman?: string },
  spec: FlatOpenAPIV3.Document | FlatOpenAPIV3_1.Document,
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

  return handleServerPathPrefix(
    filterIgnoredInteractions(AT.merge(...sources), spec),
    createHostBaseMap(spec)
  );
}
