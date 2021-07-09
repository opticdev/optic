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

        return (
          <React.Fragment key={diffHash}>
            <ListSubheader className={classes.locationHeader}>
              {location.data.type === 'query'
                ? 'Query Parameters'
                : location.data.type === 'request'
                ? `Request Body ${location.data.contentType}`
                : location.data.type === 'response'
                ? `${location.data.statusCode} Response ${location.data.contentType}`
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
