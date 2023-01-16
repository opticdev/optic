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
): Promise<{ id: string } | null> {
  const opticUrl: string | null =
    specs.to.jsonLike[OPTIC_URL_KEY] ??
    specs.from.jsonLike[OPTIC_URL_KEY] ??
    null;
  const apiId: string | null = opticUrl && getApiFromOpticUrl(opticUrl);
  // We upload a spec if it is unchanged in git and there is an API id on the spec
  let baseSpecId: string | null = null;
  let headSpecId: string | null = null;
  if (specs.from.context && apiId) {
    const tags =
      specs.from.context.vcs === VCS.Git
        ? [`git:${specs.from.context.sha}`]
        : [];
    baseSpecId = await uploadSpec(apiId, {
      spec: specs.from,
      client: config.client,
      tags,
    });
  } else if (specs.from.isEmptySpec) {
    baseSpecId = EMPTY_SPEC_ID;
  }

  if (specs.to.context && apiId) {
    let tags: string[] = [];
    if (specs.to.context.vcs === VCS.Git) {
      const currentBranch = await Git.getCurrentBranchName();
      tags = [`git:${specs.to.context.sha}`, `git:${currentBranch}`];
    }
    headSpecId = await uploadSpec(apiId, {
      spec: specs.to,
      client: config.client,
      tags,
    });
  } else if (specs.to.isEmptySpec) {
    headSpecId = EMPTY_SPEC_ID;
  }

  if (baseSpecId && headSpecId && apiId) {
    const run = await uploadRun(apiId, {
      fromSpecId: baseSpecId,
      toSpecId: headSpecId,
      client: config.client,
      specResults,
    });
    return run;
  }
  return null;
}
