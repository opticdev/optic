import { OpticCliConfig, VCS } from '../../config';
import { OPTIC_URL_KEY } from '../../constants';
import { getApiFromOpticUrl } from '../../utils/cloud-urls';
import { ParseResult } from '../../utils/spec-loaders';
import { EMPTY_SPEC_ID, uploadRun, uploadSpec } from '../../utils/cloud-specs';
import * as Git from '../../utils/git-utils';

export async function uploadDiff(
  specs: { from: ParseResult; to: ParseResult },
  specResults: Parameters<typeof uploadRun>['1']['specResults'],
  config: OpticCliConfig
): Promise<{ runId: string; apiId: string; orgId: string } | null> {
  const opticUrl: string | null =
    specs.to.jsonLike[OPTIC_URL_KEY] ??
    specs.from.jsonLike[OPTIC_URL_KEY] ??
    null;
  const specDetails = opticUrl ? getApiFromOpticUrl(opticUrl) : null;
  // We upload a spec if it is unchanged in git and there is an API id on the spec
  let baseSpecId: string | null = null;
  let headSpecId: string | null = null;
  if (specs.from.context && specDetails) {
    const tags =
      specs.from.context.vcs === VCS.Git
        ? [`git:${specs.from.context.sha}`]
        : [];
    baseSpecId = await uploadSpec(specDetails.apiId, {
      spec: specs.from,
      client: config.client,
      tags,
    });
  } else if (specs.from.isEmptySpec) {
    baseSpecId = EMPTY_SPEC_ID;
  }

  if (specs.to.context && specDetails) {
    let tags: string[] = [];
    if (specs.to.context.vcs === VCS.Git) {
      const currentBranch = await Git.getCurrentBranchName();
      tags = [`git:${specs.to.context.sha}`, `gitbranch:${currentBranch}`];
    }
    headSpecId = await uploadSpec(specDetails.apiId, {
      spec: specs.to,
      client: config.client,
      tags,
    });
  } else if (specs.to.isEmptySpec) {
    headSpecId = EMPTY_SPEC_ID;
  }

  if (baseSpecId && headSpecId && specDetails) {
    const run = await uploadRun(specDetails.apiId, {
      fromSpecId: baseSpecId,
      toSpecId: headSpecId,
      client: config.client,
      specResults,
    });
    return {
      apiId: specDetails.apiId,
      runId: run.id,
      orgId: specDetails.orgId,
    };
  }
  return null;
}
