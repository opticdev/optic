import { sanitizeGitTag } from '@useoptic/openapi-utilities';
import { OpticCliConfig, VCS } from '../../../config';
import { uploadSpec, uploadSpecVerification } from '../../../utils/cloud-specs';
import * as Git from '../../../utils/git-utils';
import { ParseResult } from '../../../utils/spec-loaders';
import { ApiCoverageCounter } from '../coverage/api-coverage';
import { getSpecUrl } from '../../../utils/cloud-urls';

export async function uploadCoverage(
  spec: ParseResult,
  coverage: ApiCoverageCounter,
  { orgId, apiId }: { orgId: string; apiId: string },
  config: OpticCliConfig
) {
  const tags: string[] = [];
  let branchTag: string | undefined = undefined;
  if (config.vcs?.type === VCS.Git) {
    tags.push(`git:${config.vcs.sha}`);
    const currentBranch = await Git.getCurrentBranchName();
    branchTag = sanitizeGitTag(`gitbranch:${currentBranch}`);
    tags.push(branchTag);
  }
  const specId = await uploadSpec(apiId, {
    spec: spec,
    client: config.client,
    tags,
    orgId,
  });

  await uploadSpecVerification(specId, {
    client: config.client,
    verificationData: coverage.coverage,
  });

  const specUrl = getSpecUrl(config.client.getWebBase(), orgId, apiId, specId);

  return { specUrl, branchTag };
}
