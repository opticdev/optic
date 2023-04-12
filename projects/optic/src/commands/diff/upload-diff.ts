import ora from 'ora';
import { OpticCliConfig, VCS } from '../../config';
import { OPTIC_URL_KEY } from '../../constants';
import {
  getApiFromOpticUrl,
  getRunUrl,
  getSpecUrl,
} from '../../utils/cloud-urls';
import { ParseResult } from '../../utils/spec-loaders';
import { EMPTY_SPEC_ID, uploadRun, uploadSpec } from '../../utils/cloud-specs';
import * as Git from '../../utils/git-utils';
import { logger } from '../../logger';
import { sanitizeGitTag } from '@useoptic/openapi-utilities';
import { getTagsFromOptions, getUniqueTags } from '../../utils/tags';

export async function uploadDiff(
  specs: { from: ParseResult; to: ParseResult },
  specResults: Parameters<typeof uploadRun>['1']['specResults'],
  config: OpticCliConfig,
  options: {
    headTag?: string;
  } = {}
): Promise<{
  baseSpecUrl: string | null;
  headSpecUrl: string | null;
  changelogUrl: string;
} | null> {
  const showSpinner = logger.getLevel() !== 5;
  const spinner = showSpinner
    ? ora({ text: `Uploading diff...`, color: 'blue' })
    : null;

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
      orgId: specDetails.orgId,
    });
  } else if (specs.from.isEmptySpec) {
    baseSpecId = EMPTY_SPEC_ID;
  }

  if (specs.to.context && specDetails) {
    let tags: string[] = [];
    const tagsFromOptions = getTagsFromOptions(options.headTag);
    tags.push(...tagsFromOptions);
    if (specs.to.context.vcs === VCS.Git) {
      tags.push(`git:${specs.to.context.sha}`);
      // If no gitbranch is set, try to add own git branch
      if (!tagsFromOptions.some((tag) => /^gitbranch\:/.test(tag))) {
        const currentBranch = await Git.getCurrentBranchName();
        if (currentBranch !== 'HEAD') {
          tags.push(sanitizeGitTag(`gitbranch:${currentBranch}`));
        } else {
          logger.warn(
            `Warning: current branch was detected as 'HEAD'. This usually means the git is running against a detached HEAD and Optic will not be able to add gitbranch tags.`
          );
          logger.warn(
            'You can fix this by manually adding the `gitbranch:` by adding `--head-tag gitbranch:current-branch`'
          );
        }
      }
    }

    tags = getUniqueTags(tags);
    headSpecId = await uploadSpec(specDetails.apiId, {
      spec: specs.to,
      client: config.client,
      tags,
      orgId: specDetails.orgId,
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
      orgId: specDetails.orgId,
      ci: config.isInCi,
    });

    const changelogUrl = getRunUrl(
      config.client.getWebBase(),
      specDetails.orgId,
      specDetails.apiId,
      run.id
    );
    spinner?.succeed(`Uploaded results of diff to ${changelogUrl}`);

    return {
      changelogUrl,
      headSpecUrl:
        headSpecId === EMPTY_SPEC_ID
          ? null
          : getSpecUrl(
              config.client.getWebBase(),
              specDetails.orgId,
              specDetails.apiId,
              headSpecId
            ),
      baseSpecUrl:
        baseSpecId === EMPTY_SPEC_ID
          ? null
          : getSpecUrl(
              config.client.getWebBase(),
              specDetails.orgId,
              specDetails.apiId,
              baseSpecId
            ),
    };
  } else {
    const reason = !specDetails
      ? 'no x-optic-url was set on the spec file'
      : config.vcs?.type === VCS.Git
      ? 'there are uncommitted changes in your working directory'
      : 'the current working directory is not a git repo';
    spinner?.warn(`Not uploading diff results because ${reason}`);
  }
  return null;
}
