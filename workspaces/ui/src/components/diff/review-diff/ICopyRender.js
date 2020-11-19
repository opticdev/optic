import React from 'react';
import { Typography } from '@material-ui/core';
import { ICopyStyle } from '../../../engine/interfaces/interpretors';
import { makeStyles } from '@material-ui/core/styles';
import { UpdatedBlueBackground } from '../../../theme';

export function ICopyRender(props) {
  const { copy, style, variant } = props;
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
                    fontWeight: 200,
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
        }
      })}
    </div>
  );
}
export function ICopyRenderSpan(props) {
  const { copy, style, variant } = props;
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
        }
      })}
    </span>
  );
}

export function ICopyRenderMultiline(props) {
  const { copy, style, variant } = props;
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
            <div>
              <Code
                variant={variant}
                key={index}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {i.text}
              </Code>
            </div>
          );
        }
      })}
    </div>
  );
}

export const Code = (props) => {
  const classes = codeStyles();
  return (
    <Typography
      component="span"
      variant={props.variant}
      className={classes.codeInline}
      style={props.style}
    >
      {props.children}
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
