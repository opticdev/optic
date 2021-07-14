import React, { useContext, useState } from 'react';
import { DiffHeader } from '<src>/pages/diffs/components/DiffHeader';
import {
  ILearnedPendingEndpointStore,
  useLearnedPendingEndpointContext,
} from '<src>/pages/diffs/contexts/LearnedPendingEndpointContext';
import { Redirect, useHistory } from 'react-router-dom';

import {
  Box,
  Button,
  Divider,
  LinearProgress,
  TextField,
  Typography,
} from '@material-ui/core';
import {
  EndpointName,
  Loader,
  TwoColumnFullWidth,
  useDiffUndocumentedUrlsPageLink,
  PageLayout,
} from '<src>/components';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { makeStyles } from '@material-ui/styles';
import { AddedDarkGreen, OpticBlue, OpticBlueReadable } from '<src>/styles';
import { useSharedDiffContext } from '<src>/pages/diffs/contexts/SharedDiffContext';
import { SimulatedCommandStore } from '<src>/pages/diffs/contexts/SimulatedCommandContext';
import { IForkableSpectacle } from '@useoptic/spectacle';
import { SpectacleContext } from '<src>/contexts/spectacle-provider';
import { IIgnoreBody } from '<src>/pages/diffs/contexts/LearnInitialBodiesMachine';
import {
  useDebouncedFn,
  useStateWithSideEffect,
  useRunOnKeypress,
} from '<src>/hooks/util';
import { DiffAccessoryNavigation } from '<src>/pages/diffs/components/DiffAccessoryNavigation';
import { useAnalytics } from '<src>/contexts/analytics';
import { EndpointDocumentationPane } from './EndpointDocumentationPane';

export function PendingEndpointPageSession(props: any) {
  const { match } = props;
  const { endpointId } = match.params;

  const analytics = useAnalytics();
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
    <PageLayout AccessoryNavigation={DiffAccessoryNavigation}>
      <ILearnedPendingEndpointStore
        endpointMachine={endpoint.ref}
        endpoint={endpoint}
        onEndpointStaged={() => {
          stageEndpoint(endpoint.id);
          goToDiffPage();
        }}
        onEndpointDiscarded={() => {
          discardEndpoint(endpoint.id);
          analytics.userDiscardedEndpoint();
          goToDiffPage();
        }}
      >
        <PendingEndpointPage />
      </ILearnedPendingEndpointStore>
    </PageLayout>
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
    newEndpointCommands,
    endpointName,
    changeEndpointName,
    isIgnored,
    stagedCommandsIds,
  } = useLearnedPendingEndpointContext();

  const classes = useStyles();
  const spectacle = useContext(SpectacleContext)!;
  const debouncedSetName = useDebouncedFn(changeEndpointName, 200);
  const { value: name, setValue: setName } = useStateWithSideEffect({
    initialValue: endpointName,
    sideEffect: debouncedSetName,
  });
  const history = useHistory();
  const diffUndocumentedUrlsPageLink = useDiffUndocumentedUrlsPageLink();

  const requestCheckboxes = (learnedBodies?.requests || []).filter((i) =>
    Boolean(i.contentType)
  );
  const onKeyPress = useRunOnKeypress(
    () => {
      stageEndpoint();
    },
    {
      keys: new Set(['Enter']),
      inputTagNames: new Set(['input']),
    }
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

          {isReady && learnedBodies && (
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
                onKeyPress={onKeyPress}
              />

              {learnedBodies.queryParameters ||
              requestCheckboxes.length > 0 ||
              learnedBodies.responses.length > 0 ? (
                <Typography
                  component="div"
                  variant="subtitle2"
                  style={{ color: AddedDarkGreen, marginBottom: 8 }}
                >
                  Document the bodies for this endpoint:
                </Typography>
              ) : null}

              {learnedBodies.queryParameters && (
                <>
                  <FormControl component="fieldset" onKeyPress={onKeyPress}>
                    <LearnBodyCheckBox
                      initialStatus={isIgnored({
                        isQuery: true,
                        contentType: '',
                      })}
                      primary="Query Parameters"
                      subtext=""
                      onChange={(ignore) => {
                        ignore
                          ? ignoreBody({
                              isQuery: true,
                              contentType: '',
                            })
                          : includeBody({
                              isQuery: true,
                              contentType: '',
                            });
                      }}
                    />
                  </FormControl>
                  <Divider />
                </>
              )}

              <FormControl component="fieldset" onKeyPress={onKeyPress}>
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

              <FormControl component="fieldset" onKeyPress={onKeyPress}>
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
                <div>
                  <Button
                    size="small"
                    color="default"
                    onClick={() =>
                      history.push(diffUndocumentedUrlsPageLink.linkTo())
                    }
                  >
                    Cancel
                  </Button>
                </div>
                <div>
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
            </div>
          )}
        </>
      }
      right={
        <>
          <SimulatedCommandStore
            spectacle={spectacle as IForkableSpectacle}
            previewCommands={newEndpointCommands}
          >
            {isLoading ? (
              <LinearProgress variant="indeterminate" />
            ) : (
              <EndpointDocumentationPane
                method={stagedCommandsIds.method}
                pathId={stagedCommandsIds.pathId}
                renderHeader={() => (
                  <Typography className={classes.nameDisplay}>
                    {name === '' ? 'Unnamed Endpoint' : name}
                  </Typography>
                )}
              />
            )}
          </SimulatedCommandStore>
        </>
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
    justifyContent: 'space-between;',
  },
  nameDisplay: {
    fontSize: '1.25rem',
    fontFamily: 'Ubuntu, Inter',
    fontWeight: 500,
    lineHeight: 1.6,
  },
}));
