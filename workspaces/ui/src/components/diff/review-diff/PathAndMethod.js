import React from 'react';
import Typography from '@material-ui/core/Typography';
import { methodColorsDark } from '../../docs/DocConstants';
import { LightTooltip } from '../../tooltips/LightTooltip';

export const PathAndMethod = ({ path, method }) => {
  const methodRender = (
    <Typography
      variant="body1"
      component="span"
      style={{
        fontWeight: 400,
        color: '#ffffff',
        padding: 4,
        fontSize: 11,
        borderRadius: 2,
        marginTop: -3,
        backgroundColor: methodColorsDark[method.toUpperCase()],
      }}
    >
      {method.toUpperCase()}
    </Typography>
  );
  const pathRender = (
    <Typography
      variant="subtitle1"
      component="span"
      style={{ fontSize: 12, marginLeft: 7 }}
    >
      {path}
    </Typography>
  );

  return (
    <span>
      {' '}
      {methodRender} {pathRender}{' '}
    </span>
  );
};

export const PathAndMethodMono = ({ path, method }) => {
  const methodRender = (
    <Typography
      variant="body1"
      component="div"
      style={{
        fontWeight: 400,
        fontFamily: 'Ubuntu Mono',
        color: '#ffffff',
        padding: 3,
        paddingTop: 4,
        fontSize: 10,
        borderRadius: 2,
        backgroundColor: methodColorsDark[method.toUpperCase()],
      }}
    >
      {method.toUpperCase()}
    </Typography>
  );
  const pathRender = (
    <Typography
      variant="subtitle1"
      component="div"
      style={{
        fontSize: 12,
        marginLeft: 3,
        fontFamily: 'Ubuntu Mono',
        whiteSpace: 'pre-wrap',
        maxWidth: 240,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
    >
      {path}
    </Typography>
  );

  return (
    <div style={{display: 'flex', flexWrap: 'no-wrap'}}>
      {' '}
      {methodRender} {pathRender}{' '}
    </div>
  );
};

export const PathAndMethodOverflowFriendly = ({ path, method }) => {
  const methodRender = (
    <Typography
      variant="body1"
      component="div"
      style={{
        fontWeight: 400,
        color: '#ffffff',
        fontSize: 9,
        borderRadius: 2,
        padding: 3,
        paddingTop: 4,
        backgroundColor: methodColorsDark[method.toUpperCase()],
      }}
    >
      {method.toUpperCase()}
    </Typography>
  );
  const pathRender = (
    <Typography
      variant="subtitle1"
      component="div"
      style={{
        fontSize: 10,
        marginLeft: 8,
        marginTop: 1,
        maxWidth: 265,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: 'break-all',
        whiteSpace: 'nowrap',
      }}
    >
      {path}
    </Typography>
  );

  if (path.length > 47) {
    return <LightTooltip title={<PathAndMethod method={method} path={path} />} enterDelay={500}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          paddingRight: 8,
        }}
      >
        {' '}
        {methodRender} {pathRender}{' '}
      </div>
    </LightTooltip>
  } else {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          paddingRight: 8,
        }}
      >
        {' '}
        {methodRender} {pathRender}{' '}
      </div>
    )
  }
};

export const MethodRenderLarge = ({ method, style }) => {
  return (
    <Typography
      variant="body1"
      component="span"
      style={{
        fontWeight: 400,
        color: '#ffffff',
        padding: 4,
        fontSize: 13,
        borderRadius: 2,
        marginTop: -4,
        backgroundColor: methodColorsDark[method.toUpperCase()],
        ...style,
      }}
    >
      {method.toUpperCase()}
    </Typography>
  );
};

export const PathAndMethodLarge = ({ path, method }) => {
  const methodRender = (
    <Typography
      variant="body1"
      component="span"
      style={{
        fontWeight: 400,
        color: '#ffffff',
        padding: 4,
        fontSize: 15,
        borderRadius: 2,
        marginTop: -3,
        backgroundColor: methodColorsDark[method.toUpperCase()],
      }}
    >
      {method.toUpperCase()}
    </Typography>
  );
  const pathRender = (
    <Typography
      variant="subtitle1"
      component="span"
      style={{ fontSize: 17, marginLeft: 7, fontWeight: 200 }}
    >
      {path}
    </Typography>
  );

  return (
    <span>
      {' '}
      {methodRender} {pathRender}{' '}
    </span>
  );
};

export const SquareChip = ({ label, color, bgColor, style }) => {
  return (
    <Typography
      variant="body1"
      component="span"
      style={{
        fontWeight: 400,
        color,
        padding: 4,
        fontSize: 8,
        borderRadius: 2,
        marginTop: -3,
        backgroundColor: bgColor,
        ...style,
      }}
    >
      {label}
    </Typography>
  );
};
