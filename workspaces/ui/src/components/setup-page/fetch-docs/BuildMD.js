import ReactMarkdown from 'react-markdown';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Collapse } from '@material-ui/core';
import { Code, CodeBlock } from '../setup-api/CodeBlock';

export const setupTextHeader = () =>
  `**Update your Code to use the \`$OPTIC_API_PORT\`**`;
export function setupText(data) {
  return `${data.preamble}\n\n${buildCodeBlock(
    data.before,
    data.language
  )}\n\n${buildCodeBlock(data.after, data.language)}`.trim();
}

export function buildCodeBlock(source, lang) {
  return `\n\`\`\`${lang}\n${source}\n\`\`\`\n`;
}

export function MarkdownRender({ source, style }) {
  return (
    <div style={style}>
      <ReactMarkdown
        source={source}
        renderers={{
          heading: ({ level, children }) => (
            <Typography
              variant={`h${level}`}
              style={{ fontWeight: 300, marginBottom: 3 }}
            >
              {children}
            </Typography>
          ),
          inlineCode: ({ children }) => <Code>{children}</Code>,
          code: (data) => {
            return (
              <CodeBlock
                lang={data.language}
                code={data.value}
                style={{ marginRight: 15, marginBottom: 15 }}
              />
            );
          },
          paragraph: ({ children }) => (
            <Typography
              variant="body1"
              style={{
                fontWeight: 300,
                whiteSpace: 'pre-line',
              }}
            >
              {children}
            </Typography>
          ),
        }}
      />
    </div>
  );
}
