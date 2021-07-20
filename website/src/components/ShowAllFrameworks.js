import React from 'react';

import PreviewPageModal from './Modal';
import { Grid, Link, Typography } from '@material-ui/core';
import { SubtleBlueBackground } from './theme';

const frameworks = require('../../generate/results/frameworks');

const contents = frameworks.data.map((i, index) => {
  const Component = frameworks.components[i.slug] ? (
    frameworks.components[i.slug].default
  ) : (
    <></>
  );

  const icon = i.metadata.icon || '/img/langs/rust.svg';

  return (
    <Grid item xs={12} sm={2}>
      <PreviewPageModal
        key={index}
        link={i.link}
        title={`Collect traffic from ${i.name}`}
        Source={<Component key={index} />}
      >
        <img src={icon} height={13} style={{ marginRight: 10 }} />
        <Typography
          variant="subtitle2"
          style={{ fontSize: 17, cursor: 'pointer' }}
          component={Link}
        >
          {i.name}
        </Typography>
      </PreviewPageModal>
    </Grid>
  );
});

export function ShowAllFrameworks() {
  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      <Grid
        container
        style={{
          padding: 15,
        }}
      >
        {contents}
      </Grid>
    </div>
  );
}
