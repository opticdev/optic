import ReactMarkdown from 'react-markdown';
import React from 'react';
import Typography from '@material-ui/core/Typography';

export function MarkdownRender({ source, style }) {
  return (
    <div style={style}>
      <ReactMarkdown source={source} renderers={{}} />
    </div>
  );
}
