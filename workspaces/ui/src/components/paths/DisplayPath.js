import Typography from '@material-ui/core/Typography';
import {DocDarkGrey, DocGrey, methodColors, methodColorsDark} from '../requests/DocConstants';
import React from 'react';
import {LightTooltip} from '../tooltips/LightTooltip';

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

export function DisplayPathOnDark({url, method}) {
  return (
    <div style={{display: 'flex', flexDirection: 'row'}}>
      <div style={{width: 60, textAlign: 'right'}}>
      <Typography variant="body" component="span" style={{
        fontWeight: 400,
        color: '#ffffff',
        padding: 4,
        fontSize: 11,
        borderRadius: 2,
        marginTop: -3,
        backgroundColor: methodColorsDark[method.toUpperCase()]
      }}>{method.toUpperCase()}</Typography>
        </div>
      <Typography variant="body" component="span"
                  style={{marginLeft: 10, fontWeight: 200}}>{url}</Typography>
    </div>
  );
}

export function DisplayPathSidebar({url, method, purpose}) {
  return (
    <LightTooltip title={url} placement="right-end">
    <div style={{display: 'flex', flexDirection: 'row'}}>
      {/*<LightTooltip title={url}>*/}
      <div style={{width: 40, textAlign: 'right'}}>
        <Typography variant="body" component="span" style={{
          fontWeight: 400,
          color: '#ffffff',
          padding: 4,
          fontSize: 11,
          borderRadius: 2,
          marginTop: -3,
          backgroundColor: methodColorsDark[method.toUpperCase()]
        }}>{method.toUpperCase()}</Typography>
      </div>
      <Typography variant="body" component="span"
                  style={{marginLeft: 10, fontWeight: 400}}>{purpose}</Typography>
      {/*</LightTooltip>*/}
    </div>
    </LightTooltip>
  );
}

