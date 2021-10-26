import React, { useEffect, useState } from 'react';
import { OpenAPITraverser, factsToChangelog, OpenAPIV3, parseOpenAPIWithSourcemap } from '@useoptic/openapi-utilities'
import * as yaml from 'js-yaml';

interface OpenApiViewerProps {
  choices: string[]
  selected?: string
  contents?: string
  onSelect: (choice: string) => any
}
function OpenApiViewer(props: OpenApiViewerProps) {
  const [text, setText] = useState<string>('');
  useEffect(() => {
    async function task() {
      const baseUrl = `http://localhost:5000`;
      const response = await fetch(`${baseUrl}${props.selected}`)
      const text = await response.text();
      setText(text);
    }
    if (props.selected) {
      task();
    }
  }, [props.selected])

  return (
    <div>
      <select style={{ width: '100%' }} onChange={(e) => props.onSelect(e.target.value)} value={props.selected}>
        {props.choices.map((choice: string) => <option key={choice} value={choice}>{choice}</option>)}
      </select>
      <textarea defaultValue={text} style={{ width: '100%', height: '50vh', padding: '1em' }}></textarea>
    </div>
  )
}
interface TextualDiffViewerProps {
  before?: string,
  after?: string
}
function TextualDiffViewer(props: TextualDiffViewerProps) {
  return (
    <div>text diffs</div>
  )
}

interface OpenApiChangeViewerProps {
  before?: string
  beforeContents: string
  after?: string
  afterContents: string
}
function OpenApiChangeViewer(props: OpenApiChangeViewerProps) {
  const [facts, setFacts] = useState<any[]>([]);
  const [changes, setChanges] = useState<any[]>([]);
  useEffect(() => {
    async function task() {
      const baseUrl = `http://localhost:5000`;

      const resolved1 = yaml.load(props.beforeContents)
      //const resolved1 = (await parseOpenAPIWithSourcemap(`${baseUrl}${props.before}`)).jsonLike
      debugger
      const traverser1 = new OpenAPITraverser();
      traverser1.traverse(resolved1 as OpenAPIV3.Document);
      const facts1 = traverser1.accumulator.allFacts();
      setFacts(facts1);

      const resolved2 = yaml.load(props.afterContents);
      //const resolved2 = (await parseOpenAPIWithSourcemap(`${baseUrl}${props.after}`)).jsonLike
      debugger
      const traverser2 = new OpenAPITraverser();
      traverser2.traverse(resolved2 as OpenAPIV3.Document);
      const facts2 = traverser2.accumulator.allFacts();

      const changes = factsToChangelog(facts1, facts2)
      setChanges(changes);
      console.log({ facts1, facts2, changes })
    }
    if (props.before && props.after) {

      task();
    } else {
      setFacts([])
      setChanges([]);
    }
  }, [props.before, props.after, props.beforeContents, props.afterContents])
  return (
    <div>
      <div>observations</div>
      <div>changes
        <ul>
          {changes.map((change: any) => {
            return (<li><pre>{JSON.stringify(change)}</pre></li>)
          })}
        </ul>
      </div>
    </div>
  )
}


function App() {
  const [beforeChoice, setBeforeChoice] = useState<string | undefined>();
  const [beforeContents, setBeforeContents] = useState<string>('');
  const [afterChoice, setAfterChoice] = useState<string | undefined>();
  const [afterContents, setAfterContents] = useState<string>('');
  const [choices, setChoices] = useState<string[]>([]);

  useEffect(() => {
    async function task() {
      const baseUrl = `http://localhost:5000`;
      const response = await fetch(baseUrl);
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const files = Array.from(doc.querySelectorAll('a')).map(x => x.href.substring(baseUrl.length))
      setChoices(files);
    }
    task();
  }, [])
  useEffect(() => {
    async function task() {
      const baseUrl = `http://localhost:5000`;
      const response = await fetch(`${baseUrl}${afterChoice}`)
      const text = await response.text();
      setAfterContents(text);
    }
    if (afterChoice) {
      task();
    }
  }, [afterChoice])
  useEffect(() => {
    async function task() {
      const baseUrl = `http://localhost:5000`;
      const response = await fetch(`${baseUrl}${beforeChoice}`)
      const text = await response.text();
      setBeforeContents(text);
    }
    if (beforeChoice) {
      task();
    }
  }, [beforeChoice])

  return (
    <div className="App">
      <div style={{ display: 'flex' }}>
        <OpenApiViewer choices={choices} selected={beforeChoice} contents={beforeContents} onSelect={setBeforeChoice} />
        <OpenApiViewer choices={choices} selected={afterChoice} contents={afterContents} onSelect={setAfterChoice} />
      </div>
      <div style={{ display: 'flex' }}>
        <TextualDiffViewer before={beforeChoice} after={afterChoice} />
        <OpenApiChangeViewer
          before={beforeChoice} after={afterChoice}
          beforeContents={beforeContents} afterContents={afterContents}
        />
      </div>
    </div>
  );
}

export default App;
