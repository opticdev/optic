import fs from 'node:fs/promises';
import fsSync from 'fs';
import path from 'path';
import { captureStorage } from './capture-storage';
import { CapturedInteractions } from './streams/captured-interactions';
import { InputErrors } from '../reporters/feedback';
import { HarEntries } from './streams/sources/har';
import { trackWarning } from '../lib/sentry';
import * as AT from '../lib/async-tools';
import { PostmanCollectionEntries } from './streams/sources/postman';

export async function getInteractions(
  options: { har?: string; postman?: string },
  specPath: string,
  feedback: any
) {
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
      let harEntries = AT.unwrapOr(harEntryResults, (err) => {
        let message = `HAR entry skipped: ${err.message}`;
        console.warn(message); // warn, skip and keep going
        trackWarning(message, err);
      });
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
        let harEntries = AT.unwrapOr(harEntryResults, (err) => {
          let message = `HAR entry skipped: ${err.message}`;
          console.warn(message); // warn, skip and keep going
          trackWarning(message, err);
        });

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

  return AT.merge(...sources);
}
