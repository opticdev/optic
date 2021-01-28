import { Typography } from '@material-ui/core';
import GitHubButton from 'react-github-btn';
import React from 'react';

export function GitHubStats(props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 25,
        ...props.style
      }}
    >
      <GitHubButton
        href="https://github.com/opticdev/optic"
        data-icon="octicon-star"
        data-size="large"
        data-show-count="true"
        aria-label="Star opticdev/optic on GitHub"
      >
        Star
      </GitHubButton>
      <Typography
        variant="caption"
        style={{
          paddingBottom: 5,
          paddingLeft: 10,
          marginTop: 1,
          color: '#6d757d',
          fontWeight: 100,
          fontSize: 14,
          fontFamily: 'Ubuntu Mono',
        }}
      >
        Open Source, Free, Developed in the Open
      </Typography>
    </div>
  );
}
