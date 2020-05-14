import React from 'react';

export default function (props) {
  const { href, children, ...otherProps } = props;

  return (
    <a href="#" {...otherProps}>
      {children}
    </a>
  );
}
