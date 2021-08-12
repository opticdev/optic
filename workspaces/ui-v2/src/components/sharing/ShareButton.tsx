import React, { useCallback, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  makeStyles,
  Typography,
} from '@material-ui/core';
import ShareIcon from '@material-ui/icons/Share';
import { ShareModal } from './ShareModal';
import { useAuth0 } from '@auth0/auth0-react';
import { useSpecRepository } from '<src>/contexts/SpecRepositoryContext';
import { useAppConfig } from '<src>/contexts/config/AppConfiguration';
import { useAsyncMemo } from 'use-async-memo';
import { useAnalytics } from '<src>/contexts/analytics';
import { useAppSelector } from '<src>/store';

export enum ShareTarget {
  TEAM = 'team',
  CONSUMER = 'consumer',
  // OTHER = 'other',
}

const useStyles = makeStyles((theme) => ({
  root: {
    marginRight: theme.spacing(1),
    height: 25,
  },
}));

export const ShareButton: React.FC<{}> = (props) => {
  const styles = useStyles(props);

  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const specRepo = useSpecRepository();
  const {
    backendApi: { domain: baseDomain },
    sharing,
  } = useAppConfig();

  const specId = useAppSelector(
    (state) => state.metadata.data?.specificationId!
  );

  const analytics = useAnalytics();

  const personId = useAsyncMemo(async () => {
    if (isAuthenticated) {
      const token = await getAccessTokenSilently();

      const response = await fetch(`${baseDomain}/api/person`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resp_data = await response.json();
      analytics.userLoggedIn(resp_data.id);
      return resp_data.id;
    }
  }, [getAccessTokenSilently, isAuthenticated, baseDomain, analytics]);

  const share = useCallback(
    async (target: ShareTarget) => {
      const token = await getAccessTokenSilently();

      let newSpecResp = await fetch(
        `${baseDomain}/api/person/public-specs-v3`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            metadata: {
              sharing_context: {
                local_ui_v1: {
                  with: target.toString(),
                },
              },
            },
            analytics_id: specId,
          }),
        }
      );

      if (!newSpecResp.ok) {
        throw new Error(
          `Error creating spec to upload: ${
            newSpecResp.statusText
          }: ${await newSpecResp.text()}`
        );
      } else {
        let { upload_url, id: newSpecId } = await newSpecResp.json();

        let uploadResult = await fetch(upload_url, {
          method: 'PUT',
          headers: {
            'x-amz-server-side-encryption': 'AES256',
          },
          body: JSON.stringify(await specRepo.listEvents()),
        });

        if (!uploadResult.ok) {
          throw new Error(
            `Error uploading spec: ${
              uploadResult.statusText
            }: ${await uploadResult.text()}`
          );
        }

        analytics.userShared(target, newSpecId);

        if (target === ShareTarget.TEAM) {
          return `${
            sharing.enabled && sharing.specViewerDomain
          }/people/${personId}/public-specs/${newSpecId}/documentation?demo=true`;
        } else {
          return `${
            sharing.enabled && sharing.specViewerDomain
          }/people/${personId}/public-specs/${newSpecId}/documentation`;
        }
      }
    },
    [
      getAccessTokenSilently,
      specRepo,
      baseDomain,
      personId,
      specId,
      sharing,
      analytics,
    ]
  );

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        marginRight: 5,
        opacity: 0.45,
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <Button
        variant="outlined"
        className={styles.root}
        onClick={() => {
          analytics.userStartedSharing();
          setIsOpen(true);
        }}
      >
        <Typography variant="body2" style={{ textTransform: 'none' }}>
          Share
        </Typography>
        <ShareIcon style={{ marginLeft: 3, height: 14 }} />
      </Button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent>
          <ShareModal share={share} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
