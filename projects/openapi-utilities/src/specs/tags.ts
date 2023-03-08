// Valid tags are alphanumeric and can include one `:`
export const SPEC_TAG_REGEXP = /^[a-zA-Z0-9-_\./]+(:[a-zA-Z0-9-_\./]+)?$/;

// Santize a git ref to a format that we accept https://git-scm.com/docs/git-check-ref-format#_description
export const sanitizeGitTag = (tag: string): string =>
  tag.replace(/[^a-zA-Z0-9-_/\.:]/g, '');
