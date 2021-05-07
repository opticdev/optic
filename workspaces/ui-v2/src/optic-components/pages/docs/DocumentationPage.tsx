import React, { FC, useMemo } from 'react';
import { NavigationRoute } from '../../navigation/NavigationRoute';
import {
  useDocumentationPageLink,
  useEndpointPageLink,
} from '../../navigation/Routes';
import groupBy from 'lodash.groupby';
import classNames from 'classnames';
import { CenteredColumn } from '../../layouts/CenteredColumn';
import { IEndpoint, useEndpoints } from '../../hooks/useEndpointsHook';
import { List, ListItem, Typography } from '@material-ui/core';
import makeStyles from '@material-ui/styles/makeStyles';
import { EndpointName, PromptNavigateAway, PathParameters } from '../../common';
import { EndpointNameMiniContribution } from '../../documentation/Contributions';
import {
  ContributionEditingStore,
  useContributionEditing,
} from '../../hooks/edit/Contributions';
import { EditContributionsButton } from './EditContributionsButton';
import { FullWidth } from '../../layouts/FullWidth';
import { EndpointNameContribution } from '../../documentation/Contributions';
import { MarkdownBodyContribution } from '../../documentation/MarkdownBodyContribution';
import { TwoColumn } from '../../documentation/TwoColumn';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { DocsFieldOrParameterContribution } from '../../documentation/Contributions';
import { EndpointTOC } from '../../documentation/EndpointTOC';
import { useEndpointBody } from '../../hooks/useEndpointBodyHook';
import { CodeBlock } from '../../documentation/BodyRender';
import { SubtleBlueBackground } from '../../theme';
import { TwoColumnBody } from '../../documentation/RenderBody';
import { getEndpointId } from '../../utilities/endpoint-utilities';
import { Loading } from '../../loaders/Loading';
import { ChangesSinceDropdown } from '../../changelog/ChangelogDropdown';
import { useBaseUrl } from '../../hooks/useBaseUrl';
import { useAppConfig } from '../../hooks/config/AppConfiguration';
import { useChangelogStyles } from '../../changelog/ChangelogBackground';
import { IShapeRenderer, JsonLike } from '../../shapes/ShapeRenderInterfaces';
import { useRunOnKeypress } from '<src>/optic-components/hooks/util';

export function DocumentationPages(props: any) {
  const documentationPageLink = useDocumentationPageLink();
  const endpointPageLink = useEndpointPageLink();
  const history = useHistory();
  const baseUrl = useBaseUrl();

  const onEndpointClicked = (pathId: string, method: string) => {
    history.push(endpointPageLink.linkTo(pathId, method));
  };

  return (
    <ContributionEditingStore>
      <>
        <NavigationRoute
          path={baseUrl}
          Component={(props: any) => (
            <DocumentationRootPage
              {...props}
              onEndpointClicked={onEndpointClicked}
            />
          )}
          AccessoryNavigation={DocsPageAccessoryNavigation}
        />
        <NavigationRoute
          path={documentationPageLink.path}
          Component={(props: any) => (
            <DocumentationRootPage
              {...props}
              onEndpointClicked={onEndpointClicked}
            />
          )}
          AccessoryNavigation={DocsPageAccessoryNavigation}
        />
        <NavigationRoute
          path={endpointPageLink.path}
          Component={EndpointRootPage}
          AccessoryNavigation={DocsPageAccessoryNavigation}
        />
      </>
    </ContributionEditingStore>
  );
}

export function DocsPageAccessoryNavigation(props: any) {
  const appConfig = useAppConfig();
  const { isEditing, pendingCount } = useContributionEditing();

  return (
    <div style={{ paddingRight: 10, display: 'flex', flexDirection: 'row' }}>
      <PromptNavigateAway shouldPrompt={isEditing && pendingCount > 0} />
      {appConfig.navigation.showChangelog && <ChangesSinceDropdown />}
      {appConfig.documentation.allowDescriptionEditing && (
        <EditContributionsButton />
      )}
    </div>
  );
}

export function DocumentationRootPage(props: {
  onEndpointClicked: (pathId: string, method: string) => void;
  changelogBatchId?: string;
}) {
  const { endpoints, loading } = useEndpoints(props.changelogBatchId);
  //@nic TODO fork changelog from documentation page
  const isChangelogPage = props.changelogBatchId !== undefined;

  const {
    isEditing,
    pendingCount,
    setCommitModalOpen,
  } = useContributionEditing();

  const grouped = useMemo(() => groupBy(endpoints, 'group'), [endpoints]);
  const tocKeys = Object.keys(grouped).sort();
  const changelogStyles = useChangelogStyles();
  const styles = useStyles();
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

  if (loading) {
    return <Loading />;
  }

  return (
    <CenteredColumn maxWidth="md" style={{ marginTop: 35 }}>
      <List dense onKeyPress={onKeyPress}>
        {tocKeys.map((tocKey) => {
          return (
            <div key={tocKey}>
              <Typography
                variant="h6"
                style={{ fontFamily: 'Ubuntu Mono', fontWeight: 600 }}
              >
                {tocKey}
              </Typography>
              {grouped[tocKey].map((endpoint: IEndpoint, index: number) => {
                return (
                  <ListItem
                    key={index}
                    button
                    disableRipple
                    disableGutters
                    style={{ display: 'flex' }}
                    onClick={() =>
                      props.onEndpointClicked(endpoint.pathId, endpoint.method)
                    }
                    className={classNames({
                      [changelogStyles.added]:
                        isChangelogPage && endpoint.changelog?.added,
                      [changelogStyles.updated]:
                        isChangelogPage && endpoint.changelog?.changed,
                    })}
                  >
                    <div style={{ flex: 1 }}>
                      <EndpointName
                        method={endpoint.method}
                        fullPath={endpoint.fullPath}
                        leftPad={6}
                      />
                    </div>
                    <div
                      style={{ paddingRight: 15 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isChangelogPage ? (
                        <Typography className={styles.smallField}>
                          {endpoint.purpose || 'Unnamed Endpoint'}
                        </Typography>
                      ) : (
                        <EndpointNameMiniContribution
                          id={getEndpointId({
                            method: endpoint.method,
                            pathId: endpoint.pathId,
                          })}
                          defaultText="name for this endpoint"
                          contributionKey="purpose"
                          initialValue={endpoint.purpose}
                        />
                      )}
                    </div>
                  </ListItem>
                );
              })}
            </div>
          );
        })}
      </List>
    </CenteredColumn>
  );
}

export const EndpointRootPage: FC<
  RouteComponentProps<{
    pathId: string;
    method: string;
  }> & {
    isChangelogPage?: boolean;
    changelogBatchId: string | undefined;
  }
> = ({ isChangelogPage, match, changelogBatchId }) => {
  const { endpoints, loading } = useEndpoints();

  const { pathId, method } = match.params;

  const bodies = useEndpointBody(pathId, method, changelogBatchId);
  const styles = useStyles();
  const thisEndpoint = useMemo(
    () => endpoints.find((i) => i.pathId === pathId && i.method === method),
    [pathId, method, endpoints]
  );
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

  if (loading) {
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
    <FullWidth
      style={{ paddingTop: 30, paddingBottom: 400 }}
      onKeyPress={onKeyPress}
    >
      {/* @nic TODO fork documentation page from changelog page */}
      {isChangelogPage ? (
        <Typography className={styles.regularField}>
          {thisEndpoint.purpose || 'Unnamed Endpoint'}
        </Typography>
      ) : (
        <EndpointNameContribution
          id={endpointId}
          contributionKey="purpose"
          defaultText="What does this endpoint do?"
          initialValue={thisEndpoint.purpose}
        />
      )}
      <EndpointName
        fontSize={19}
        leftPad={0}
        method={thisEndpoint.method}
        fullPath={thisEndpoint.fullPath}
      />
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
          <TwoColumnBody
            key={index}
            changesSinceBatchCommitId={changelogBatchId}
            rootShapeId={i.rootShapeId}
            bodyId={i.requestId}
            location={'Request Body Parameters'}
            description={i.description}
          />
        );
      })}
      {bodies.responses.map((i, index) => {
        return (
          <TwoColumnBody
            key={index}
            changesSinceBatchCommitId={changelogBatchId}
            rootShapeId={i.rootShapeId}
            bodyId={i.responseId}
            location={`${i.statusCode} Response`}
            description={i.description}
          />
        );
      })}
    </FullWidth>
  );
};

const useStyles = makeStyles((theme) => ({
  smallField: {
    fontSize: 12,
    fontWeight: 400,
    fontFamily: 'Ubuntu',
    pointerEvents: 'none',
    color: '#2a2f45',
  },
  regularField: {
    fontSize: '1.25rem',
    fontFamily: 'Ubuntu, Inter',
    fontWeight: 500,
    lineHeight: 1.6,
  },
}));
