import React, { useEffect, useRef, useState } from "react";
import {
  OpenAPITraverser,
  factsToChangelog,
} from "@useoptic/openapi-utilities";
import { OpenAPIV3 } from "@useoptic/common";
import * as yaml from "js-yaml";
import { IChange } from "@useoptic/openapi-utilities/build/openapi3/sdk/types";
import openapiDiff from "openapi-diff";
import React, { useEffect, useRef, useState } from 'react';
import { OpenAPITraverser, factsToChangelog, OpenApiFact, IChange } from '@useoptic/openapi-utilities'
import * as yaml from 'js-yaml';

const staticServerBaseUrl = `http://localhost:5000`;

interface OpenApiViewerProps {
  choices: string[];
  selected?: string;
  contents?: string;
  onSelect: (choice: string) => any;
  onUpdateContents: (contents: string) => any;
}
function OpenApiViewer(props: OpenApiViewerProps) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState<string>("");
  useEffect(() => {
    async function task() {
      const response = await fetch(`${staticServerBaseUrl}${props.selected}`);
      const text = await response.text();
      setText(text);
    }
    if (props.selected) {
      task();
    }
  }, [props.selected]);

  return (
    <div>
      <select
        style={{ width: "100%" }}
        onChange={(e) => props.onSelect(e.target.value)}
        value={props.selected}
      >
        {props.choices.map((choice: string) => (
          <option key={choice} value={choice}>
            {choice}
          </option>
        ))}
      </select>
      <textarea
        ref={textarea}
        defaultValue={text}
        style={{ width: "100%", height: "50vh", padding: "1em" }}
      ></textarea>
      <button
        onClick={() => {
          if (textarea.current) {
            props.onUpdateContents(textarea.current.value);
          }
        }}
      >
        update contents
      </button>
    </div>
  );
}
interface TextualDiffViewerProps {
  before?: string;
  after?: string;
}
function TextualDiffViewer(props: TextualDiffViewerProps) {
  return <div>text diffs</div>;
}

interface OpenApiChangeViewerProps {
  before?: string;
  beforeContents: string;
  after?: string;
  afterContents: string;
}

async function getJson<T>(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  const body = await response.json();
  return body as T;
}
function OpenApiChangeViewer(props: OpenApiChangeViewerProps) {
  const [factsBefore, setFactsBefore] = useState<any[]>([]);
  const [factsAfter, setFactsAfter] = useState<any[]>([]);
  const [changes, setChanges] = useState<any[]>([]);
  //@ts-ignore
  global.optic = {
    ...props,
    factsBefore,
    factsAfter,
    changes,
  };
  useEffect(() => {
    async function task() {
      const traverser1 = new OpenAPITraverser();
      traverser1.traverse(
        yaml.load(props.beforeContents) as OpenAPIV3.Document
      );
      const facts1 = traverser1.accumulator.allFacts();
      setFactsBefore(facts1);

      const traverser2 = new OpenAPITraverser();
      traverser2.traverse(yaml.load(props.afterContents) as OpenAPIV3.Document);
      const facts2 = traverser2.accumulator.allFacts();
      setFactsAfter(facts2);

      try {
        const otherDiff = await openapiDiff.diffSpecs({
          sourceSpec: {
            content: props.beforeContents,
            location: "source.json",
            format: "openapi3",
          },
          destinationSpec: {
            content: props.afterContents,
            location: "destination.json",
            format: "openapi3",
          },
        });
      } catch (e) {
        console.error(e);
      }

      const changes = factsToChangelog(facts1, facts2);
      setChanges(changes);
      console.log({ facts1, facts2, changes });
    }
    if (
      props.before &&
      props.after &&
      props.beforeContents &&
      props.afterContents
    ) {
      task();
    } else {
      setChanges([]);
    }
  }, [props.before, props.after, props.beforeContents, props.afterContents]);

  return (
    <div style={{ display: "flex" }}>
      <div>
        <h3>changes (click to see them open in the console)</h3>
        <div>
          {changes.map((change: IChange<OpenApiFact>) => {
            return (
              <div
                style={{ display: "flex" }}
                onClick={() => {
                  console.clear();
                  console.log(change);
                }}
              >
                <div>
                  <ChangeTypeIndicator change={change} />
                </div>
                <div>{JSON.stringify(change.location.conceptualPath)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
function ChangeTypeIndicator(props: { change: IChange<OpenApiFact> }) {
  if (props.change.added) {
    return <span>+</span>;
  }
  if (props.change.removed) {
    return <span>-</span>;
  }
  return <span>&nbsp;</span>;
}

function App() {
  const [beforeChoice, setBeforeChoice] = useState<string | undefined>();
  const [beforeContents, setBeforeContents] = useState<string>("");
  const [afterChoice, setAfterChoice] = useState<string | undefined>();
  const [afterContents, setAfterContents] = useState<string>("");
  const [choices, setChoices] = useState<string[]>([]);

  useEffect(() => {
    async function task() {
      const baseUrl = `http://localhost:5000`;
      const response = await fetch(baseUrl);
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const files = Array.from(doc.querySelectorAll("a")).map((x) =>
        x.href.substring(baseUrl.length)
      );
      setChoices(files);
    }
    task();
  }, []);
  useEffect(() => {
    async function task() {
      const baseUrl = `http://localhost:5000`;
      const response = await fetch(`${baseUrl}${afterChoice}`);
      const text = await response.text();
      setAfterContents(text);
    }
    if (afterChoice) {
      task();
    }
  }, [afterChoice]);
  useEffect(() => {
    async function task() {
      const baseUrl = `http://localhost:5000`;
      const response = await fetch(`${baseUrl}${beforeChoice}`);
      const text = await response.text();
      if (!afterChoice || !afterContents) {
        setAfterChoice(beforeChoice);
      }
      setBeforeContents(text);
    }
    if (beforeChoice) {
      task();
    }
  }, [beforeChoice]);

  return (
    <div className="App">
      <div style={{ display: "flex" }}>
        <OpenApiViewer
          choices={choices}
          selected={beforeChoice}
          contents={beforeContents}
          onSelect={setBeforeChoice}
          onUpdateContents={setBeforeContents}
        />
        <OpenApiViewer
          choices={choices}
          selected={afterChoice}
          contents={afterContents}
          onSelect={setAfterChoice}
          onUpdateContents={setAfterContents}
        />
      </div>
      <div style={{ display: "flex" }}>
        {/* <TextualDiffViewer before={beforeChoice} after={afterChoice} /> */}
        <OpenApiChangeViewer
          before={beforeChoice}
          after={afterChoice}
          beforeContents={beforeContents}
          afterContents={afterContents}
        />
      </div>
    </div>
  );
}

export default App;
