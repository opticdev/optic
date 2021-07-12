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
              {location.descriptor.type === 'query'
                ? 'Query Parameters'
                : location.descriptor.type === 'request'
                ? `Request Body ${location.descriptor.contentType}`
                : location.descriptor.type === 'response'
                ? `${location.descriptor.statusCode} Response ${location.descriptor.contentType}`
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
