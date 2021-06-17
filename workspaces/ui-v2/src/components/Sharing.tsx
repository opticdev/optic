import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LoginRequired } from './Auth';
import { Button, makeStyles, Typography } from '@material-ui/core';
import { useAuth0 } from '@auth0/auth0-react';
import { useSpecRepository } from '<src>/contexts/SpecRepositoryContext';
import { useAppSelector } from '<src>/store';
import { useAsyncMemo } from 'use-async-memo';
import { useAppConfig } from '<src>/contexts/config/AppConfiguration';

const useStyles = makeStyles((theme) => ({
  root: {
    marginRight: theme.spacing(1),
  },
}));

export const ShareButton: React.FC<{}> = (props) => {
  const styles = useStyles(props);

  const { getAccessTokenSilently } = useAuth0();
  const { specRepo } = useSpecRepository();
  const {
    api: { domain: baseDomain },
    sharing,
  } = useAppConfig();

  const specId = useAppSelector(
    (state) => state.metadata.data?.specificationId!
  );

  const [publicSpecId, setPublicSpecId] = useState<string | null>(null);

  const personId = useAsyncMemo(async () => {
    const token = await getAccessTokenSilently();

    const response = await fetch(`${baseDomain}/api/person`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const resp_data = await response.json();
    return resp_data.id;
  }, [getAccessTokenSilently, baseDomain]);

  const specShareUrl = useMemo(() => {
    if (publicSpecId) {
      return `${
        sharing.enabled && sharing.specViewerDomain
      }/people/${personId}/public-specs/${publicSpecId}/documentation`;
    } else {
      return null;
    }
  }, [publicSpecId, sharing, personId]);

  const share = useCallback(async () => {
    const token = await getAccessTokenSilently();

    let newSpecResp = await fetch(`${baseDomain}/api/person/public-specs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        origin: 'local_ui',
      }),
    });

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
      setPublicSpecId(newSpecId);
    }
  }, [getAccessTokenSilently, specRepo, baseDomain, setPublicSpecId]);

  return (
    <LoginRequired>
      {specShareUrl ? (
        <a href={specShareUrl}>Share link</a>
      ) : (
        <Button className={styles.root} onClick={share}>
          <Typography variant="body2" style={{ textTransform: 'none' }}>
            Share
          </Typography>
        </Button>
      )}
    </LoginRequired>
  );
};
