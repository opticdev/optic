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
    // Took https://github.com/opticdev/optic/blob/develop/website/static/img/logo-bare.svg
    // Ran it through https://jakearchibald.github.io/svgomg/
    // base64 encoded it (on macos, you can do: `pbpaste | base64 | pbcopy` to quickly base64 encode whatever is in your paste buffer)
    // prepend with `data:image/svg+xml;base64,`
    logo:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTM0IiBoZWlnaHQ9IjEzNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGRlZnM+PGxpbmVhckdyYWRpZW50IHgxPSI1MCUiIHkxPSItMTQuMyUiIHgyPSI1MCUiIHkyPSIxMDAlIiBpZD0iYyI+PHN0b3Agc3RvcC1jb2xvcj0iI0ZGRiIgb2Zmc2V0PSIwJSIvPjxzdG9wIHN0b3AtY29sb3I9IiNGNEY0RjQiIG9mZnNldD0iMTAwJSIvPjwvbGluZWFyR3JhZGllbnQ+PGZpbHRlciB4PSItNS42JSIgeT0iLTQlIiB3aWR0aD0iMTExLjElIiBoZWlnaHQ9IjExMS4xJSIgZmlsdGVyVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiBpZD0iYSI+PGZlT2Zmc2V0IGR5PSIyIiBpbj0iU291cmNlQWxwaGEiIHJlc3VsdD0ic2hhZG93T2Zmc2V0T3V0ZXIxIi8+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMiIgaW49InNoYWRvd09mZnNldE91dGVyMSIgcmVzdWx0PSJzaGFkb3dCbHVyT3V0ZXIxIi8+PGZlQ29sb3JNYXRyaXggdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwLjUgMCIgaW49InNoYWRvd0JsdXJPdXRlcjEiLz48L2ZpbHRlcj48Y2lyY2xlIGlkPSJiIiBjeD0iNjMiIGN5PSI2MyIgcj0iNjMiLz48L2RlZnM+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48ZyBmaWxsLXJ1bGU9Im5vbnplcm8iIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQgMikiPjx1c2UgZmlsbD0iIzAwMCIgZmlsdGVyPSJ1cmwoI2EpIiB4bGluazpocmVmPSIjYiIvPjx1c2UgZmlsbD0idXJsKCNjKSIgeGxpbms6aHJlZj0iI2IiLz48L2c+PHBhdGggZD0iTTkwIDM1YTM4IDM4IDAgMDAtNDYgMG0yOCA2OGEzOCAzOCAwIDAwMzMtMzhjMC04LTMtMTYtNy0yMm0tMzYgNjBhMzggMzggMCAwMS0zMy0zOGMwLTggMy0xNiA3LTIyIiBzdHJva2U9IiMzNDNCRTUiIHN0cm9rZS13aWR0aD0iNC43IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNNTEgODVhMjYgMjYgMCAwMDMyIDBNNjMgMzljLTUgMS0xMCAzLTE0IDdhMjYgMjYgMCAwMC0zIDM0bTI1LTQxYzUgMSAxMCAzIDE0IDdhMjYgMjYgMCAwMTMgMzQiIHN0cm9rZT0iIzM0M0JFNSIgc3Ryb2tlLXdpZHRoPSI0LjciIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvZz48L3N2Zz4=',
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
