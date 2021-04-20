import React, { useContext, useEffect, useState } from 'react';
import { TwoColumnFullWidth } from '../../layouts/TwoColumnFullWidth';
import { DiffHeader } from '../../diffs/DiffHeader';
import {
  ILearnedPendingEndpointStore,
  useLearnedPendingEndpointContext,
} from '../../hooks/diffs/LearnedPendingEndpointContext';
import { Redirect, useHistory } from 'react-router-dom';
import { useLastBatchCommitId } from '../../hooks/useBatchCommits';

import { Box, Button, Divider, TextField, Typography } from '@material-ui/core';
import { EndpointName } from '../../documentation/EndpointName';
import { Loader } from '../../loaders/FullPageLoader';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { makeStyles } from '@material-ui/styles';
import { AddedDarkGreen, OpticBlue, OpticBlueReadable } from '../../theme';
import { useDiffUndocumentedUrlsPageLink } from '../../navigation/Routes';
import { useSharedDiffContext } from '../../hooks/diffs/SharedDiffContext';
import { IIgnoreBody } from '../../hooks/diffs/LearnPendingEndpointState';
import { SimulatedCommandStore } from '../../diffs/contexts/SimulatedCommandContext';
import { IForkableSpectacle } from '../../../../../spectacle';
import { EndpointDocumentationPane } from './EndpointDocumentationPane';
import { SpectacleContext } from '../../../spectacle-implementations/spectacle-provider';
import { useDebounce } from '../../hooks/ui/useDebounceHook';

export function PendingEndpointPageSession(props: any) {
  const { match } = props;
  const { endpointId } = match.params;

  const history = useHistory();
  const diffUndocumentedUrlsPageLink = useDiffUndocumentedUrlsPageLink();

  const goToDiffPage = () =>
    history.push(diffUndocumentedUrlsPageLink.linkTo());

  const {
    getPendingEndpointById,
    stageEndpoint,
    discardEndpoint,
  } = useSharedDiffContext();

  const endpoint = getPendingEndpointById(endpointId);

  if (!endpoint) {
    return <Redirect to={diffUndocumentedUrlsPageLink.linkTo()} />;
  }

  return (
    <ILearnedPendingEndpointStore
      endpointMachine={endpoint.ref}
      endpoint={endpoint}
      onEndpointStaged={() => {
        stageEndpoint(endpoint.id);
        goToDiffPage();
      }}
      onEndpointDiscarded={() => {
        discardEndpoint(endpoint.id);
        goToDiffPage();
      }}
    >
      <PendingEndpointPage />
    </ILearnedPendingEndpointStore>
  );
}

export function PendingEndpointPage(props: any) {
  const {
    endpoint,
    isLoading,
    learnedBodies,
    isReady,
    ignoreBody,
    includeBody,
    stageEndpoint,
    discardEndpoint,
    newEndpointCommands,
    endpointName,
    changeEndpointName,
    isIgnored,
    stagedCommandsIds,
  } = useLearnedPendingEndpointContext();

  const classes = useStyles();
  const spectacle = useContext(SpectacleContext)!;
  const lastBatchId = useLastBatchCommitId();

  const [name, setName] = useState(endpointName);
  const debouncedName = useDebounce(name, 1000);
  useEffect(() => {
    if (typeof debouncedName !== 'undefined') {
      changeEndpointName(debouncedName);
    }
  }, [debouncedName, changeEndpointName]);

  const requestCheckboxes = (learnedBodies?.requests || []).filter((i) =>
    Boolean(i.contentType),
  );

  return (
    <TwoColumnFullWidth
      left={
        <>
          <DiffHeader
            name={
              <Box display="flex" flexDirection="row" alignItems="center">
                Learning Endpoint:{' '}
                <EndpointName
                  method={endpoint.method}
                  leftPad={0}
                  fontSize={12}
                  fullPath={endpoint.pathPattern}
                  style={{ marginLeft: 10, marginTop: 1 }}
                />
              </Box>
            }
          />

          {isLoading && (
            <Loader title="Learning request and response bodies..." />
          )}

          {isReady && (
            <div className={classes.bodyAdd}>
              <TextField
                fullWidth={true}
                label="Name this Endpoint"
                style={{ marginBottom: 20 }}
                autoFocus
                value={name}
                onChange={(e: any) => {
                  setName(e.target.value);
                }}
              />

              <Typography
                component="div"
                variant="subtitle2"
                style={{ color: AddedDarkGreen, marginBottom: 8 }}
              >
                Document the bodies for this endpoint:
              </Typography>

              <FormControl component="fieldset">
                {requestCheckboxes.map((i, index) => {
                  if (!i.contentType) {
                    return null;
                  }
                  const body: IIgnoreBody = {
                    isRequest: true,
                    contentType: i.contentType,
                  };
                  return (
                    <LearnBodyCheckBox
                      initialStatus={isIgnored(body)}
                      key={index}
                      primary="Request Body"
                      subtext={i.contentType || 'no body'}
                      onChange={(ignore) => {
                        ignore ? ignoreBody(body) : includeBody(body);
                      }}
                    />
                  );
                })}
              </FormControl>

              {requestCheckboxes.length > 0 && <Divider />}

              <FormControl component="fieldset">
                {learnedBodies!.responses.map((i, index) => {
                  const body: IIgnoreBody = {
                    isResponse: true,
                    statusCode: i.statusCode,
                    contentType: i.contentType,
                  };
                  return (
                    <LearnBodyCheckBox
                      initialStatus={isIgnored(body)}
                      key={index}
                      primary={`${i.statusCode} Response`}
                      subtext={i.contentType}
                      onChange={(ignore) => {
                        ignore ? ignoreBody(body) : includeBody(body);
                      }}
                    />
                  );
                })}
              </FormControl>

              <div className={classes.buttons}>
                <Button size="small" color="default" onClick={discardEndpoint}>
                  Discard Endpoint
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  style={{ marginLeft: 10 }}
                  onClick={stageEndpoint}
                >
                  Add Endpoint
                </Button>
              </div>
            </div>
          )}
        </>
      }
      right={
        <SimulatedCommandStore
          key={JSON.stringify(newEndpointCommands)}
          spectacle={spectacle as IForkableSpectacle}
          previewCommands={newEndpointCommands}
        >
          <EndpointDocumentationPane
            lastBatchCommit={lastBatchId}
            method={stagedCommandsIds.method}
            pathId={stagedCommandsIds.pathId}
          />
        </SimulatedCommandStore>
      }
    />
  );
}

interface ILoaderProps {
  primary: string;
  subtext: string;
  onChange: (ignore: boolean) => void;
  initialStatus: boolean;
}
export function LearnBodyCheckBox(props: ILoaderProps) {
  const [checked, setChecked] = useState(props.initialStatus);
  return (
    <FormControlLabel
      control={
        <Checkbox
          color="secondary"
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.checked);
            props.onChange(!e.target.checked);
          }}
        />
      }
      label={
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
        >
          <Typography
            component="div"
            variant="subtitle2"
            style={{ color: OpticBlue }}
          >
            {props.primary}
          </Typography>
          <Typography
            component="div"
            variant="caption"
            style={{ marginLeft: 10, marginTop: 2, color: OpticBlueReadable }}
          >
            {props.subtext}
          </Typography>
        </Box>
      }
    />
  );
}

const useStyles = makeStyles((theme) => ({
  bodyAdd: {
    padding: 15,
  },
  buttons: {
    marginTop: 25,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
}));
