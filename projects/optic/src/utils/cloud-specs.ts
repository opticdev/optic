import stableStringify from 'json-stable-stringify';
import {
  CompareSpecResults,
  UserError,
  ApiCoverage,
} from '@useoptic/openapi-utilities';
import { OpticBackendClient } from '../client';
import { computeChecksumForAws } from './checksum';
import { downloadFileFromS3, uploadFileToS3 } from './s3';
import { ParseResult } from './spec-loaders';
import { trackEvent } from '@useoptic/openapi-utilities/build/utilities/segment';
import { logger } from '../logger';
import { NotFoundError } from '../client/errors';
import chalk from 'chalk';
import { createNullSpec, createNullSpecSourcemap } from './specs';
import { JsonSchemaSourcemap } from '@useoptic/openapi-io';
import { ConfigRuleset } from '../config';

export const EMPTY_SPEC_ID = 'EMPTY';

export async function downloadSpec(
  spec: { apiId: string; tag: string },
  opts: { client: OpticBackendClient }
): Promise<{
  jsonLike: ParseResult['jsonLike'];
  sourcemap: ParseResult['sourcemap'];
  spec: {
    id: string;
  };
}> {
  const response = await opts.client
    .getSpec(spec.apiId, spec.tag)
    .catch((e) => {
      if (e instanceof Error && /spec does not exist/i.test(e.message)) {
        return { id: EMPTY_SPEC_ID, specUrl: null, sourcemapUrl: null };
      }
      throw e;
    });

  if (response.id === EMPTY_SPEC_ID) {
    const spec = createNullSpec();
    const sourcemap = createNullSpecSourcemap(spec);

    return {
      jsonLike: spec,
      sourcemap,
      spec: {
        id: response.id,
      },
    };
  } else {
    // fetch from cloud
    const [specStr, sourcemapStr] = await Promise.all([
      downloadFileFromS3(response.specUrl!),
      downloadFileFromS3(response.sourcemapUrl!),
    ]);
    return {
      jsonLike: JSON.parse(specStr),
      sourcemap: JsonSchemaSourcemap.fromSerializedSourcemap(
        JSON.parse(sourcemapStr)
      ),
      spec: {
        id: response.id,
      },
    };
  }
}

export async function uploadSpec(
  apiId: string,
  opts: {
    spec: ParseResult;
    client: OpticBackendClient;
    tags: string[];
    orgId: string;
    // Sets spec_tag.effective_at to spec.effective_at instead of current date
    forward_effective_at_to_tags?: boolean;
  }
): Promise<string> {
  const stableSpecString = stableStringify(opts.spec.jsonLike);
  const stableSourcemapString = stableStringify(opts.spec.sourcemap);
  const spec_checksum = computeChecksumForAws(stableSpecString);
  const sourcemap_checksum = computeChecksumForAws(stableSourcemapString);
  let result: Awaited<ReturnType<typeof opts.client.prepareSpecUpload>>;
  const tags = opts.tags.filter((tag, ndx) => opts.tags.indexOf(tag) === ndx);

  try {
    result = await opts.client.prepareSpecUpload({
      api_id: apiId,
      spec_checksum,
      sourcemap_checksum,
    });
  } catch (e) {
    if (e instanceof NotFoundError && e.source === 'optic') {
      logger.debug(e);
      logger.error(chalk.red.bold('Error uploading spec to Optic'));
      logger.error(
        chalk.red(
          `This may be because your login credentials do not have access to the api specified in the x-optic-url. Check the x-optic-url in your spec, or try regenerate your credentials by running optic login.`
        )
      );
      throw new UserError();
    } else {
      throw e;
    }
  }

  if ('upload_id' in result) {
    await Promise.all([
      uploadFileToS3(result.spec_url, stableSpecString, {
        'x-amz-checksum-sha256': spec_checksum,
      }),
      uploadFileToS3(result.sourcemap_url, stableSourcemapString, {
        'x-amz-checksum-sha256': sourcemap_checksum,
      }),
    ]);

    let effective_at: Date | undefined = undefined;
    let git_name: string | undefined = undefined;
    let git_email: string | undefined = undefined;
    let commit_message: string | undefined = undefined;

    if (opts.spec.context?.vcs === 'git') {
      ({
        effective_at,
        name: git_name,
        email: git_email,
        message: commit_message,
      } = opts.spec.context);
    }

    const { id } = await opts.client.createSpec({
      upload_id: result.upload_id,
      api_id: apiId,
      tags: tags,
      effective_at,
      git_name,
      git_email,
      commit_message,
      forward_effective_at_to_tags: opts.forward_effective_at_to_tags,
    });
    trackEvent('spec.added', {
      apiId,
      orgId: opts.orgId,
      specId: id,
    });
    return id;
  } else {
    await opts.client.tagSpec(result.spec_id, tags);

    return result.spec_id;
  }
}

export async function uploadRun(
  apiId: string,
  opts: {
    fromSpecId: string;
    toSpecId: string;
    orgId: string;
    client: OpticBackendClient;
    specResults: CompareSpecResults;
    standard: ConfigRuleset[];
    ci: boolean;
  }
) {
  const stableResultsString = stableStringify(opts.specResults);
  const checksum = computeChecksumForAws(stableResultsString);
  const result = await opts.client.prepareRunUpload({
    api_id: apiId,
    checksum,
  });

  await uploadFileToS3(
    result.check_results_url,
    Buffer.from(stableResultsString),
    {
      'x-amz-checksum-sha256': checksum,
    }
  );

  const run = await opts.client.createRun({
    upload_id: result.upload_id,
    api_id: apiId,
    from_spec_id: opts.fromSpecId,
    to_spec_id: opts.toSpecId,
    ruleset: opts.standard,
    ci: opts.ci,
  });
  trackEvent('run.added', {
    apiId,
    orgId: opts.orgId,
    runId: run.id,
  });

  return run;
}

export async function uploadSpecVerification(
  specId: string,
  opts: {
    client: OpticBackendClient;
    verificationData: ApiCoverage;
    message?: string;
  }
) {
  const stableResultsString = stableStringify(opts.verificationData);
  const checksum = computeChecksumForAws(stableResultsString);

  const { upload_id, url } = await opts.client.prepareVerification(
    specId,
    checksum
  );

  await uploadFileToS3(url, Buffer.from(stableResultsString), {
    'x-amz-checksum-sha256': checksum,
  });

  const { id } = await opts.client.createVerification({
    spec_id: specId,
    upload_id,
    message: opts.message,
  });

  return id;
}
