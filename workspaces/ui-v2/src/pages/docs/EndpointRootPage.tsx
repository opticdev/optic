import React, { FC, useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Button, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Delete as DeleteIcon, Undo as UndoIcon } from '@material-ui/icons';

import {
  EndpointName,
  PathParameters,
  Loading,
  IShapeRenderer,
  JsonLike,
  PageLayout,
} from '<src>/components';
import { useContributionEditing } from './contexts/Contributions';
import { FullWidth } from '<src>/components';
import { useEndpointBody } from '<src>/hooks/useEndpointBodyHook';
import { SubtleBlueBackground } from '<src>/constants/theme';
import { useAppSelector } from '<src>/store';
import { getEndpointId } from '<src>/utils';
import { useRunOnKeypress } from '<src>/hooks/util';
import {
  TwoColumnBodyEditable,
  CodeBlock,
  EndpointTOC,
  DocsFieldOrParameterContribution,
  EndpointNameContribution,
  DocsPageAccessoryNavigation,
  MarkdownBodyContribution,
  TwoColumn,
  DeleteEndpointConfirmationModal,
} from '<src>/pages/docs/components';

export const EndpointRootPageWithDocsNav: FC<
  React.ComponentProps<typeof EndpointRootPage>
> = (props) => (
  <PageLayout AccessoryNavigation={DocsPageAccessoryNavigation}>
    <EndpointRootPage {...props} />
  </PageLayout>
);

export const EndpointRootPage: FC<
  RouteComponentProps<{
    pathId: string;
    method: string;
  }>
> = ({ match }) => {
  const endpointsState = useAppSelector((state) => state.endpoints.results);

  const { pathId, method } = match.params;
  const thisEndpoint = useMemo(
    () =>
      endpointsState.data?.find(
        (i) => i.pathId === pathId && i.method === method
      ),
    [endpointsState, method, pathId]
  );

  const bodies = useEndpointBody(pathId, method);
  const {
    isEditing,
    pendingCount,
    setCommitModalOpen,
  } = useContributionEditing();

  const onKeyPress = useRunOnKeypress(
    () => {
      if (isEditing && pendingCount > 0) {
        setCommitModalOpen(true);
      }
    },
    {
      keys: new Set(['Enter']),
      inputTagNames: new Set(['input']),
    }
  );
  const showDeleteEndpointUi =
    process.env.REACT_APP_FF_SHOW_DELETE_ENDPOINT === 'true';
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // TODO redux-delete-implement replace this with redux selector query
  const isEndpointStagedForDeletion = false;

  const deleteEndpoint = (endpointId: string) => {
    // TODO redux-delete-implement implement
  };

  const undeleteEndpoint = (endpointId: string) => {
    // TODO redux-delete-implement implement
  };

  const classes = useStyles();

  if (endpointsState.loading) {
    return <Loading />;
  }

  if (!thisEndpoint) {
    return <>no endpoint here</>;
  }
  const endpointId = getEndpointId({ method, pathId });
  const parameterizedPathParts = thisEndpoint.pathParameters.filter(
    (path) => path.isParameterized
  );

  return (
    <>
      {deleteModalOpen && (
        <DeleteEndpointConfirmationModal
          endpoint={thisEndpoint}
          handleClose={() => setDeleteModalOpen(false)}
          handleConfirm={() => {
            deleteEndpoint(endpointId);
            setDeleteModalOpen(false);
          }}
        />
      )}
      {isEndpointStagedForDeletion && isEditing && (
        <Alert severity="warning" className={classes.deleteInfoHeader}>
          This endpoint is staged to be deleted
        </Alert>
      )}
      <FullWidth
        style={{ paddingTop: 30, paddingBottom: 400 }}
        onKeyPress={onKeyPress}
      >
        <EndpointNameContribution
          id={endpointId}
          contributionKey="purpose"
          defaultText="What does this endpoint do?"
          initialValue={thisEndpoint.purpose}
        />
        <div className={classes.endpointNameContainer}>
          <EndpointName
            fontSize={19}
            leftPad={0}
            method={thisEndpoint.method}
            fullPath={thisEndpoint.fullPath}
          />
          {isEditing &&
            showDeleteEndpointUi &&
            (isEndpointStagedForDeletion ? (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  undeleteEndpoint(endpointId);
                }}
              >
                Undelete <UndoIcon className={classes.icon} />
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setDeleteModalOpen(true);
                }}
              >
                Delete <DeleteIcon className={classes.icon} />
              </Button>
            ))}
        </div>
        <TwoColumn
          style={{ marginTop: 5 }}
          left={
            <MarkdownBodyContribution
              id={endpointId}
              contributionKey={'description'}
              defaultText={'Describe this endpoint'}
              initialValue={thisEndpoint.description}
            />
          }
          right={
            <CodeBlock
              header={
                <EndpointName
                  fontSize={14}
                  leftPad={0}
                  method={thisEndpoint.method}
                  fullPath={thisEndpoint.fullPath}
                />
              }
            >
              <PathParameters
                parameters={parameterizedPathParts}
                renderField={(param, index) => {
                  const alwaysAString: IShapeRenderer = {
                    shapeId: param.id + 'shape',
                    jsonType: JsonLike.STRING,
                    value: undefined,
                  };
                  return (
                    <DocsFieldOrParameterContribution
                      key={param.id}
                      id={param.id}
                      name={param.name}
                      shapes={[alwaysAString]}
                      depth={0}
                      initialValue={param.description}
                    />
                  );
                }}
              />
              <div
                style={{
                  marginTop: 10,
                  backgroundColor: SubtleBlueBackground,
                  borderTop: '1px solid #e2e2e2',
                }}
              >
                <EndpointTOC
                  requests={bodies.requests}
                  responses={bodies.responses}
                />
              </div>
            </CodeBlock>
          }
        />

        {bodies.requests.map((i, index) => {
          return (
            <TwoColumnBodyEditable
              key={index}
              rootShapeId={i.rootShapeId}
              bodyId={i.requestId}
              location={'Request Body'}
              contentType={i.contentType}
              description={i.description}
            />
          );
        })}
        {bodies.responses.map((i, index) => {
          return (
            <TwoColumnBodyEditable
              key={index}
              rootShapeId={i.rootShapeId}
              bodyId={i.responseId}
              location={`${i.statusCode} Response`}
              contentType={i.contentType}
              description={i.description}
            />
          );
        })}
      </FullWidth>
    </>
  );
};

const useStyles = makeStyles((theme) => ({
  endpointNameContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    padding: '16px 0',
  },
  icon: {
    paddingLeft: 8,
  },
  deleteInfoHeader: {
    justifyContent: 'center',
    display: 'fixed',
  },
}));
