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
      component="span"
      style={{
        fontWeight: 400,
        fontFamily: 'Ubuntu Mono',
        color: '#ffffff',
        padding: 4,
        fontSize: 10,
        borderRadius: 2,
        marginTop: 2,
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
      style={{
        fontSize: 12,
        marginLeft: 3,
        fontFamily: 'Ubuntu Mono',
      }}
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
        maxWidth: 220,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: 'break-all',
        whiteSpace: 'nowrap',
      }}
    >
      {path}
    </Typography>
  );

  return (
    <LightTooltip title={<PathAndMethod method={method} path={path} />}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          paddingLeft: 8,
          paddingRight: 8,
        }}
      >
        {' '}
        {methodRender} {pathRender}{' '}
      </div>
    </LightTooltip>
  );
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
