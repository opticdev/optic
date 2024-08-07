import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import {
  addedOrChangedChangelog,
  anyChangelog,
  hasChanges,
  mapChangelog,
  objectWithRemovedItems,
  removedArrayChangelogs,
  od,
  or,
  type Changelog,
  type ChangelogTree,
} from '../utils';
import { TextDiff } from './text-diff';
import { changeBgColors, changeIndicatedColors } from '../constants';
import { Issues } from '../issues/issues';
import omit from 'lodash.omit';
import type { ReactElement } from 'react';
import { useState, Fragment } from 'react';

const indentation = '  ';
const arrayLevelDash = '- ';

type InheritedChange = 'added' | 'removed';

const getInheritedChange = (
  inheritedChange: InheritedChange | undefined,
  changelog?: Changelog<any>
) =>
  inheritedChange ??
  (changelog?.type === 'added' || changelog?.type === 'removed'
    ? changelog.type
    : undefined);

export const Yaml = ({
  value,
  changelog,
  exclude,
  expandAll,
}: {
  value: any;
  changelog?: Changelog<any>;
  exclude?: string[];
  expandAll?: boolean;
}) => {
  return (
    <YamlNode
      value={value}
      changelog={changelog}
      indentLevel={0}
      exclude={exclude}
      forceExpand={true}
      expandAll={expandAll}
    />
  );
};

const isPrimitive = (x: any) => typeof x !== 'object';

const YamlNode = ({
  value,
  property,
  indentLevel,
  arrayLevel,
  changelog,
  inheritedChange,
  exclude,
  forceExpand,
  expandAll,
}: {
  value: ChangelogTree<any>;
  property?: string;
  changelog?: Changelog<any>;
  indentLevel: number;
  arrayLevel?: number;
  inheritedChange?: InheritedChange;
  exclude?: string[];
  forceExpand?: true;
  expandAll?: boolean;
}) => {
  const [expand, setExpand] = useState(
    inheritedChange === 'added' || forceExpand || hasChanges(value) || expandAll
  );

  const beforeNode =
    changelog?.type === 'changed' &&
    (!isPrimitive(changelog.before) || !isPrimitive(value)) ? (
      <YamlNode
        key="before"
        value={changelog.before}
        property={property}
        indentLevel={indentLevel}
        arrayLevel={arrayLevel}
        exclude={exclude}
        inheritedChange={'removed'}
        expandAll={expandAll}
      />
    ) : null;

  const lines: ReactElement[] = [];

  if (beforeNode) lines.push(beforeNode);

  if (value === null) {
    lines.push(
      <YamlLine
        key="null"
        indentLevel={indentLevel}
        arrayLevel={arrayLevel}
        changelog={mapChangelog(changelog, String)}
        inheritedChange={
          beforeNode ? 'added' : getInheritedChange(inheritedChange, changelog)
        }
        prefix={property ? `${property}: ` : undefined}
        value="null"
      />
    );
  } else if (Array.isArray(value)) {
    const removedItems = removedArrayChangelogs(value);
    const canExpand = objectCanExpand(
      value,
      inheritedChange,
      changelog,
      exclude
    );
    if (value.length === 0 && !removedItems?.length) {
      lines.push(
        <YamlLine
          key="arrayempty"
          indentLevel={indentLevel}
          arrayLevel={arrayLevel}
          changelog={mapChangelog(changelog, String)}
          inheritedChange={
            beforeNode
              ? 'added'
              : getInheritedChange(inheritedChange, changelog)
          }
          prefix={property ? `${property}: ` : undefined}
          value="[]"
        />
      );
    } else {
      lines.push(
        <Fragment key="array">
          {property ? (
            <YamlLine
              indentLevel={indentLevel}
              arrayLevel={arrayLevel}
              inheritedChange={
                beforeNode
                  ? 'added'
                  : getInheritedChange(inheritedChange, changelog)
              }
              prefix={
                <span>
                  {property}:
                  {canExpand && !expand ? (
                    <Box component="span" sx={{ ml: 0.5, color: 'grey.600' }}>
                      …
                    </Box>
                  ) : (
                    ''
                  )}
                </span>
              }
              toggleExpand={canExpand ? () => setExpand((e) => !e) : undefined}
            />
          ) : null}
          <YamlArray
            indentLevel={property ? indentLevel + 1 : indentLevel}
            value={value}
            arrayLevel={property ? 0 : arrayLevel}
            changelog={changelog}
            inheritedChange={
              beforeNode
                ? 'added'
                : getInheritedChange(inheritedChange, changelog)
            }
            expand={expand}
            expandAll={expandAll}
          />
        </Fragment>
      );
    }
  } else if (typeof value === 'object') {
    const allProperties = omit(objectWithRemovedItems(value), exclude ?? []);
    const canExpand = objectCanExpand(
      value,
      inheritedChange,
      changelog,
      exclude
    );
    if (Object.keys(allProperties).length === 0) {
      lines.push(
        <YamlLine
          key="objectempty"
          indentLevel={indentLevel}
          arrayLevel={arrayLevel}
          changelog={changelog}
          inheritedChange={
            beforeNode
              ? 'added'
              : getInheritedChange(inheritedChange, changelog)
          }
          prefix={property ? `${property}: ` : undefined}
          value="{}"
        />
      );
    } else {
      lines.push(
        <Fragment key="object">
          {property ? (
            <YamlLine
              indentLevel={indentLevel}
              arrayLevel={arrayLevel}
              inheritedChange={
                beforeNode
                  ? 'added'
                  : getInheritedChange(inheritedChange, changelog)
              }
              prefix={
                <span>
                  {property}:
                  {canExpand && !expand ? (
                    <Box component="span" sx={{ ml: 0.5, color: 'grey.600' }}>
                      …
                    </Box>
                  ) : (
                    ''
                  )}
                </span>
              }
              toggleExpand={canExpand ? () => setExpand((e) => !e) : undefined}
            />
          ) : null}
          <YamlObject
            changelog={changelog}
            indentLevel={property ? indentLevel + 1 : indentLevel}
            value={value}
            arrayLevel={property ? 0 : arrayLevel}
            inheritedChange={
              beforeNode
                ? 'added'
                : getInheritedChange(inheritedChange, changelog)
            }
            exclude={exclude}
            expand={expand}
            expandAll={expandAll}
          />
        </Fragment>
      );
    }
  } else {
    lines.push(
      <YamlLine
        key="primitive"
        indentLevel={indentLevel}
        arrayLevel={arrayLevel}
        changelog={beforeNode ? undefined : mapChangelog(changelog, String)}
        inheritedChange={
          beforeNode ? 'added' : getInheritedChange(inheritedChange, changelog)
        }
        prefix={property ? `${property}: ` : undefined}
        value={String(value)}
      />
    );
  }

  return <>{lines}</>;
};

const objectCanExpand = (
  value: ChangelogTree<object>,
  inheritedChange: InheritedChange | undefined,
  changelog: Changelog<any> | undefined,
  exclude?: string[]
) => {
  if (inheritedChange === 'added' || changelog?.type === 'added') return false;
  const properties = omit(value, exclude ?? []);
  return Object.entries(properties).some(
    ([key, prop]) => !anyChangelog(value[od], key) && !hasChanges(prop)
  );
};

const YamlObject = ({
  value,
  indentLevel,
  arrayLevel,
  changelog,
  inheritedChange,
  exclude,
  expand,
  expandAll,
}: {
  value: ChangelogTree<object>;
  changelog?: Changelog<any>;
  indentLevel: number;
  arrayLevel?: number;
  inheritedChange?: InheritedChange;
  exclude?: string[];
  expand?: boolean;
  expandAll?: boolean;
}) => {
  const allProperties = omit(objectWithRemovedItems(value), exclude ?? []);

  const properties = Object.entries(allProperties).filter(([key, prop]) => {
    return expand
      ? true
      : inheritedChange === 'added' ||
          anyChangelog(value[od], key) ||
          hasChanges(prop);
  });

  return (
    <>
      <Issues ruleResults={value[or]} />
      {properties.map(([key, prop], ix) => (
        <YamlNode
          value={prop}
          indentLevel={indentLevel}
          property={key}
          key={key}
          arrayLevel={ix === 0 ? arrayLevel : 0}
          changelog={anyChangelog(value[od], key)}
          inheritedChange={getInheritedChange(inheritedChange, changelog)}
          expandAll={expandAll}
        />
      ))}
    </>
  );
};

const YamlArray = ({
  value,
  indentLevel,
  arrayLevel,
  inheritedChange,
  changelog,
  expand,
  expandAll,
}: {
  value: ChangelogTree<Array<any>>;
  changelog?: Changelog<any>;
  indentLevel: number;
  arrayLevel?: number;
  inheritedChange?: InheritedChange;
  expand?: boolean;
  expandAll?: boolean;
}) => {
  const removedItems = removedArrayChangelogs(value);
  return (
    <>
      <Issues ruleResults={value[or]} />
      {value.map((val, index) =>
        expand ||
        inheritedChange === 'added' ||
        hasChanges(val) ||
        addedOrChangedChangelog(value[od], index) ? (
          <YamlNode
            value={val}
            indentLevel={indentLevel + 1}
            key={index}
            arrayLevel={index === 0 ? (arrayLevel ?? 0) + 1 : 1}
            changelog={addedOrChangedChangelog(value[od], index)}
            inheritedChange={getInheritedChange(inheritedChange, changelog)}
            forceExpand={true}
            expandAll={expandAll}
          />
        ) : null
      )}
      {(removedItems ?? []).map((changelog, index) => (
        <YamlNode
          value={changelog!.before}
          indentLevel={indentLevel + 1}
          key={index}
          arrayLevel={index === 0 ? (arrayLevel ?? 0) + 1 : 1}
          changelog={changelog}
          inheritedChange={getInheritedChange(inheritedChange, changelog)}
          forceExpand={true}
          expandAll={expandAll}
        />
      ))}
    </>
  );
};

const YamlLine = ({
  indentLevel,
  arrayLevel,
  changelog,
  inheritedChange,
  value,
  prefix,
  prefixOnly,
  toggleExpand,
}: {
  indentLevel: number;
  arrayLevel?: number;
  changelog?: Changelog<string>;
  inheritedChange?: InheritedChange;
  value?: string;
  prefix?: string | ReactElement;
  prefixOnly?: boolean;
  toggleExpand?: () => void;
}) => {
  const change = inheritedChange ?? changelog?.type;

  const bgColor =
    change && change !== 'changed' ? changeBgColors[change] : 'transparent';

  const borderColor =
    change && change !== 'changed'
      ? changeIndicatedColors[change]
      : 'transparent';

  const toggleProps = toggleExpand ? { onClick: toggleExpand } : {};

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        cursor: toggleExpand ? 'pointer' : 'default',
        backgroundColor: bgColor,
        '&:hover': toggleExpand
          ? {
              backgroundColor: 'grey.100',
            }
          : {},
      }}
      {...toggleProps}
    >
      <Typography
        component="div"
        sx={{
          fontFamily: 'Inconsolata, monospace',
          paddingLeft: 0.4,
          borderLeft: 3,
          borderColor,
          display: 'flex',
          whiteSpace: 'pre-wrap',
          flexGrow: 1,
        }}
      >
        <Box
          component="span"
          sx={{
            overflowWrap: 'anywhere',
            wordWrap: 'anywhere',
          }}
        >
          {indentation.repeat(indentLevel - (arrayLevel ?? 0))}
          {arrayLevelDash.repeat(arrayLevel ?? 0)}
          {prefix}
          {!prefixOnly ? (
            changelog?.type === 'changed' ? (
              <TextDiff value={value} changelog={changelog} />
            ) : (
              value
            )
          ) : null}
        </Box>
      </Typography>
    </Box>
  );
};
