import React from 'react';
import ReactMarkdown from 'react-markdown';
import makeStyles from '@material-ui/styles/makeStyles';

import { Typography } from '@material-ui/core';
import { TwoColumn } from '<src>/pages/docs/components/TwoColumn';
import { BodyRender } from '<src>/pages/docs/components/BodyRender';
import { useShapeDescriptor } from '<src>/hooks/useShapeDescriptor';
import { FieldOrParameter, createFlatList } from '<src>/components';

type SharedProps = {
  location: string;
  contentType: string;
  changesSinceBatchCommitId?: string;
  bodyId: string;
  rootShapeId: string;
};

export type TwoColumnBodyProps = SharedProps & {
  description: string;
};

export function TwoColumnBodyChangelog(props: TwoColumnBodyProps) {
  const classes = useStyles();

  const shapeChoices = useShapeDescriptor(
    props.rootShapeId,
    props.changesSinceBatchCommitId
  );
  const contributions = createFlatList(shapeChoices);
  return (
    <TwoColumn
      id={props.bodyId}
      style={{ marginTop: 50 }}
      left={
        <>
          <div style={{ paddingBottom: 15 }}>
            <Typography variant="h6">{props.location}</Typography>
            <ReactMarkdown
              className={classes.contents}
              source={props.description}
            />
          </div>
          <div>
            {contributions.map((i, index) => {
              return (
                <FieldOrParameter
                  depth={i.depth}
                  name={i.name}
                  shapes={i.shapes}
                  key={i.contributionId + i.name + index}
                  value={i.description}
                />
              );
            })}
          </div>
        </>
      }
      right={
        <BodyRender
          location={props.contentType}
          shape={shapeChoices}
          style={{ marginTop: 35 }}
        />
      }
    />
  );
}

const useStyles = makeStyles((theme) => ({
  contents: {
    fontSize: 16,
    lineHeight: 1.6,
    color: '#4f566b',
    paddingRight: 50,
  },
}));
