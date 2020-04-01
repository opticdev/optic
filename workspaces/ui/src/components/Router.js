import React from 'react';
import {
  useLocation,
  Link as RouterLink,
  NavLink as RouterNavLink,
  Redirect as RouterRedirect,
  Route as RouterRoute,
  Switch
  Switch as RouterSwitch
} from 'react-router-dom';
import { useDebugPath } from '../contexts/DebugSessionContext';

export function Switch(props) {
  const debugPrefix = useDebugPath();
  const prefix = typeof props.prefix === 'undefined' ? false : props.prefix;
  const location = useLocation();
  const prefixedLocation = prefix
    ? prefixPath(location, debugPrefix)
    : location;

  return <RouterSwitch {...props} location={prefixedLocation} />;
}
Link.displayName = 'OpticSwitch';

export function Link(props) {
  const debugPrefix = useDebugPath();
  const prefix = typeof props.prefix === 'undefined' ? false : props.prefix;
  const to = prefix ? prefixPath(props.to, debugPrefix) : props.to;

  return <RouterLink {...props} to={to} />;
}
Link.displayName = 'OpticLink';

export function NavLink(props) {
  const debugPrefix = useDebugPath();
  const prefix = typeof props.prefix === 'undefined' ? false : props.prefix;
  const to = prefix ? prefixPath(props.to, debugPrefix) : props.to;

  return <RouterNavLink {...props} to={to} />;
}
NavLink.dislayName = 'OpticNavLink';

export function Redirect(props) {
  const debugPrefix = useDebugPath();
  const prefix = typeof props.prefix === 'undefined' ? false : props.prefix;
  const from = prefix ? prefixPath(props.from, debugPrefix) : props.from;
  const to = prefix ? prefixPath(props.to, debugPrefix) : props.to;

  return <RouterRedirect from={from} to={to} />;
}
Redirect.displayName = 'OpticRedirect';

export function Route(props) {
  const debugPrefix = useDebugPath();
  const path = prefixPath(props.path, debugPrefix);

  return <RouterRoute {...props} path={path} />;
}
Route.displayName = 'OpticRoute';

function prefixPath(path, prefix) {
  if (!path) {
    // skip undefined paths
    return path;
  } else if (typeof path === 'function') {
    // functions for Link's `to`
    return (location) => {
      return prefix(location, prefix);
    };
  } else if (Array.isArray(path)) {
    // array of pathnames, for Route
    return path.map((p) => prefixPath(p, prefix));
  } else if (typeof path === 'object' && path.pathname) {
    // location object
    return {
      ...path,
      pathName: prefix(path.pathname, prefix)
    };
  } else if (typeof path === 'string') {
    return `${prefix}${path}`;
  } else {
    debugger;
    throw Error('Invalid type of path to prefix with debug path');
  }
}
