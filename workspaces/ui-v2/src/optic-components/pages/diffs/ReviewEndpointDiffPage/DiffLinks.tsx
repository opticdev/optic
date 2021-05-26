import React, { useMemo } from 'react';
import sortBy from 'lodash.sortby';

import {
  IInterpretation,
  IRequestBodyLocation,
  IResponseBodyLocation,
} from '../../../../lib/Interfaces';
import { ICopyRender } from '../../../diffs/render/ICopyRender';
import { makeStyles } from '@material-ui/styles';

import { List, ListItem, ListSubheader } from '@material-ui/core';

type Section = {
  requestId?: string;
  responseId?: string;
  statusCode?: number;
  contentType?: string;
};

export function DiffLinks({
  allDiffs,
  setSelectedDiffHash,
}: {
  allDiffs: IInterpretation[];
  setSelectedDiffHash: (hash: string) => void;
}) {
  const classes = useStyles();
  const sections = useMemo<Section[]>(() => {
    const sections: Section[] = [];
    const inRequests: IRequestBodyLocation[] = sortBy(
      allDiffs
        .filter((i) => i.diffDescription?.location!.inRequest)
        .map((i) => i.diffDescription?.location.inRequest!),
      'contentType'
    );

    inRequests.forEach((req) => {
      const alreadyAdded = sections.find(
        (i) => i.requestId && i.requestId === req.requestId
      );
      if (!alreadyAdded) {
        sections.push({
          requestId: req.requestId,
          contentType: req.contentType,
        });
      }
    });

    const inResponses: IResponseBodyLocation[] = sortBy(
      allDiffs
        .filter((i) => i.diffDescription?.location!.inResponse)
        .map((i) => i.diffDescription?.location.inResponse!),
      'statusCode'
    );

    inResponses.forEach((res) => {
      const alreadyAdded = sections.find(
        (i) => i.responseId && i.responseId === res.responseId
      );
      if (!alreadyAdded) {
        sections.push({
          responseId: res.responseId,
          statusCode: res.statusCode,
          contentType: res.contentType,
        });
      }
    });
    return sections;
  }, [allDiffs]);

  return (
    <List>
      {sections.map((section) => {
        if (section.requestId) {
          return (
            <div key={section.requestId}>
              <ListSubheader className={classes.locationHeader}>
                {'Request Body ' + section.contentType}
              </ListSubheader>
              {allDiffs.map((i, index) => {
                if (
                  i.diffDescription?.location!.inRequest?.requestId ===
                  section.requestId
                )
                  return (
                    <ListItem
                      button
                      key={index}
                      onClick={() =>
                        setSelectedDiffHash(i.diffDescription!.diffHash)
                      }
                    >
                      <ICopyRender variant="" copy={i.diffDescription!.title} />
                    </ListItem>
                  );

                return null;
              })}
            </div>
          );
        } else if (section.responseId) {
          return (
            <div key={section.responseId}>
              <ListSubheader
                className={classes.locationHeader}
              >{`${section.statusCode} Response ${section.contentType}`}</ListSubheader>
              {allDiffs.map((i, index) => {
                if (
                  i.diffDescription?.location!.inResponse?.responseId ===
                  section.responseId
                )
                  return (
                    <ListItem
                      button
                      key={index}
                      onClick={() =>
                        setSelectedDiffHash(i.diffDescription!.diffHash)
                      }
                    >
                      <ICopyRender variant="" copy={i.diffDescription!.title} />
                    </ListItem>
                  );

                return null;
              })}
            </div>
          );
        }
        return null;
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
