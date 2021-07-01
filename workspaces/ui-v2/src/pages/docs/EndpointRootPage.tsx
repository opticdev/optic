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
  ContributionFetcher,
  ShapeFetcher,
  HttpBodyPanel,
} from '<src>/components';
import { useDocumentationPageLink } from '<src>/components/navigation/Routes';
import { FontFamily, SubtleBlueBackground } from '<src>/styles';
import {
  useAppSelector,
  useAppDispatch,
  selectors,
  documentationEditActions,
} from '<src>/store';
import { getEndpointId } from '<src>/utils';
import { useRunOnKeypress } from '<src>/hooks/util';
import {
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
            <div className={classes.bodyHeaderContainer}>
              <h6 className={classes.bodyHeader}>Query Parameters</h6>
              {/* TODO QPB - change id from this to query id from spectacle */}
              <MarkdownBodyContribution
                id={'QUERY TODO'}
                contributionKey={'description'}
                defaultText={'Add a description'}
                initialValue={'TODO'}
                endpoint={thisEndpoint}
              />
            </div>
            <div className={classes.bodyDetails}>
              <div>
                <ContributionFetcher
                  rootShapeId={thisEndpoint.query.rootShapeId}
                  endpointId={endpointId}
                >
                  {(contributions) => (
                    <ContributionsList
                      renderContribution={(contribution) => (
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
              <div className={classes.panel}>
                <ShapeFetcher rootShapeId={thisEndpoint.query.rootShapeId}>
                  {(shapes) => (
                    <QueryParametersPanel
                      parameters={convertShapeToQueryParameters(shapes)}
                    />
                  )}
                </ShapeFetcher>
              </div>
            </div>
          </div>
        )}
        {thisEndpoint.requestBodies.map((requestBody) => (
          <div
            className={classes.bodyContainer}
            id={requestBody.requestId}
            key={requestBody.requestId}
          >
            <div className={classes.bodyHeaderContainer}>
              <h6 className={classes.bodyHeader}>Request Body</h6>
              <MarkdownBodyContribution
                id={requestBody.requestId}
                contributionKey={'description'}
                defaultText={'Add a description'}
                initialValue={requestBody.description}
                endpoint={thisEndpoint}
              />
            </div>
            <div className={classes.bodyDetails}>
              <div>
                <ContributionFetcher
                  rootShapeId={requestBody.rootShapeId}
                  endpointId={endpointId}
                >
                  {(contributions) => (
                    <ContributionsList
                      renderContribution={(contribution) => (
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
              <div className={classes.panel}>
                <ShapeFetcher rootShapeId={requestBody.rootShapeId}>
                  {(shapes) => (
                    <HttpBodyPanel
                      shapes={shapes}
                      location={requestBody.contentType}
                    />
                  )}
                </ShapeFetcher>
              </div>
            </div>
          </div>
        ))}
        {thisEndpoint.responseBodies.map((responseBody) => {
          return (
            <div
              className={classes.bodyContainer}
              id={responseBody.responseId}
              key={responseBody.responseId}
            >
              <div className={classes.bodyHeaderContainer}>
                <h6 className={classes.bodyHeader}>
                  {responseBody.statusCode} Response
                </h6>
                <MarkdownBodyContribution
                  id={responseBody.responseId}
                  contributionKey={'description'}
                  defaultText={'Add a description'}
                  initialValue={responseBody.description}
                  endpoint={thisEndpoint}
                />
              </div>
              <div className={classes.bodyDetails}>
                <div>
                  <ContributionFetcher
                    rootShapeId={responseBody.rootShapeId}
                    endpointId={endpointId}
                  >
                    {(contributions) => (
                      <ContributionsList
                        renderContribution={(contribution) => (
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
                <div className={classes.panel}>
                  <ShapeFetcher rootShapeId={responseBody.rootShapeId}>
                    {(shapes) => (
                      <HttpBodyPanel
                        shapes={shapes}
                        location={responseBody.contentType}
                      />
                    )}
                  </ShapeFetcher>
                </div>
              </div>
            </div>
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
    marginTop: theme.spacing(6),
    width: '100%',
    height: '100%',
  },
  bodyHeaderContainer: {
    marginBottom: theme.spacing(2),
  },
  bodyHeader: {
    fontSize: '1.25rem',
    fontFamily: FontFamily,
    fontWeight: 500,
    lineHeight: 1.6,
    letterSpacing: '0.0075em',
    margin: `${theme.spacing(3)}px 0`,
  },
  bodyDetails: {
    display: 'flex',
    width: '100%',
    height: '100%',
    '& > div': {
      width: '50%',
      padding: `0 ${theme.spacing(1)}px`,
    },
  },
  panel: {
    position: 'sticky',
    top: 50,
    alignSelf: 'flex-start',
  },
}));
