import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { IconButton, ListItem, Checkbox } from '@material-ui/core';
import { methodColorsDark, primary } from '<src>/styles';
import AddIcon from '@material-ui/icons/Add';
import padLeft from 'pad-left';
import { LightTooltip } from '<src>/components';
import classNames from 'classnames';
import ClearIcon from '@material-ui/icons/Clear';
import isEqual from 'lodash.isequal';
import { useSharedDiffContext } from '<src>/pages/diffs/contexts/SharedDiffContext';
import { IUndocumentedUrl } from '<src>/pages/diffs/contexts/SharedDiffState';
import {
  PathComponentAuthoring,
  urlStringToPathComponents,
  makePattern,
} from '../utils';

export type UndocumentedUrlProps = {
  style: Record<string, any>;
  index: number;
  data: {
    handleBulkModeSelection: (path: string, method: string) => void;
    handleSelection: (path: string, method: string) => void;
    undocumentedUrls: IUndocumentedUrl[];
    isBulkMode: boolean;
    isKnownPath: boolean;
    isSelected: (path: string, method: string) => boolean;
  };
};

export function UndocumentedUrl({
  index,
  style,
  data: {
    handleSelection,
    undocumentedUrls,
    isBulkMode,
    handleBulkModeSelection,
    isSelected,
  },
}: UndocumentedUrlProps) {
  const undocumentedUrl = undocumentedUrls[index];
  const { method, path, hide, isKnownPath } = undocumentedUrl;
  const classes = useStyles();
  const { persistWIPPattern, wipPatterns } = useSharedDiffContext();

  const paddedMethod = padLeft(method, 6, ' ');
  const methodColor = methodColorsDark[method.toUpperCase()];

  const [components, setComponents] = useState<PathComponentAuthoring[]>(
    wipPatterns[path + method]
      ? wipPatterns[path + method].components
      : urlStringToPathComponents(path)
  );

  function initialNameForComponent(newIndex: number): string {
    const otherPathComponents = Object.values(wipPatterns).filter(
      ({ components: wipComponents }) => {
        const a = wipComponents
          .slice(0, newIndex - 1)
          .map((c) => ({ name: c.name, isParameter: c.isParameter }));
        const b = components
          .slice(0, newIndex - 1)
          .map((c) => ({ name: c.name, isParameter: c.isParameter }));

        return isEqual(a, b);
      }
    );
    if (otherPathComponents.length === 0) {
      return '';
    } else {
      const firstMatchingParamName = otherPathComponents
        .map(({ components: wipComponents }) =>
          wipComponents.find((param) => param.index === newIndex)
        )
        .filter((param) => param && param.isParameter)[0];
      return firstMatchingParamName ? firstMatchingParamName.name : '';
    }
  }

  const onChange = (index: number) => (parameter: PathComponentAuthoring) => {
    const newSet = [...components];
    if (parameter.isParameter && !parameter.name) {
      newSet[index] = {
        ...parameter,
        isParameter: false,
        name: parameter.originalName,
      };
    } else {
      newSet[index] = parameter;
    }
    setComponents(newSet);
    persistWIPPattern(path, method, newSet);
  };

  if (hide) {
    return null;
  }

  return (
    <ListItem
      disableRipple
      divider
      disableGutters
      style={{ display: 'flex', ...style }}
      button
      onClick={() =>
        isBulkMode
          ? handleBulkModeSelection(path, method)
          : handleSelection(
              isKnownPath ? path : makePattern(components),
              method
            )
      }
    >
      <div style={{ flex: 1 }}>
        <div className={classes.wrapper}>
          <div className={classes.pathWrapper}>
            <div className={classes.method} style={{ color: methodColor }}>
              {paddedMethod.toUpperCase()}
            </div>
            {isKnownPath ? (
              <div
                className={classes.pathComponent}
                style={{ fontWeight: 800 }}
              >
                {path}
              </div>
            ) : (
              <div
                className={classes.componentsWrapper}
                onClick={(e) => e.stopPropagation()}
              >
                {components.map((i, index) => (
                  <div
                    key={i.originalName}
                    style={{ display: 'flex', flexDirection: 'row' }}
                  >
                    {components.length > index && (
                      <span className={classes.pathComponent}>/</span>
                    )}
                    <PathComponentRender
                      pathComponent={i}
                      initialNameForComponent={initialNameForComponent}
                      onChange={onChange(index)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {isKnownPath && (
        <div
          className={classes.pathComponent}
          style={{ paddingLeft: 10, fontSize: 12 }}
        >
          known path
        </div>
      )}
      <div style={{ paddingRight: 8 }}>
        {isBulkMode ? (
          <Checkbox checked={isSelected(path, method)} />
        ) : (
          <LightTooltip title="Review Endpoint" enterDelay={1000}>
            <IconButton size="small" color="primary">
              <AddIcon />
            </IconButton>
          </LightTooltip>
        )}
      </div>
    </ListItem>
  );
}

export type PathComponentProps = {
  pathComponent: PathComponentAuthoring;
  initialNameForComponent: (index: number) => string;
  onChange: (pathParameter: PathComponentAuthoring) => void;
};

function PathComponentRender({
  onChange,
  pathComponent,
  initialNameForComponent,
}: PathComponentProps) {
  const classes = useStyles();
  const [name, setName] = useState(pathComponent.name);

  const onStartEdit = () => {
    const defaultValue = initialNameForComponent(pathComponent.index);
    if (defaultValue.length) {
      setName(defaultValue);
      onChange({ ...pathComponent, isParameter: true, name: defaultValue });
    } else {
      setName('');
      onChange({
        ...pathComponent,
        isParameter: true,
      });
    }
  };

  const placeholder = 'name path parameter';
  if (pathComponent.isParameter) {
    return (
      <div className={classes.pathComponent}>
        <span className={classes.pathComponentInput}>{'{'}</span>
        <input
          autoFocus
          value={name}
          placeholder={placeholder}
          onKeyDown={(e) => {
            // stop editing on enter, on escape or on backspace when empty
            if (
              e.keyCode === 13 ||
              e.keyCode === 27 ||
              (!name && e.keyCode === 8)
            ) {
              e.currentTarget.blur();
            }
          }}
          onChange={(e) => {
            const name = e.target.value.replace(/\s/g, '');
            setName(name);
            onChange({
              ...pathComponent,
              isParameter: true,
              name,
            });
          }}
          style={{
            width: name
              ? `${name.length * 7 + 8}px`
              : `${placeholder.length * 8}px`,
          }}
          className={classNames(
            classes.pathComponent,
            classes.pathComponentInput
          )}
        />
        <IconButton
          size="small"
          color="primary"
          id="delete-button"
          onClick={() => {
            onChange({
              ...pathComponent,
              name: pathComponent.originalName,
              isParameter: false,
            });
          }}
        >
          <ClearIcon style={{ width: 10, height: 10 }} />
        </IconButton>
        <span className={classes.pathComponentInput}>{'}'}</span>
      </div>
    );
  } else {
    return (
      <div
        onClick={() => onStartEdit()}
        className={classNames(
          classes.pathComponent,
          classes.pathComponentButton
        )}
      >
        {pathComponent.originalName}
      </div>
    );
  }
}

const useStyles = makeStyles((theme) => ({
  method: {
    whiteSpace: 'pre',
    fontFamily: 'Ubuntu Mono',
    cursor: 'default',
    marginRight: 6,
  },
  pathWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
  },
  componentsWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  endpointName: {
    fontSize: 12,
    fontWeight: 400,
    fontFamily: 'Ubuntu',
    pointerEvents: 'none',
    color: '#2a2f45',
  },
  fullPath: {
    fontFamily: 'Ubuntu Mono',
    marginLeft: 7,
    color: '#697386',
  },
  pathComponent: {
    fontFamily: 'Ubuntu Mono',
    marginLeft: 1,
    color: '#697386',
  },
  pathComponentButton: {
    cursor: 'pointer',
    '&:hover': {
      color: primary,
      fontWeight: 600,
    },
  },
  pathComponentInput: {
    fontSize: 14,
    border: 'none',
    outline: 'none',
    fontWeight: 800,
    color: primary,
  },
  wrapper: {
    display: 'flex',
    alignItems: 'flex-start',
  },
}));
