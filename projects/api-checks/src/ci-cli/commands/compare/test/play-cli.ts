import { ApiCheckService } from '../../../../sdk/api-check-service';
import { makeCiCli } from '../../../../ci-cli/make-cli';
import path from 'path';
const checker: ApiCheckService<any> = new ApiCheckService<any>();

const cli = makeCiCli('play-thing', checker);
const [, , ...args] = process.argv;
cli.parse([
  '',
  '',
  'compare',
  `--from=${path.join(__dirname, 'inputs', 'v0.json')}`,
  `--to=${path.join(__dirname, 'inputs', 'v1.json')}`,
  `--context="{}"`,
  // `--github-annotations`,
  ...args,
]);
