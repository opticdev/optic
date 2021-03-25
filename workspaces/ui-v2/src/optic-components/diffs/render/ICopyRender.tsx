import React from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { UpdatedBlueBackground } from '../../theme';

export enum ICopyStyle {
  Plain,
  Code,
  Bold,
}
export interface ICopy {
  style: ICopyStyle;
  text: string;
}

export function plain(text: string): ICopy {
  return { text: text, style: ICopyStyle.Plain };
}
export function bold(text: string): ICopy {
  return { text: text, style: ICopyStyle.Bold };
}
export function code(text: string): ICopy {
  return { text: text.trim(), style: ICopyStyle.Code };
}

export function ICopyRender({
  copy,
  style,
  variant,
}: {
  style?: any;
  variant: string;
  copy: ICopy[];
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
      {copy.map((i, index) => {
        if (i.style === ICopyStyle.Plain) {
          return (
            <span key={index}>
              {
                <Typography
                  component="span"
                  variant={variant}
                  style={{
                    ...style,
                    fontWeight: 400,
                    whiteSpace: 'break-spaces',
                  }}
                >
                  {i.text}
                </Typography>
              }
            </span>
          );
        } else if (i.style === ICopyStyle.Bold) {
          return (
            <span key={index}>
              {
                <Typography
                  component="span"
                  variant={variant}
                  style={{
                    ...style,
                    fontWeight: 800,
                    whiteSpace: 'break-spaces',
                  }}
                >
                  {i.text}
                </Typography>
              }
            </span>
          );
        } else if (i.style === ICopyStyle.Code) {
          return (
            <Code
              variant={variant}
              key={index}
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {i.text}
            </Code>
          );
        } else {
          return null;
        }
      })}
    </div>
  );
}
export function ICopyRenderSpan({
  copy,
  style,
  variant,
}: {
  style?: any;
  variant: string;
  copy: ICopy[];
}) {
  return (
    <span style={{ display: 'flex', alignItems: 'baseline' }}>
      {copy.map((i, index) => {
        if (i.style === ICopyStyle.Plain) {
          return (
            <span key={index}>
              {
                <Typography
                  component="span"
                  variant={variant}
                  style={{ ...style, fontWeight: 200 }}
                >
                  {i.text}
                </Typography>
              }
            </span>
          );
        } else if (i.style === ICopyStyle.Code) {
          return (
            <Code variant={variant} key={index}>
              {i.text}
            </Code>
          );
        } else {
          return null;
        }
      })}
    </span>
  );
}

export function ICopyRenderMultiline({
  copy,
  style,
  variant,
}: {
  style?: any;
  variant: string;
  copy: ICopy[];
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
      {copy.map((i, index) => {
        if (i.style === ICopyStyle.Plain) {
          return (
            <div key={index}>
              {
                <Typography
                  component="span"
                  variant={variant}
                  style={{
                    ...style,
                    fontWeight: 200,
                    // marginLeft: index === 0 && 3,
                  }}
                >
                  {i.text}
                </Typography>
              }
            </div>
          );
        } else if (i.style === ICopyStyle.Code) {
          return (
            <div key={index}>
              <Code
                variant={variant}
                key={index}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {i.text}
              </Code>
            </div>
          );
        } else {
          return null;
        }
      })}
    </div>
  );
}

export const Code = ({
  children,
  style,
  variant,
}: {
  style?: any;
  variant: string;
  children: any;
}) => {
  const classes = codeStyles();
  return (
    <Typography
      component="span"
      variant={variant}
      className={classes.codeInline}
      style={style}
    >
      {children}
    </Typography>
  );
};

const codeStyles = makeStyles((theme) => ({
  codeInline: {
    padding: 3,
    paddingLeft: 4,
    marginLeft: 3,
    marginRight: 3,
    paddingRight: 4,
    fontWeight: 700,
    backgroundColor: UpdatedBlueBackground,
    fontFamily: 'Ubuntu Mono',
  },
}));
