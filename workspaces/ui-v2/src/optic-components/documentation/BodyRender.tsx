import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { IShapeRenderer } from '../shapes/ShapeRenderInterfaces';
import { RenderRootShape } from '../shapes/ShapeRowBase';
import { ShapeRenderStore } from '../shapes/ShapeRenderContext';
import { ChoiceTabs } from '../shapes/OneOfTabs';

export type BodyRenderProps = {
  shape: IShapeRenderer;
  location: string;
  style: any;
};

export function BodyRender(props: BodyRenderProps) {
  const classes = useStyles();
  const [showExample, setValue] = useState('example');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [showExample]);

  return (
    <div className={classes.wrapper} style={props.style}>
      <div className={classes.header}>
        <div>{props.location}</div>
        <div style={{ flex: 1 }} />
        <ChoiceTabs
          value={showExample}
          setValue={setValue}
          choices={[
            { label: 'example', id: 'example' },
            { label: 'shape', id: 'shape' },
          ]}
        />
      </div>
      <div className={classes.content} ref={contentRef}>
        <ShapeRenderStore showExamples={showExample === 'example'}>
          <RenderRootShape shape={props.shape} />
        </ShapeRenderStore>
      </div>
    </div>
  );
}

export type CodeBlockProps = {
  header?: any;
  children: any;
  headerText?: string;
};

export function CodeBlock({ header, children, headerText }: CodeBlockProps) {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <div className={classes.header}>{headerText || header}</div>
      <div className={classes.content} style={{ padding: 0 }}>
        {children}
      </div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  wrapper: {
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  headerRegion: {
    display: 'flex',
    flexDirection: 'row',
  },
  content: {
    paddingTop: 8,
    paddingBottom: 8,
    borderTop: 'none',
    maxHeight: '80vh',
    overflowY: 'scroll',
    borderLeft: '1px solid #e4e8ed',
    borderRight: '1px solid #e4e8ed',
    borderBottom: '1px solid #e4e8ed',
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 4,
  },
  header: {
    backgroundColor: '#e4e8ed',
    color: '#4f566b',
    flex: 1,
    fontSize: 13,
    height: 35,
    display: 'flex',
    fontWeight: 400,
    paddingLeft: 13,
    fontFamily: 'Roboto',
    alignItems: 'center',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
    borderBottom: '1px solid #e2e2e2',
  },
}));
