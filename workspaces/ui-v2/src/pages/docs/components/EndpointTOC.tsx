import * as React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { getReasonPhrase } from 'http-status-codes';
import { List, ListItem, Typography } from '@material-ui/core';
import { selectors } from '<src>/store';
import { SubtleGreyBackground } from '<src>/styles';
import { IQueryParameters, IRequest, IEndpoint } from '<src>/types';
import { goToAnchor } from '<src>/utils';

export type EndpointTOCProps = {
  query: IQueryParameters | null;
  requests: IRequest[];
  responsesByStatusCode: IEndpoint['responsesByStatusCode'];
};

function Code({ value }: { value: string }) {
  return (
    <span
      style={{
        backgroundColor: SubtleGreyBackground,
        paddingLeft: 4,
        paddingRight: 4,
      }}
    >
      {value}
    </span>
  );
}

export function EndpointTOC(props: EndpointTOCProps) {
  const classes = useStyles();

  console.log(props.responsesByStatusCode);
  return (
    <List dense>
      {props.query === null &&
      props.requests.length === 0 &&
      Object.keys(props.responsesByStatusCode).length === 0 ? (
        <Typography className={classes.none}>No bodies documented.</Typography>
      ) : null}

      {props.query && (
        <EndpointTOCRow
          label={'Query Parameters'}
          anchorLink="query-parameters"
          detail={<></>}
        />
      )}

      {props.requests.length > 0 && (
        <EndpointTOCRow
          label={'Request Body'}
          anchorLink={'request-body'}
          detail={
            <>
              consumes{' '}
              {props.requests.length > 1 ? (
                <>{props.requests.length} content types</>
              ) : (
                <Code
                  value={props.requests[0].body?.contentType || 'No Body'}
                />
              )}
            </>
          }
        />
      )}

      {selectors
        .getResponsesInSortedOrder(props.responsesByStatusCode)
        .map(([statusCode, responses]) => {
          return (
            <EndpointTOCRow
              label={`${getReasonPhrase(statusCode)} - ${statusCode} Response`}
              anchorLink={statusCode}
              key={statusCode}
              detail={
                <>
                  produces{' '}
                  {responses.length > 1 ? (
                    <>{responses.length} content types</>
                  ) : (
                    <Code value={responses[0].body?.contentType || 'No Body'} />
                  )}
                </>
              }
            />
          );
        })}
    </List>
  );
}

export type EndpointTOCRowProps = {
  label: string;
  anchorLink: string;
  detail: any;
};

export function EndpointTOCRow({
  label,
  detail,
  anchorLink,
}: EndpointTOCRowProps) {
  const classes = useStyles();

  return (
    <ListItem className={classes.row} button onClick={goToAnchor(anchorLink)}>
      <div className={classes.leftContent}>{label}</div>
      <div className={classes.rightContent}> {detail}</div>
    </ListItem>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    maxWidth: 400,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  leftContent: {
    display: 'flex',
    alignItems: 'center',
    justifyItems: 'center',
    color: 'rgb(79, 86, 107)',
    fontSize: 13,
    fontWeight: 600,
    justifyContent: 'flex-end',
    paddingRight: 10,
    fontFamily: 'Ubuntu',
  },
  rightContent: {
    color: 'rgb(79, 86, 107)',
    fontSize: 13,
    flexShrink: 1,
    paddingLeft: 4,
  },
  none: {
    color: '#8792a2',
    fontSize: 12,
    paddingLeft: 10,
  },
  h6: {
    fontSize: 13,
    fontFamily: 'Ubuntu, Inter',
    fontWeight: 500,
    lineHeight: 1.6,
    marginBottom: 8,
  },
}));
