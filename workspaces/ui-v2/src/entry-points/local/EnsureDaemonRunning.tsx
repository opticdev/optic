import React, { FC, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { Client } from '@useoptic/cli-client';

import { FullPageLoader } from '<src>/components';
import * as SupportLinks from '<src>/constants/SupportLinks';

export const EnsureDaemonRunning: FC = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      const cliClient = new Client('/api');
      try {
        await cliClient.health();
        setLoading(false);
      } catch (e) {
        setError(true);
        setLoading(false);
      }
    })();
  }, []);

  return loading ? (
    <FullPageLoader title="loading" />
  ) : error ? (
    <CliDaemonUnreachableError />
  ) : (
    <>{children}</>
  );
};

const CliDaemonUnreachableError: FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.errorContainer}>
      <h2>Error reaching daemon</h2>
      <p>
        It appears the cli daemon is unreachable. This usually means that the
        daemon crashed and needs to be restarted.
      </p>
      <p>
        You can restart the daemon by running <code>api daemon:start</code> or
        rerunning <code>api start</code>.
      </p>
      <p>
        If this continues to happen, please reach out to{' '}
        <a href={SupportLinks.Contact('Optic App crash report')}>our team</a>{' '}
        for assistance. Further debug information can be found from our{' '}
        <a
          href="https://useoptic.com/reference/optic-cli/commands/debug"
          target="_blank"
          rel="noreferrer"
        >
          debugging instructions
        </a>
        .
      </p>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  errorContainer: {
    display: 'flex',
    margin: 'auto',
    flexDirection: 'column',
    maxWidth: 1000,
    width: '100%',
  },
}));
