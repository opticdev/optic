import { Command } from 'commander';

import { createCommandFeedback, InputErrors } from './reporters/feedback';

import chalk from 'chalk';
import { readDeferencedSpec } from './specs';
import {
  addIfUndocumented,
  matchInteractions,
  parseAddOperations,
} from './diffing/document';
import Path from 'path';
import * as fs from 'fs-extra';
import { getInteractions } from './verify';
import { getApiFromOpticUrl } from '../../utils/cloud-urls';
import { OPTIC_URL_KEY } from '../../constants';
import { patchOperationsAsNeeded } from './diffing/patch';

type DocumentOptions = {
  all?: string;
  har?: string;
};

export function documentCommand(): Command {
  const command = new Command('update');
  const feedback = createCommandFeedback(command);

  command
    .description('patch OpenAPI spec to match captured traffic')
    .argument('<openapi-file>', 'an OpenAPI spec')
    .option('--har <har-file>', 'path to HttpArchive file (v1.2, v1.3)')
    .option('--all', 'patch all operations')
    .argument('[operations...]', 'operations in format "get /path/{id}"', [])
    .action(async (specPath, operations) => {
      const analytics: { event: string; properties: any }[] = [];
      const options: DocumentOptions = command.opts();

      const operationsToAdd = parseAddOperations(operations);
      if (operationsToAdd.err) {
        return feedback.inputError(
          'To document an operation you must use the format "get /path/{id}"...',
          InputErrors.DOCUMENT_OPERATION_FORMAT
        );
      }
      const isAddAll = Boolean(options.all);

      if (
        !isAddAll &&
        operationsToAdd.val &&
        operationsToAdd.val.length === 0
      ) {
        return feedback.inputError(
          `Please pass in operations to document.\nDocument all paths using the "--all" flag\nDocument individual paths by passing them as arguments i.e "get /users/{userId}"`,
          InputErrors.DOCUMENT_OPERATION_FORMAT
        );
      }

      const absoluteSpecPath = Path.resolve(specPath);
      if (!(await fs.pathExists(absoluteSpecPath))) {
        return await feedback.inputError(
          'OpenAPI specification file could not be found',
          InputErrors.SPEC_FILE_NOT_FOUND
        );
      }

      const specReadResult = await readDeferencedSpec(absoluteSpecPath);
      if (specReadResult.err) {
        return await feedback.inputError(
          `OpenAPI specification could not be fully resolved: ${specReadResult.val.message}`,
          InputErrors.SPEC_FILE_NOT_READABLE
        );
      }

      const opticUrlDetails = getApiFromOpticUrl(
        specReadResult.val.jsonLike[OPTIC_URL_KEY]
      );

      const makeInteractionsIterator = async () =>
        getInteractions(options, specPath, feedback);

      const { jsonLike: spec, sourcemap } = specReadResult.unwrap();

      feedback.notable('Documenting new operations...');

      let { observations } = matchInteractions(
        spec,
        await makeInteractionsIterator()
      );

      const documentResult = await addIfUndocumented(
        operationsToAdd.val,
        isAddAll,
        observations,
        await makeInteractionsIterator(),
        spec,
        sourcemap
      );

      if (documentResult.ok) {
        analytics.push({
          event: 'openapi.verify.document',
          properties: {
            allFlag: isAddAll,
            numberDocumented: documentResult.val.length,
          },
        });
        documentResult.val.map((operation) => {
          console.log(
            `  ${chalk.green('added')}  ${operation.method} ${
              operation.pathPattern
            }`
          );
        });
      }

      const {
        jsonLike: specAfterAdditions,
        sourcemap: sourcemapAfterAdditions,
      } = specReadResult.unwrap();

      const patchInteractions = await makeInteractionsIterator();
      const patchStats = await patchOperationsAsNeeded(
        patchInteractions,
        specAfterAdditions,
        sourcemapAfterAdditions,
        isAddAll,
        operationsToAdd.ok ? operationsToAdd.val : []
      );

      if (!opticUrlDetails) {
        console.log('');
        console.log(
          `Share a link to documentation with your team (${chalk.bold(
            `optic api add ${specPath})`
          )}`
        );
      }
    });
  return command;
}
