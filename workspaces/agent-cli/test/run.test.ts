import { expect, test } from '@oclif/test';

const validStartConfig = JSON.stringify({
  capture: { id: 'c7acd41a-1797-4bff-86a0-73d3c05c6bba' },
  agentToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcHRpY0NvbnRleHQiOnsiYWdlbnRHcm91cElkIjoiNzRkMTM0ZTUtMDZhMi00NDgyLWIzMTAtZGVlZDFmZWI0MGJkIiwiY2FwdHVyZUlkIjoiYzdhY2Q0MWEtMTc5Ny00YmZmLTg2YTAtNzNkM2MwNWM2YmJhIiwib3JnSWQiOiJkMzM0ZDQzOS0yYmY2LTQ5MjQtYTk5OS1iZmVkNTNjZTFmNjUifSwiaWF0IjoxNTkxMDQ2NDgwLCJhdWQiOiJvcHRpYy1iYWNrZW5kLXYxIiwiaXNzIjoiaHR0cHM6Ly91c2VvcHRpYy5jb20ifQ.IcD8no4evid0enfkXUX3kG6ZcW3APMsCtQgYbbf6DEc',
});

const invalidStartConfig = JSON.stringify({
  capture: { id: 'c7acd41a-1797-4bff-86a0-73d3c05c6bba' },
  agentToken: 'eyJ___badtoken',
});
const invalidStartConfig2 = JSON.stringify('{NOT EVEN JSON}');

describe('run', () => {
  test
    .stdout()
    .command([
      'run',
      `--command="printenv"`,
      `--listen=http://localhost:3500`,
      `--config=${invalidStartConfig}`,
    ])
    .it('Will start your API normally even with invalid token', (ctx) => {
      expect(ctx.stdout).to.include(
        'Optic monitoring token is missing. Starting your API normally'
      );
    });

  test
    .stdout()
    .command([
      'run',
      `--command="printenv"`,
      `--listen=http://localhost:3500`,
      `--config=${invalidStartConfig2}`,
    ])
    .it(
      'Will start your API normally even with invalid config string',
      (ctx) => {
        expect(ctx.stdout).to.include(
          'Optic monitoring token is missing. Starting your API normally'
        );
      }
    );
});
