import { SPEC_TAG_REGEXP } from '@useoptic/openapi-utilities';
import { logger } from '../logger';

export function getTagsFromOptions(tag?: string): string[] {
  let tagsToAdd: string[] = [];
  if (tag) {
    const tags = tag.split(',');
    const invalidTags = tags.filter((tag) => !SPEC_TAG_REGEXP.test(tag));
    if (invalidTags.length > 0) {
      logger.error(
        `The following tags were invalid: ${invalidTags.join(
          ', '
        )}. Tags must only include alphanumeric characters, dashes (-, _) or colons (:)`
      );
    }
    tagsToAdd.push(...tags);
  }

  return tagsToAdd;
}

export function getUniqueTags(tags: string[]): string[] {
  return [...new Set(tags)];
}
