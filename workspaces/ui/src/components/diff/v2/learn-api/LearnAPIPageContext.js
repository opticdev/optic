import React, { useState } from 'react';
import pathToRegexp from 'path-to-regexp';
import { pathComponentsToString } from '../AddUrlModal';

export const LearnAPIPageContext = React.createContext({});

export function LearnAPIStore({ children, allUrls }) {
  const [toDocument, setToDocument] = useState([]);
  const [basepath, setBasepath] = useState('/');
  const [learningInProgress, setLearningInProgress] = useState(false);
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

      const shouldHideFromIgnore = !i.path.startsWith(basepath);

      return matchesAToDocument || shouldHideFromIgnore;
    })
    .map((i) => i.id);

  const startLearning = (type) => {
    setLearningInProgress(true);
    //do magic....
  };

  const value = {
    basepath,
    setBasepath,
    toDocument,
    learningInProgress,
    startLearning,
    checkedIds,
    shouldHideIds,
    pathExpressions,
    highlightAlsoMatching,
    updatePathExpression,
    addRow: (row) => {
      if (!checkedIds.includes(row.id)) {
        setToDocument((current) => [...current, row]);
        setHighlight([]);
      }
    },
    toggleRow: (row) => {
      if (checkedIds.includes(row.id)) {
        setToDocument((current) => [...current].filter((i) => i.id !== row.id));
      } else {
        setToDocument((current) => [...current, row]);
      }
    },
  };

  return (
    <LearnAPIPageContext.Provider value={value}>
      {children}
    </LearnAPIPageContext.Provider>
  );
}
