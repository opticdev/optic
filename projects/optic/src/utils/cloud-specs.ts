import stableStringify from 'json-stable-stringify';
import { CompareSpecResults } from '@useoptic/openapi-utilities';
import { OpticBackendClient } from '../client';
import { computeChecksum } from './checksum';
import { uploadFileToS3 } from './s3';
import { ParseResult } from './spec-loaders';
import { trackEvent } from '@useoptic/openapi-utilities/build/utilities/segment';

export const EMPTY_SPEC_ID = 'EMPTY';

export async function uploadSpec(
  apiId: string,
  opts: {
    spec: ParseResult;
    client: OpticBackendClient;
    tags: string[];
    orgId: string;
  }
): Promise<string> {
  const stableSpecString = stableStringify(opts.spec.jsonLike);
  const stableSourcemapString = stableStringify(opts.spec.sourcemap);
  const spec_checksum = computeChecksum(stableSpecString);
  const sourcemap_checksum = computeChecksum(stableSourcemapString);
  const result = await opts.client.prepareSpecUpload({
    api_id: apiId,
    spec_checksum,
    sourcemap_checksum,
  });
  if ('upload_id' in result) {
    await Promise.all([
      uploadFileToS3(result.spec_url, stableSpecString, {
        'x-amz-checksum-sha256': spec_checksum,
      }),
      uploadFileToS3(result.sourcemap_url, stableSourcemapString, {
        'x-amz-checksum-sha256': sourcemap_checksum,
      }),
    ]);

    const { id } = await opts.client.createSpec({
      upload_id: result.upload_id,
      api_id: apiId,
      tags: opts.tags,
    });
    trackEvent('spec.added', {
      apiId,
      orgId: opts.orgId,
      specId: id,
    });
    return id;
  } else {
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
    ci: boolean;
  }
) {
  const stableResultsString = stableStringify(opts.specResults);
  const checksum = computeChecksum(stableResultsString);
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
    ci: opts.ci,
  });
  trackEvent('run.added', {
    apiId,
    orgId: opts.orgId,
    runId: run.id,
  });

  return run;
}
