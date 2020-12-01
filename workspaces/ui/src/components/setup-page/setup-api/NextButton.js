import Button from '@material-ui/core/Button';
import { Link, Redirect } from 'react-router-dom';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import Countdown from 'react-countdown';
import { Typography } from '@material-ui/core';
import React from 'react';

export function NextButton({
  onClick,
  key,
  disabled,
  href,
  auto,
  to,
  children,
}) {
  return (
    <div
      style={{
        display: 'flex',
        marginTop: 22,
        alignItems: 'center',
      }}
    >
      <Button
        variant="contained"
        size="medium"
        href={href}
        component={Link}
        disabled={disabled}
        to={to}
        onClick={onClick}
        endIcon={<ArrowRightAltIcon fontSize="large" />}
        color="primary"
      >
        {children}
      </Button>
      {Boolean(auto && !disabled) && (
        <Countdown
          key={key}
          autoStart
          date={Date.now() + 5000}
          renderer={(props) => {
            if (props.seconds === 0) {
              if (to) {
                return <Redirect to={to} />;
              } else if (href) {
                window.location.href = href;
                return null;
              } else if (onClick) {
                onClick();
                return null;
              }
            }
            return (
              <Typography
                variant="subtitle2"
                style={{
                  color: '#727171',
                  marginLeft: 25,
                  fontWeight: 600,
                }}
              >
                Continuing in {props.seconds}...
              </Typography>
            );
          }}
        />
      )}
    </div>
  );
}
