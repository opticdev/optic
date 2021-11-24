import React from 'react';
import { program as cli } from 'commander';
import path from 'path';
import { Box, render, Text } from 'ink';
import { ChangeView } from '../ui/change';
import { CodeBlock } from '../ui/code/code-block';

const examplesDir = path.resolve(__dirname, 'example-sessions');

const json = {
  owner: {
    login: 'opticdev',
    id: 34556970,
    node_id: 'MDEyOk9yZ2FuaXphdGlvbjM0NTU2OTcw',
    avatar_url: 'https://avatars.githubusercontent.com/u/34556970?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/opticdev',
    html_url: 'https://github.com/opticdev',
    followers_url: 'https://api.github.com/users/opticdev/followers',
    following_url:
      'https://api.github.com/users/opticdev/following{/other_user}',
    gists_url: 'https://api.github.com/users/opticdev/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/opticdev/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/opticdev/subscriptions',
    organizations_url: 'https://api.github.com/users/opticdev/orgs',
    repos_url: 'https://api.github.com/users/opticdev/repos',
    events_url: 'https://api.github.com/users/opticdev/events{/privacy}',
    received_events_url:
      'https://api.github.com/users/opticdev/received_events',
    type: 'Organization',
    site_admin: false,
  },
};

cli.action(async (options: { capture: string }) => {
  // render(<ChangeView />);
  render(
    <Box flexDirection="column">
      <CodeBlock
        render={{
          json,
          highlight: {
            trail: '/owner/login',
            wasMissing: false,
            highlight: 'green',
          },
        }}
      />
      <CodeBlock
        render={{
          json,
          highlight: {
            trail: '/owner/received_events_url',
            wasMissing: false,
            highlight: 'yellow',
          },
        }}
      />

      <CodeBlock
        render={{
          json,
          highlight: {
            trail: '/owner/created_at',
            wasMissing: true,
            highlight: 'red',
          },
        }}
      />
    </Box>
  );
});

cli.parse(process.argv);
