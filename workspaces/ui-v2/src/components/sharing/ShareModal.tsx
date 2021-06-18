import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  makeStyles,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import CopyIcon from '@material-ui/icons/FileCopy';
import { useAuth0 } from '@auth0/auth0-react';
import { useAsyncMemo } from 'use-async-memo';
import { ShareTarget } from './ShareButton';
import { useAppSelector } from '<src>/store';
import logoSvg from '<src>/constants/LogoSvg';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
  },
  item: {
    marginBottom: theme.spacing(2),
    flex: 1,
  },
  logoMarkdownContainer: {
    overflow: 'scroll',
    backgroundColor: 'rgba(27, 31, 35, 0.05)',
    color: 'rgb(36, 41, 46)',
    padding: theme.spacing(1),
  },
}));

function generateBadgeUrl({ endpointCount }: { endpointCount: number }) {
  const params = {
    label: 'API Docs',
    message: `${endpointCount} Endpoints`,
    style: 'flat',
    color: 'rgb(43,123,209)',
    logo: logoSvg,
  };

  const queryParams = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

  return `https://img.shields.io/static/v1?${queryParams}`;
}

function generateBadgeMarkdown({
  endpointCount,
  shareUrl,
}: {
  endpointCount: number;
  shareUrl: string;
}) {
  return `[![API Docs: ${endpointCount} Endpoints](${generateBadgeUrl({
    endpointCount,
  })})](${shareUrl})`;
}

export const ShareModal: React.FC<{
  share: (intent: ShareTarget) => Promise<string>;
}> = (props) => {
  const styles = useStyles(props);

  const { isAuthenticated, isLoading, loginWithPopup } = useAuth0();

  const endpointCount = useAppSelector(
    (state) => state.endpoints.results?.data!.length || 0
  );

  const [shareType, setShareType] = useState<ShareTarget | null>(null);

  let inputRef = useRef<HTMLInputElement>();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      let timeout = setTimeout(() => setCopied(false), 7500);
      return () => clearTimeout(timeout);
    }
  }, [copied, setCopied]);

  const copy = useCallback(() => {
    const input = inputRef.current;
    if (input) {
      input.focus();
      input.select();
      document.execCommand('copy');
      setCopied(true);
    }
  }, [inputRef, setCopied]);

  // Call share when authenticated and you set a shareType
  const shareUrl = useAsyncMemo(async () => {
    if (isAuthenticated && shareType !== null) {
      return props.share(shareType);
    }
  }, [isAuthenticated, shareType, props.share]);

  if (shareType === null) {
    return (
      <div className={styles.root}>
        <div className={styles.item}>
          <Typography variant="h5" color="textPrimary">
            Share Spec With...
          </Typography>
        </div>
        <div className={styles.item}>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={() => setShareType(ShareTarget.TEAM)}
          >
            Team
          </Button>
        </div>
        <div className={styles.item}>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={() => setShareType(ShareTarget.CUSTOMER)}
          >
            Customer
          </Button>
        </div>
      </div>
    );
  } else if (!isAuthenticated) {
    return (
      <div className={styles.root}>
        <div className={styles.item}>
          <Typography variant="h5" color="textPrimary">
            Log in to generate an API docs link to share
          </Typography>
        </div>
        <div className={styles.item}>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            disabled={isLoading}
            onClick={loginWithPopup}
          >
            {isLoading ? <CircularProgress size={18} /> : 'Log in'}
          </Button>
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.root}>
        <div className={styles.item}>
          <Typography variant="h5" color="textPrimary">
            Share with your{' '}
            {shareType === ShareTarget.TEAM ? 'team' : 'customer'}
          </Typography>
        </div>
        {shareUrl ? (
          <>
            <div className={styles.item}>
              <TextField
                fullWidth
                value={shareUrl}
                inputRef={inputRef}
                variant="outlined"
                InputProps={{
                  style: { fontSize: 14 },
                  readOnly: true,
                  endAdornment: (
                    <div style={{ paddingLeft: 10, marginLeft: 4 }}>
                      <IconButton
                        onClick={copy}
                        style={{ backgroundColor: 'transparent' }}
                      >
                        <Tooltip
                          arrow
                          title={copied ? 'Link copied' : 'Copy to clipboard'}
                        >
                          <CopyIcon />
                        </Tooltip>
                      </IconButton>
                    </div>
                  ),
                }}
              />
            </div>
            <div className={styles.item}>
              <Typography variant="h6" color="textSecondary">
                Embed badge
              </Typography>
            </div>
            <div className={styles.item}>
              <a href={shareUrl}>
                {' '}
                <img alt="badge" src={generateBadgeUrl({ endpointCount })} />
              </a>
              <div className={styles.logoMarkdownContainer}>
                <code style={{ display: 'block' }}>
                  {generateBadgeMarkdown({ endpointCount, shareUrl })}
                </code>
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </div>
        )}
      </div>
    );
  }
};
