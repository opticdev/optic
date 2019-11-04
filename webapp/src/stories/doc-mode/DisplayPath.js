import Typography from '@material-ui/core/Typography';
import {DocGrey, methodColors} from './DocConstants';
import React from 'react';

export function DisplayPath({url, method}) {
  return (
    <span>
      <Typography variant="body" component="span" style={{
        fontWeight: 600,
        color: methodColors[method.toUpperCase()]
      }}>{method.toUpperCase()}</Typography>
                  <Typography variant="body" component="span"
                              style={{marginLeft: 9, color: DocGrey}}>{url}</Typography>
    </span>
  );
}
