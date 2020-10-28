import React from 'react';
import { Typography } from '@material-ui/core';
import { ICopyStyle } from '../../../engine/interfaces/interpretors';
import { makeStyles } from '@material-ui/core/styles';
import { UpdatedBlueBackground } from '../../../theme';

export function ICopyRender(props) {
  const { copy, style, variant } = props;
  return (
    <div style={{ display: 'flex', alignItems: 'baseline' }}>
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
