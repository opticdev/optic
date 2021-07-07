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
      {/* TODO figure out why diffDescription can be nullable */}
      {allDiffs.map(
        (diff, i) =>
          diff.diffDescription && (
            <React.Fragment key={diff.diffDescription.diffHash}>
              <ListSubheader className={classes.locationHeader}>
                {diff.diffDescription.location.inQuery
                  ? 'Query Parameters'
                  : diff.diffDescription.location.inRequest
                  ? `Request Body ${diff.diffDescription.location.inRequest.contentType}`
                  : diff.diffDescription.location.inResponse
                  ? `${diff.diffDescription.location.inResponse.statusCode} Response ${diff.diffDescription.location.inResponse.contentType}`
                  : 'Unknown location'}
              </ListSubheader>
              <ListItem button onClick={() => setSelectedDiff(i)}>
                <ICopyRender variant="" copy={diff.diffDescription.title} />
              </ListItem>
            </React.Fragment>
          )
      )}
    </List>
  );
}

const useStyles = makeStyles((theme) => ({
  locationHeader: {
    fontSize: 10,
    height: 33,
  },
}));
