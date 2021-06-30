import React, { FC, useState } from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { Button, LinearProgress, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Delete as DeleteIcon, Undo as UndoIcon } from '@material-ui/icons';

import {
  EndpointName,
  PathParameters,
  IShapeRenderer,
  JsonLike,
  PageLayout,
  FullWidth,
  ContributionsList,
  QueryParametersPanel,
  convertShapeToQueryParameters,
} from '<src>/components';
import { useDocumentationPageLink } from '<src>/components/navigation/Routes';
import { SubtleBlueBackground } from '<src>/styles';
import {
  useAppSelector,
  useAppDispatch,
  selectors,
  documentationEditActions,
} from '<src>/store';
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
  ContributionFetcher,
  ShapeFetcher,
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
  const documentationPageLink = useDocumentationPageLink();
  const endpointsState = useAppSelector((state) => state.endpoints.results);
  const isEditing = useAppSelector(
    (state) => state.documentationEdits.isEditing
  );
  const pendingCount = useAppSelector(
    selectors.getDocumentationEditStagedCount
  );
  const dispatch = useAppDispatch();

  const { pathId, method } = match.params;
  const thisEndpoint = useAppSelector(
    selectors.getEndpoint({ pathId, method })
  );

  const isEndpointRemoved = thisEndpoint ? thisEndpoint.isRemoved : false;

  const onKeyPress = useRunOnKeypress(
    () => {
      if (isEditing && pendingCount > 0) {
        dispatch(
          documentationEditActions.updateCommitModalState({
            commitModalOpen: true,
          })
        );
      }
    },
    {
      keys: new Set(['Enter']),
      inputTagNames: new Set(['input']),
    }
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const endpointId = getEndpointId({ method, pathId });

  const isEndpointStagedForDeletion = useAppSelector(
    selectors.isEndpointDeleted({ method, pathId })
  );

  const deleteEndpoint = () =>
    dispatch(documentationEditActions.deleteEndpoint({ method, pathId }));

  const undeleteEndpoint = () =>
    dispatch(documentationEditActions.undeleteEndpoint({ method, pathId }));

  const classes = useStyles();

  if (endpointsState.loading) {
    return <LinearProgress variant="indeterminate" />;
  }

  if (!thisEndpoint) {
    return <>no endpoint here</>;
  }

  if (isEndpointRemoved) {
    return <Redirect to={documentationPageLink.linkTo()} />;
  }

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
            deleteEndpoint();
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
          endpoint={{
            pathId,
            method,
          }}
        />
        <div className={classes.endpointNameContainer}>
          <EndpointName
            fontSize={19}
            leftPad={0}
            method={thisEndpoint.method}
            fullPath={thisEndpoint.fullPath}
          />
          {isEditing &&
            (isEndpointStagedForDeletion ? (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  undeleteEndpoint();
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
              endpoint={{
                pathId,
                method,
              }}
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
                      endpoint={{
                        pathId,
                        method,
                      }}
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
                  query={thisEndpoint.query}
                  requests={thisEndpoint.requestBodies}
                  responses={thisEndpoint.responseBodies}
                />
              </div>
            </CodeBlock>
          }
        />
        {thisEndpoint.query && (
          <div className={classes.bodyContainer} id="query-parameters">
            <div>
              <h6>Query Parameters</h6>
              <MarkdownBodyContribution
                id={'QUERY TODO'}
                contributionKey={'description'}
                defaultText={'Add a description'}
                initialValue={'TODO'}
                endpoint={thisEndpoint}
              />
              <ContributionFetcher
                rootShapeId={thisEndpoint.query.rootShapeId}
                endpointId={endpointId}
              >
                {(contributions) => (
                  <ContributionsList
                    ContributionComponent={(contribution) => (
                      <DocsFieldOrParameterContribution
                        key={contribution.id}
                        endpoint={{
                          pathId,
                          method,
                        }}
                        id={contribution.id}
                        name={contribution.name}
                        shapes={contribution.shapes}
                        depth={contribution.depth}
                        initialValue={contribution.value}
                      />
                    )}
                    contributions={contributions}
                  />
                )}
              </ContributionFetcher>
            </div>
            <div>
              <ShapeFetcher rootShapeId={thisEndpoint.query.rootShapeId}>
                {(shapes) => (
                  <QueryParametersPanel
                    parameters={convertShapeToQueryParameters(shapes)}
                  />
                )}
              </ShapeFetcher>
            </div>
          </div>
        )}
        {thisEndpoint.requestBodies.map((requestBody) => (
          <TwoColumnBodyEditable
            key={requestBody.rootShapeId}
            endpoint={{
              pathId,
              method,
            }}
            rootShapeId={requestBody.rootShapeId}
            bodyId={requestBody.requestId}
            location={'Request Body'}
            contentType={requestBody.contentType}
            description={requestBody.description}
          />
        ))}
        {thisEndpoint.responseBodies.map((i) => {
          return (
            <TwoColumnBodyEditable
              key={i.rootShapeId}
              endpoint={{
                pathId,
                method,
              }}
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
  bodyContainer: {
    display: 'flex',
    width: '100%',
    marginTop: theme.spacing(6),
    '& > div': {
      width: '50%',
    },
  },
}));
