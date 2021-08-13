import React, { FC, useCallback, useEffect, useState } from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { Button, LinearProgress, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Delete as DeleteIcon, Undo as UndoIcon } from '@material-ui/icons';
import { JsonType } from '@useoptic/optic-domain';

import {
  EndpointName,
  PathParameters,
  PageLayout,
  FullWidth,
  ContributionsList,
  QueryParametersPanel,
  ShapeFetcher,
  HttpBodyPanel,
  HttpBodySelector,
  Panel,
  HighlightController,
} from '<src>/components';
import { useDocumentationPageLink } from '<src>/components/navigation/Routes';
import { FontFamily, SubtleBlueBackground } from '<src>/styles';
import {
  useAppSelector,
  useAppDispatch,
  selectors,
  documentationEditActions,
} from '<src>/store';
import { IShapeRenderer } from '<src>/types';
import { getEndpointId } from '<src>/utils';
import { useRunOnKeypress } from '<src>/hooks/util';
import {
  EndpointTOC,
  DocsFieldOrParameterContribution,
  EndpointNameContribution,
  DocsPageAccessoryNavigation,
  MarkdownBodyContribution,
  DeleteEndpointConfirmationModal,
  SimulatedBody,
  ShapeEditor,
} from '<src>/pages/docs/components';
import { useAnalytics } from '<src>/contexts/analytics';

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
  const analytics = useAnalytics();
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
  const userRemovedFields = useAppSelector(
    (state) => state.documentationEdits.fields.removed
  );
  const allRemovedFields = useAppSelector(
    selectors.memoizedGetAllRemovedFields
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
  useEffect(() => {
    analytics.documentationListPageLoaded();
  }, [analytics]);

  const isEndpointStagedForDeletion = useAppSelector(
    selectors.isEndpointRemoved({ method, pathId })
  );

  const removeEndpoint = () =>
    dispatch(documentationEditActions.removeEndpoint({ method, pathId }));

  const unremoveEndpoint = () =>
    dispatch(documentationEditActions.unremoveEndpoint({ method, pathId }));

  const isFieldRemoved = useCallback(
    (fieldId: string) => {
      if (userRemovedFields.includes(fieldId)) {
        return 'root_removed';
      } else if (allRemovedFields.has(fieldId)) {
        return 'removed';
      } else {
        return 'not_removed';
      }
    },
    [userRemovedFields, allRemovedFields]
  );

  const onToggleRemovedField = useCallback(
    (fieldId: string) => {
      if (userRemovedFields.includes(fieldId)) {
        dispatch(documentationEditActions.unremoveField({ fieldId }));
      } else {
        dispatch(documentationEditActions.removeField({ fieldId }));
      }
    },
    [userRemovedFields, dispatch]
  );

  const onChangeFieldType = useCallback(
    (
      fieldId: string,
      requestedFieldTypes: Set<JsonType>,
      isFieldTypeDifferent: boolean
    ) => {
      if (isFieldTypeDifferent) {
        dispatch(
          documentationEditActions.addFieldEdit({
            fieldId,
            options: {
              isOptional: requestedFieldTypes.has(JsonType.UNDEFINED),
              isNullable: requestedFieldTypes.has(JsonType.NULL),
            },
          })
        );
      } else {
        dispatch(
          documentationEditActions.removeFieldEdit({
            fieldId,
          })
        );
      }
    },
    [dispatch]
  );

  const onFieldDescriptionChanged = useCallback(
    (fieldId: string, description: string, isDescriptionDifferent: boolean) => {
      if (isDescriptionDifferent) {
        dispatch(
          documentationEditActions.addContribution({
            id: fieldId,
            contributionKey: 'description',
            value: description,
            endpointId: endpointId,
          })
        );
      } else {
        dispatch(
          documentationEditActions.removeContribution({
            id: fieldId,
            contributionKey: 'description',
          })
        );
      }
    },
    [endpointId, dispatch]
  );

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
  const visibleQueryParameters =
    thisEndpoint.query && selectors.isItemVisible(thisEndpoint.query)
      ? thisEndpoint.query
      : null;
  const visibleRequests = selectors.filterRemovedItems(thisEndpoint.requests);
  const visibleResponsesByStatusCode = selectors.filterMapOfRemovedItems(
    thisEndpoint.responsesByStatusCode
  );

  return (
    <>
      {deleteModalOpen && (
        <DeleteEndpointConfirmationModal
          endpoint={thisEndpoint}
          handleClose={() => setDeleteModalOpen(false)}
          handleConfirm={() => {
            removeEndpoint();
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
                  unremoveEndpoint();
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
        <div className={classes.bodyContainer}>
          <div className={classes.bodyDetails}>
            <div>
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
            </div>
            <div className={classes.panel}>
              <Panel
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
                  renderField={(param) => {
                    const alwaysAString: IShapeRenderer = {
                      shapeId: param.id + 'shape',
                      jsonType: JsonType.STRING,
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
                        required
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
                    query={visibleQueryParameters}
                    requests={visibleRequests}
                    responsesByStatusCode={visibleResponsesByStatusCode}
                  />
                </div>
              </Panel>
            </div>
          </div>
        </div>
        {visibleQueryParameters && (
          <div className={classes.bodyContainer} id="query-parameters">
            <div className={classes.bodyHeaderContainer}>
              <h6 className={classes.bodyHeader}>Query Parameters</h6>
            </div>
            <div className={classes.bodyContributionContainer}>
              <MarkdownBodyContribution
                id={visibleQueryParameters.queryParametersId}
                contributionKey={'description'}
                defaultText={'Add a description'}
                initialValue={visibleQueryParameters.description}
                endpoint={thisEndpoint}
              />
            </div>
            <ShapeFetcher
              rootShapeId={visibleQueryParameters.rootShapeId}
              endpointId={endpointId}
            >
              {(shapes, fields) => (
                <HighlightController>
                  {(selectedFieldId, setSelectedFieldId) => (
                    <div className={classes.bodyDetails}>
                      <div>
                        {process.env.REACT_APP_FF_FIELD_LEVEL_EDITS !==
                          'true' || !isEditing ? (
                          <ContributionsList
                            renderField={(field) => {
                              // TODO apply this to the shapeEditor component
                              let isArray = field.shapes.findIndex(
                                (choice) => choice.jsonType === JsonType.ARRAY
                              );

                              if (isArray > -1) {
                                if (field.shapes.length > 1) {
                                  field.shapes.splice(isArray, 1);
                                } else {
                                  field.shapes = field.shapes[
                                    isArray
                                  ].asArray!.shapeChoices;
                                }
                              }

                              return (
                                <DocsFieldOrParameterContribution
                                  key={
                                    field.contribution.id +
                                    field.contribution.contributionKey
                                  }
                                  endpoint={{
                                    pathId,
                                    method,
                                  }}
                                  name={field.name}
                                  shapes={field.shapes}
                                  depth={field.depth}
                                  id={field.contribution.id}
                                  initialValue={field.contribution.value}
                                  required={field.required}
                                />
                              );
                            }}
                            fieldDetails={fields}
                          />
                        ) : (
                          <ShapeEditor
                            fields={fields}
                            selectedFieldId={selectedFieldId}
                            setSelectedField={setSelectedFieldId}
                            onChangeDescription={onFieldDescriptionChanged}
                            onChangeFieldType={onChangeFieldType}
                            isFieldRemoved={isFieldRemoved}
                            onToggleRemove={onToggleRemovedField}
                          />
                        )}
                      </div>
                      <div className={classes.panel}>
                        {isEditing ? (
                          <SimulatedBody
                            rootShapeId={visibleQueryParameters.rootShapeId}
                            endpointId={endpointId}
                          >
                            {(shapes) => (
                              <QueryParametersPanel
                                parameters={selectors.convertShapeToQueryParameters(
                                  shapes
                                )}
                              />
                            )}
                          </SimulatedBody>
                        ) : (
                          <QueryParametersPanel
                            parameters={selectors.convertShapeToQueryParameters(
                              shapes
                            )}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </HighlightController>
              )}
            </ShapeFetcher>
          </div>
        )}
        {visibleRequests.length > 0 && (
          <div className={classes.bodyContainer} id="request-body">
            <div className={classes.bodyHeaderContainer}>
              <h6 className={classes.bodyHeader}>Request Body</h6>
            </div>
            <HttpBodySelector
              items={visibleRequests}
              getDisplayName={(request) =>
                request.body?.contentType || 'No Body'
              }
            >
              {(request) => (
                <>
                  <div className={classes.bodyContributionContainer}>
                    <MarkdownBodyContribution
                      id={request.requestId}
                      contributionKey={'description'}
                      defaultText={'Add a description'}
                      initialValue={request.description}
                      endpoint={thisEndpoint}
                    />
                  </div>
                  {request.body ? (
                    <ShapeFetcher
                      rootShapeId={request.body.rootShapeId}
                      endpointId={endpointId}
                    >
                      {(shapes, fields) => (
                        <HighlightController>
                          {(selectedFieldId, setSelectedFieldId) => (
                            <div className={classes.bodyDetails}>
                              <div>
                                {process.env.REACT_APP_FF_FIELD_LEVEL_EDITS !==
                                  'true' || !isEditing ? (
                                  <ContributionsList
                                    renderField={(field) => (
                                      <DocsFieldOrParameterContribution
                                        key={
                                          field.contribution.id +
                                          field.contribution.contributionKey
                                        }
                                        endpoint={{
                                          pathId,
                                          method,
                                        }}
                                        name={field.name}
                                        shapes={field.shapes}
                                        depth={field.depth}
                                        id={field.fieldId}
                                        initialValue={field.contribution.value}
                                        required={field.required}
                                        setSelectedField={setSelectedFieldId}
                                      />
                                    )}
                                    fieldDetails={fields}
                                  />
                                ) : (
                                  <ShapeEditor
                                    fields={fields}
                                    selectedFieldId={selectedFieldId}
                                    setSelectedField={setSelectedFieldId}
                                    onChangeDescription={
                                      onFieldDescriptionChanged
                                    }
                                    onChangeFieldType={onChangeFieldType}
                                    isFieldRemoved={isFieldRemoved}
                                    onToggleRemove={onToggleRemovedField}
                                  />
                                )}
                              </div>
                              <div className={classes.panel}>
                                {isEditing ? (
                                  <SimulatedBody
                                    rootShapeId={request.body!.rootShapeId}
                                    endpointId={endpointId}
                                  >
                                    {(shapes) => (
                                      <HttpBodyPanel
                                        shapes={shapes}
                                        location={request.body!.contentType}
                                        selectedFieldId={selectedFieldId}
                                        fieldsAreSelectable={true}
                                        setSelectedField={setSelectedFieldId}
                                      />
                                    )}
                                  </SimulatedBody>
                                ) : (
                                  <HttpBodyPanel
                                    shapes={shapes}
                                    location={request.body!.contentType}
                                  />
                                )}
                              </div>
                            </div>
                          )}
                        </HighlightController>
                      )}
                    </ShapeFetcher>
                  ) : (
                    <>No Body Request</>
                  )}
                </>
              )}
            </HttpBodySelector>
          </div>
        )}
        {selectors
          .getResponsesInSortedOrder(visibleResponsesByStatusCode)
          .map(([statusCode, responses]) => (
            <div
              className={classes.bodyContainer}
              id={statusCode}
              key={statusCode}
            >
              <div className={classes.bodyHeaderContainer}>
                <h6 className={classes.bodyHeader}>{statusCode} Response</h6>
              </div>
              <HttpBodySelector
                items={responses}
                getDisplayName={(response) =>
                  response.body?.contentType || 'No Body'
                }
              >
                {(response) => (
                  <>
                    <div className={classes.bodyContributionContainer}>
                      <MarkdownBodyContribution
                        id={response.responseId}
                        contributionKey={'description'}
                        defaultText={'Add a description'}
                        initialValue={response.description}
                        endpoint={thisEndpoint}
                      />
                    </div>
                    {response.body ? (
                      <ShapeFetcher
                        rootShapeId={response.body.rootShapeId}
                        endpointId={endpointId}
                      >
                        {(shapes, fields) => (
                          <HighlightController>
                            {(selectedFieldId, setSelectedFieldId) => (
                              <div className={classes.bodyDetails}>
                                <div>
                                  {process.env
                                    .REACT_APP_FF_FIELD_LEVEL_EDITS !==
                                    'true' || !isEditing ? (
                                    <ContributionsList
                                      renderField={(field) => (
                                        <DocsFieldOrParameterContribution
                                          key={
                                            field.contribution.id +
                                            field.contribution.contributionKey
                                          }
                                          endpoint={{
                                            pathId,
                                            method,
                                          }}
                                          name={field.name}
                                          shapes={field.shapes}
                                          depth={field.depth}
                                          id={field.fieldId}
                                          initialValue={
                                            field.contribution.value
                                          }
                                          required={field.required}
                                          setSelectedField={setSelectedFieldId}
                                        />
                                      )}
                                      fieldDetails={fields}
                                    />
                                  ) : (
                                    <ShapeEditor
                                      fields={fields}
                                      selectedFieldId={selectedFieldId}
                                      setSelectedField={setSelectedFieldId}
                                      onChangeDescription={
                                        onFieldDescriptionChanged
                                      }
                                      onChangeFieldType={onChangeFieldType}
                                      isFieldRemoved={isFieldRemoved}
                                      onToggleRemove={onToggleRemovedField}
                                    />
                                  )}
                                </div>
                                <div className={classes.panel}>
                                  {isEditing ? (
                                    <SimulatedBody
                                      rootShapeId={response.body!.rootShapeId}
                                      endpointId={endpointId}
                                    >
                                      {(shapes) => (
                                        <HttpBodyPanel
                                          shapes={shapes}
                                          location={response.body!.contentType}
                                          selectedFieldId={selectedFieldId}
                                          fieldsAreSelectable={true}
                                          setSelectedField={setSelectedFieldId}
                                        />
                                      )}
                                    </SimulatedBody>
                                  ) : (
                                    <HttpBodyPanel
                                      shapes={shapes}
                                      location={response.body!.contentType}
                                    />
                                  )}
                                </div>
                              </div>
                            )}
                          </HighlightController>
                        )}
                      </ShapeFetcher>
                    ) : (
                      <>No Body Request</>
                    )}
                  </>
                )}
              </HttpBodySelector>
            </div>
          ))}
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
    paddingLeft: theme.spacing(1),
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
  bodyHeaderContainer: {},
  bodyContributionContainer: {
    marginBottom: theme.spacing(2),
  },
  bodyHeader: {
    fontSize: '1.25rem',
    fontFamily: FontFamily,
    fontWeight: 500,
    lineHeight: 1.6,
    letterSpacing: '0.0075em',
    margin: theme.spacing(3, 0),
  },
  bodyDetails: {
    display: 'flex',
    width: '100%',
    height: '100%',
    '& > div': {
      width: '50%',
      padding: theme.spacing(0, 1),
    },
  },
  panel: {
    position: 'sticky',
    top: 50,
    alignSelf: 'flex-start',
  },
}));
