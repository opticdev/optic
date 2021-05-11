import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { IconButton, ListItem, Checkbox } from '@material-ui/core';
import { methodColorsDark, primary } from '<src>/optic-components/theme';
import AddIcon from '@material-ui/icons/Add';
import padLeft from 'pad-left';
import { LightTooltip } from '<src>/optic-components/navigation/LightToolTip';
import classNames from 'classnames';
import ClearIcon from '@material-ui/icons/Clear';
import isEqual from 'lodash.isequal';
import { useSharedDiffContext } from '<src>/optic-components/hooks/diffs/SharedDiffContext';
import { IUndocumentedUrl } from '<src>/optic-components/hooks/diffs/SharedDiffState';
import {
  PathComponentAuthoring,
  urlStringToPathComponents,
  makePattern,
} from '../utils';

export type UndocumentedUrlProps = {
  style: Record<string, any>;
  index: number;
  data: {
    handleSelection: (path: string, method: string) => void;
    undocumentedUrls: IUndocumentedUrl[];
    isBulkMode: boolean;
  };
};

export function UndocumentedUrl({
  index,
  style,
  data: { handleSelection, undocumentedUrls, isBulkMode },
}: UndocumentedUrlProps) {
  const undocumentedUrl = undocumentedUrls[index];
  const { method, path, hide } = undocumentedUrl;
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
        .filter((param) => {
          if (param && param.isParameter) {
            return true;
          }
          return false;
        })[0];
      return firstMatchingParamName ? firstMatchingParamName.name : '';
    }
  }

  const onChange = (index: number) => (parameter: PathComponentAuthoring) => {
    setComponents((com) => {
      const newSet = [...com];
      if (parameter.isParameter && !parameter.name) {
        newSet[index] = {
          ...parameter,
          isParameter: false,
          name: parameter.originalName,
        };
      } else {
        newSet[index] = parameter;
      }
      persistWIPPattern(path, method, newSet);
      return newSet;
    });
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
      onClick={() => handleSelection(makePattern(components), method)}
    >
      <div style={{ flex: 1 }}>
        <div className={classes.wrapper}>
          <div className={classes.pathWrapper}>
            <div className={classes.method} style={{ color: methodColor }}>
              {paddedMethod.toUpperCase()}
            </div>
            <div
              className={classes.componentsWrapper}
              onClick={(e) => e.stopPropagation()}
            >
              {components.map((i, index) => (
                <div
                  key={index}
                  style={{ display: 'flex', flexDirection: 'row' }}
                >
                  {components.length > index && (
                    <span className={classes.pathComponent}>/</span>
                  )}
                  <PathComponentRender
                    pathComponent={i}
                    key={index}
                    initialNameForComponent={initialNameForComponent}
                    onChange={onChange(index)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ paddingRight: 5 }}>
        {isBulkMode ? (
          <Checkbox
            checked={false} // TODO change
          />
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

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (name === '' && pathComponent.isParameter) {
      const defaultValue = initialNameForComponent(pathComponent.index);
      setName(defaultValue);
      if (defaultValue.length) {
        setIsEditing(false);
        onChange({ ...pathComponent, isParameter: true, name: defaultValue });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathComponent.isParameter]);

  useEffect(() => {
    if (!isEditing && pathComponent.isParameter) {
      setIsEditing(true);
    } else if (!pathComponent.isParameter) {
      setName('');
      setIsEditing(false);
    }
    // should only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathComponent.isParameter]);

  useEffect(() => {
    setIsEditing(false);
  }, []);

  if (pathComponent.isParameter && !isEditing) {
    return (
      <div
        className={classNames(
          classes.pathComponent,
          classes.pathComponentButton
        )}
        onClick={() => {
          if (pathComponent.isParameter) {
            setIsEditing(true);
          }
        }}
      >
        <span className={classes.pathComponentInput}>{`{${name}}`}</span>
      </div>
    );
  }

  const placeholder = 'name path parameter';
  if (pathComponent.isParameter && isEditing) {
    return (
      <div className={classes.pathComponent}>
        <span className={classes.pathComponentInput}>{'{'}</span>
        <input
          autoFocus
          value={name}
          placeholder={placeholder}
          onBlur={(e) => {
            //@ts-ignore
            if (e.relatedTarget && e.relatedTarget.id === 'delete-button')
              return;
            setIsEditing(false);
            onChange({ ...pathComponent, name });
          }}
          onKeyDown={(e: any) => {
            // stop editing on enter, on escape or on backspace when empty
            if (
              e.keyCode === 13 ||
              e.keyCode === 27 ||
              (!name && e.keyCode === 8)
            ) {
              e.currentTarget.blur();
              setIsEditing(false);
            }
          }}
          onChange={(e: any) => {
            setName(e.target.value.replace(/\s/g, ''));
            onChange({
              ...pathComponent,
              isParameter: true,
            });
          }}
          style={{
            width: name
              ? `${name.length * 8 + 1}px`
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
            setIsEditing(false);
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
        onClick={() =>
          onChange({
            ...pathComponent,
            isParameter: true,
          })
        }
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
    userSelect: 'none',
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
