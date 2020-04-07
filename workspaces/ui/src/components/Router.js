import React from 'react';
import { Link as RouterLink, NavLink as RouterNavLink } from 'react-router-dom';
import {useBaseUrl} from '../contexts/BaseUrlContext';

export function Link(props) {
  const debugPrefix = useBaseUrl();
  const prefix = typeof props.prefix === 'undefined' ? true : props.prefix;
  const to = prefix ? prefixPath(props.to, debugPrefix) : props.to;

  return <RouterLink {...props} to={to} />;
}
Link.displayName = 'OpticLink';

export function NavLink(props) {
  const debugPrefix = useBaseUrl();
  const prefix = typeof props.prefix === 'undefined' ? true : props.prefix;
  const to = prefix ? prefixPath(props.to, debugPrefix) : props.to;

  return <RouterNavLink {...props} to={to} />;
}
NavLink.displayName = 'OpticNavLink';

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
