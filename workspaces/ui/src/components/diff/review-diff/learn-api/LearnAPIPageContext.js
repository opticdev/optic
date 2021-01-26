import React, { useState } from 'react';
import pathToRegexp from 'path-to-regexp';
import { useServices } from '../../../../contexts/SpecServiceContext';

export const LearnAPIPageContext = React.createContext({});

export function LearnAPIStore({
  children,
  allUrls,
  allUndocumentedEndpoints,
  onChange,
}) {
  const { specService } = useServices();
  const [toDocument, setToDocument] = useState([]);
  const [endpointsToDocument, setEndpointsToDocument] = useState([]);
  const [ignoredIds, setIgnoredIds] = useState([]);
  const [basepath, setBasepath] = useState('');
  const checkedIds = toDocument.map((i) => i.id);
  const [pathExpressions, changePathExpressions] = useState({});

  const [highlightAlsoMatching, setHighlight] = useState([]);

  const updatePathExpression = (id, expression) => {
    changePathExpressions((state) => ({ ...state, [id]: expression }));

    const pathString = pathComponentsToString(expression.pathComponents);
    const regex = pathToRegexp(pathString, [], { start: true, end: true });

    const current = allUrls.find((i) => i.id === id);

    const matchingUrlsId = Array.from(
      allUrls
        .filter((row) => row.method === current.method && regex.exec(row.path))
        .map((i) => i.id)
        .filter((i) => i !== current.id) // don't self match
    );
    setHighlight(matchingUrlsId);
  };

  const currentPathExpressions = toDocument.map((i) => ({
    ...i,
    pathExpression: pathExpressions[i.id].pathExpression,
    regex: (() => {
      const pathString = pathComponentsToString(
        pathExpressions[i.id].pathComponents
      );
      return pathToRegexp(pathString, [], { start: true, end: true });
    })(),
  }));

  const shouldHideIds = allUrls
    .filter((i) => {
      const isAToDocument = toDocument.find((td) => td.id === i.id);
      if (isAToDocument) return false; // these always show

      const matchesAToDocument = currentPathExpressions.some(
        (toDocumentWithRegex) => {
          if (toDocumentWithRegex.method === i.method) {
            return Boolean(toDocumentWithRegex.regex.exec(i.path));
          } else {
            return false;
          }
        }
      );

      const shouldHideFromIgnore =
        !i.path.startsWith(basepath) || ignoredIds.includes(i.id);

      return matchesAToDocument || shouldHideFromIgnore;
    })
    .map((i) => i.id);

  // const startLearning = (type) => {
  //   setLearningInProgress(type);
  //   //do magic....
  // };

  const toggleRow = (row, forceRemove = false) => {
    if (checkedIds.includes(row.id) || forceRemove) {
      setToDocument((current) => [...current].filter((i) => i.id !== row.id));
    } else {
      setToDocument((current) => [...current, row]);
    }
  };

  const toggleEndpointsToDocument = ({ method, pathId, pathExpression }) => {
    const checked = endpointsToDocument.some(
      (i) => i.method === method && i.pathId === pathId
    );

    if (checked) {
      setEndpointsToDocument((current) =>
        [...current].filter(
          (i) => !(i.method === method && i.pathId === pathId)
        )
      );
    } else {
      setEndpointsToDocument((current) => [
        ...current,
        { method, pathId, pathExpression },
      ]);
    }
  };

  if (onChange) {
    onChange({
      handled:
        new Set([...shouldHideIds, ...checkedIds]).size +
        endpointsToDocument.length,
      total: allUrls.length + allUndocumentedEndpoints.length,
      endpoints: endpointsToDocument,
      toDocument: currentPathExpressions,
    });
  }

  const value = {
    basepath,
    setBasepath,
    toDocument,
    currentPathExpressions,
    // learningInProgress,
    // startLearning,
    checkedIds,
    shouldHideIds,
    pathExpressions,
    highlightAlsoMatching,
    endpointsToDocument,
    toggleEndpointsToDocument,
    updatePathExpression,
    setIgnore: (url) => {
      const pattern = `${url.method} ${url.path}`;
      setIgnoredIds((i) => [...i, url.id]);
      toggleRow(url, true);
      specService.addIgnoreRule(pattern);
    },
    reset: () => {
      setToDocument([]);
      // setLearningInProgress(false);
      changePathExpressions({});
      setHighlight([]);
    },
    addRow: (row) => {
      if (!checkedIds.includes(row.id)) {
        setToDocument((current) => [...current, row]);
        setHighlight([]);
      }
    },
    toggleRow,
  };

  return (
    <LearnAPIPageContext.Provider value={value}>
      {children}
    </LearnAPIPageContext.Provider>
  );
}

function completePathMatcherRegex(pathComponents) {
  const pathString = pathComponentsToString(pathComponents);
  const regex = pathToRegexp(pathString, [], { start: true, end: true });
  return regex;
}

function pathReducer(acc, item) {
  if (
    acc.find(
      (i) =>
        i.method === item.sample.request.method &&
        i.url === item.sample.request.url
    )
  ) {
    return acc;
  } else {
    return acc.concat({
      method: item.sample.request.method,
      url: item.sample.request.url,
      pathId: item.pathId,
      requestId: item.requestId,
      sample: item.sample,
    });
  }
}

export function pathComponentsToString(pathComponents) {
  if (pathComponents.length === 0) {
    return '/';
  }
  const s =
    '/' +
    pathComponents
      .map(({ name, isParameter }) => {
        if (isParameter) {
          const stripped = name
            .replace('{', '')
            .replace('}', '')
            .replace(':', '');
          return `:${stripped}`;
        } else {
          return name;
        }
      })
      .join('/');
  return s;
}

export function cleanupPathComponentName(name) {
  return name.replace(/[{}:]/gi, '');
}

export function trimTrailingEmptyPath(components) {
  if (components.length > 0) {
    if (components[components.length - 1].name === '') {
      return components.slice(0, -1);
    }
  }
  return components;
}

export function pathStringToPathComponents(pathString) {
  const components = pathString.split('/').map((name) => {
    const isParameter = name.charAt(0) === ':' || name.charAt(0) === '{';
    return { name, isParameter };
  });
  const [root, ...rest] = components;
  if (root.name === '') {
    return trimTrailingEmptyPath(rest);
  }
  return trimTrailingEmptyPath(components);
}
