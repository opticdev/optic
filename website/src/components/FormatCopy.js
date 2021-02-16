import React from 'react';
import processString from 'react-process-string';
export function FormatCopy(props) {
  const { value, style } = props;

  let config = [
    {
      regex: /\*\*(.*)\*\*/gim,
      fn: (key, result) => {
        return (
          <span key={key}>
            <b>{result[1]}</b>
          </span>
        );
      },
    },
  ];

  let processed = processString(config)(value);

  return <span style={style}>{processed}</span>;
}
