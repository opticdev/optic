import React, { useEffect, useState } from 'react';

import Select, { createFilter } from 'react-select';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { integrationDocsOptions } from '../fetch-docs/IntegrationDocs';

const useStyles = makeStyles((theme) => ({
  optionStyle: {
    fontFamily: 'Ubuntu Mono',
    padding: 8,
    fontSize: 17,
    fontWeight: 900,
    paddingLeft: 12,
  },
  lang: {
    fontWeight: 300,
    color: '#2b2a2a',
    paddingRight: 15,
  },
  optionRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#e2e2e2',
    },
  },
  rootOption: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
}));

const options = integrationDocsOptions;

const filterConfig = {
  ignoreCase: true,
  trim: true,
};

const defaultFilter = createFilter(filterConfig);

const filterOptions = (candidate, input) => {
  if (defaultFilter(candidate, input)) {
    return true;
  } else {
    console.log('hello ', candidate);
    return candidate.value === 'generic';
  }
};

const Option = (props) => {
  const {
    children,
    className,
    cx,
    data,
    getStyles,
    isDisabled,
    isFocused,
    isSelected,
    innerRef,
    innerProps,
  } = props;

  const classes = useStyles();

  return (
    <div
      ref={innerRef}
      css={getStyles('option', props)}
      {...innerProps}
      className={classes.optionRow}
    >
      <div className={classes.rootOption}>
        <div className={classes.optionStyle}>{children}</div>
        <div style={{ flex: 1 }} />
        <div className={classes.lang}>{data.language}</div>
      </div>
    </div>
  );
};

const customStyles = {
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = 'opacity 300ms';

    return { ...provided, opacity, transition };
  },
};

export default ({ onChoose, setStartCommand, touchEmpty, value }) => {
  const classes = useStyles();

  const [hasShownEmpty, setHasShownEmpty] = useState(false);

  useEffect(() => {
    if (hasShownEmpty) touchEmpty();
  }, [hasShownEmpty]);

  return (
    <Select
      autoFocus
      placeholder="Select Framework..."
      value={options.find((i) => i.value === value)}
      onChange={({ value, data }) => {
        onChoose(value);
      }}
      isSearchable
      options={options}
      filterOption={filterOptions}
      components={{ Option }}
      styles={customStyles}
    />
  );
};
