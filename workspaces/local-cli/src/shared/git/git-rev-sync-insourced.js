// copied from https://github.com/kurttheviking/git-rev-sync-js/blob/master/index.js MIT Licensed

const childProcess = require('child_process');
const escapeStringRegexp = require('escape-string-regexp');
const fs = require('graceful-fs');
const path = require('path');
const shell = require('shelljs');

// eslint-disable-next-line no-prototype-builtins
const HAS_NATIVE_EXECSYNC = childProcess.hasOwnProperty('spawnSync');
const PATH_SEP = path.sep;
const RE_BRANCH = /^ref: refs\/heads\/(.*)\n/;

function _command(cmd, args) {
  let result;

  if (HAS_NATIVE_EXECSYNC) {
    result = childProcess.spawnSync(cmd, args);

    if (result.status !== 0) {
      throw new Error(
        '[git-rev-sync] failed to execute command: ' +
          result.stderr +
          '/' +
          result.error
      );
    }

    return result.stdout.toString('utf8').replace(/^\s+|\s+$/g, '');
  }

  result = shell.exec(cmd + ' ' + args.join(' '), { silent: true });

  if (result.code !== 0) {
    throw new Error(
      '[git-rev-sync] failed to execute command: ' + result.stdout
    );
  }

  return result.stdout.toString('utf8').replace(/^\s+|\s+$/g, '');
}

function _getGitDirectory(start) {
  if (start === undefined || start === null) {
    start = module.parent.filename;
  }

  if (typeof start === 'string') {
    start = start.split(PATH_SEP);
  }
  let gitRepoPath = start.join(PATH_SEP);
  let testPath = gitRepoPath;

  if (!testPath.length) {
    throw new Error('[git-rev-sync] no git repository found');
  }

  testPath = path.resolve(testPath, '.git');

  if (fs.existsSync(testPath)) {
    if (!fs.statSync(testPath).isDirectory()) {
      let parentRepoPath = fs
        .readFileSync(testPath, 'utf8')
        .trim()
        .split(' ')
        .pop();

      if (!path.isAbsolute(parentRepoPath)) {
        parentRepoPath = path.resolve(gitRepoPath, parentRepoPath);
      }

      if (fs.existsSync(parentRepoPath)) {
        return path.resolve(parentRepoPath);
      }

      throw new Error(
        '[git-rev-sync] could not find repository from path' + parentRepoPath
      );
    }

    return testPath;
  }

  start.pop();

  return _getGitDirectory(start);
}

function branch(dir) {
  let gitDir = _getGitDirectory(dir);

  let head = fs.readFileSync(path.resolve(gitDir, 'HEAD'), 'utf8');
  let b = head.match(RE_BRANCH);

  if (b) {
    return b[1];
  }

  return 'Detached: ' + head.trim();
}

function long(dir) {
  let b = branch(dir);

  if (/Detached: /.test(b)) {
    return b.substr(10);
  }

  let gitDir = _getGitDirectory(dir);
  let gitRootDir =
    gitDir.indexOf('.git/worktrees/') > 0
      ? gitDir.replace(/\.git\/worktrees\/.+$/, '.git')
      : gitDir;
  let refsFilePath = path.resolve(gitRootDir, 'refs', 'heads', b);
  let ref;

  if (fs.existsSync(refsFilePath)) {
    ref = fs.readFileSync(refsFilePath, 'utf8');
  } else {
    // If there isn't an entry in /refs/heads for this branch, it may be that
    // the ref is stored in the packfile (.git/packed-refs). Fall back to
    // looking up the hash here.
    let refToFind = ['refs', 'heads', b].join('/');
    let packfileContents = fs.readFileSync(
      path.resolve(gitDir, 'packed-refs'),
      'utf8'
    );
    let packfileRegex = new RegExp('(.*) ' + escapeStringRegexp(refToFind));
    ref = packfileRegex.exec(packfileContents)[1];
  }

  return ref.trim();
}

function short(dir, len) {
  return long(dir).substr(0, len || 7);
}

function message() {
  return _command('git', ['log', '-1', '--pretty=%B']);
}

function tag(markDirty) {
  if (markDirty) {
    return _command('git', [
      'describe',
      '--always',
      '--tag',
      '--dirty',
      '--abbrev=0',
    ]);
  }

  return _command('git', ['describe', '--always', '--tag', '--abbrev=0']);
}

function tagFirstParent(markDirty) {
  if (markDirty) {
    return _command('git', [
      'describe',
      '--always',
      '--tag',
      '--dirty',
      '--abbrev=0',
      '--first-parent',
    ]);
  }

  return _command('git', [
    'describe',
    '--always',
    '--tag',
    '--abbrev=0',
    '--first-parent',
  ]);
}

function hasUnstagedChanges() {
  let writeTree = _command('git', ['write-tree']);
  return _command('git', ['diff-index', writeTree, '--']).length > 0;
}

function isDirty() {
  return _command('git', ['diff-index', 'HEAD', '--']).length > 0;
}

function isTagDirty() {
  try {
    _command('git', ['describe', '--exact-match', '--tags']);
  } catch (e) {
    if (e.message.indexOf('no tag exactly matches')) {
      return true;
    }

    throw e;
  }
  return false;
}

function remoteUrl() {
  return _command('git', ['ls-remote', '--get-url']);
}

function date() {
  return new Date(
    _command('git', ['log', '--no-color', '-n', '1', '--pretty=format:"%ad"'])
  );
}

function count() {
  return parseInt(_command('git', ['rev-list', '--all', '--count']), 10);
}

function hooks() {
  return _command('git', ['rev-parse', '--git-path', 'hooks']);
}

function topLevel() {
  return _command('git', ['rev-parse', '--show-toplevel']);
}

function isInRepo() {
  try {
    _command('git', ['rev-parse', '--git-dir']);
    return true;
  } catch (e) {
    return false;
  }
}

function log() {
  throw new Error('not implemented');
}

module.exports = {
  branch,
  count,
  hooks,
  date,
  hasUnstagedChanges,
  isDirty,
  isTagDirty,
  log,
  long,
  message,
  remoteUrl,
  short,
  tag,
  tagFirstParent,
  topLevel,
  isInRepo,
};
