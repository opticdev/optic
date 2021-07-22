import React from 'react';

import { IInterpretation } from '<src>/lib/Interfaces';
import { ICopyRender } from '../components/ICopyRender';
import { makeStyles } from '@material-ui/styles';

import { List, ListItem, ListSubheader } from '@material-ui/core';

export function DiffLinks({
  allDiffs,
  setSelectedDiff,
}: {
  allDiffs: IInterpretation[];
  setSelectedDiff: (index: number) => void;
}) {
  const classes = useStyles();
  return (
    <List>
      {allDiffs.map((diff, i) => {
        const { location, diffHash, title } = diff.diffDescription;
        const isQueryParameter = location.isQueryParameter();
        const requestDescriptor = location.getRequestDescriptor();
        const responseDescriptor = location.getResponseDescriptor();

        return (
          <React.Fragment key={diffHash}>
            <ListSubheader className={classes.locationHeader}>
              {isQueryParameter
                ? 'Query Parameters'
                : requestDescriptor
                ? `Request Body ${requestDescriptor.contentType}`
                : responseDescriptor
                ? `${responseDescriptor.statusCode} Response ${responseDescriptor.contentType}`
                : 'Unknown location'}
            </ListSubheader>
            <ListItem button onClick={() => setSelectedDiff(i)}>
              <ICopyRender variant="" copy={title} />
            </ListItem>
          </React.Fragment>
        );
      })}
    </List>
  );
}

const useStyles = makeStyles((theme) => ({
  locationHeader: {
    fontSize: 10,
    height: 33,
  },
}));
