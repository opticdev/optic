import React from 'react';
import {Typography, withStyles} from '@material-ui/core';
import CardContent from '@material-ui/core/CardContent';
import {ExampleToolTip} from '../DiffCard';

const styles = theme => ({
  labels: {
    fontSize: 17,
    marginRight: 2,
    display: 'flex',
    marginBottom: 3,
    fontWeight: 500,
    borderBottom: '1px solid #e2e2e2',
    textTransform: 'uppercase'
  },
  text: {
    fontSize: 15,
    fontWeight: 100,
    lineHeight: 'normal'
  },
  locatedIn: {
    marginTop: 10,
    color: '#a7a7a7'
  },
  desc: {
    marginTop: 6
  }
});

const DiffRender = withStyles(styles)(({locatedIn, expected, observed, example, classes}) => {

  const locatedInComp = locatedIn &&
    <Typography variant="caption" component="div" style={{
      flex: 1,
      textAlign: 'right',
      color: '#b4b4b4'
    }}>In {locatedIn}</Typography>

  return (
    <div>

      {expected &&
      <Typography variant="subtitle1" className={classes.text}>
        <div className={classes.labels}><span style={{color: '#566c81'}}>Expected</span> {locatedIn && locatedInComp} </div>
        <div className={classes.desc}>{expected}</div>
      </Typography>
      }

      <Typography variant="subtitle1" className={classes.text} style={{marginTop: 11}}>
        <div className={classes.labels}>Observed { (!expected && locatedIn) ? locatedInComp : null}</div>
        <div className={classes.desc}>{observed}</div>
      </Typography>


      {example && (
        <ExampleToolTip example={example}>
          <Typography variant="overline"
                      color="primary"
                      style={{marginTop: 5, cursor: 'pointer'}}>
            See Example</Typography>
        </ExampleToolTip>
      )}

    </div>
  );
});

export function DiffToCopy(diff) {
  const diffJs = diff.asJs;
  const [type, diffData] = Object.entries(diff.asJs)[0];

  switch (type) {
    //operation level diffs
    case 'UnmatchedHttpStatusCode':
      return <DiffRender observed={`${diffData.statusCode} response`}/>;
    case 'UnmatchedHttpMethod':
      return <DiffRender observed={`${diffData.method} request`}/>;
    //content type diffs
    case 'UnmatchedResponseContentType':
      return `Optic observed a new content-type for the ${diffData.statusCode} response body`;
    case 'UnmatchedRequestContentType':
      return `Optic observed a new content-type for the request body`;

    //first time shapes observed
    case 'UnmatchedResponseBodyShape': {
      const [expected, observed, example] = ShapeDiffToCopy(diffData.shapeDiff);
      return <DiffRender locatedIn={`${diffData.responseStatusCode} response body`}
                         expected={expected}
                         example={example}
                         observed={observed}/>;
    }
    case 'UnmatchedRequestBodyShape': {
      const [expected, observed, example] = ShapeDiffToCopy(diffData.shapeDiff);
      return <DiffRender locatedIn={`request body`}
                         expected={expected}
                         example={example}
                         observed={observed}/>;
    }

    default:
      return type;
  }
}


export function ShapeDiffToCopy(diff) {
  const [type, diffData] = Object.entries(diff)[0];

  switch (type) {
    case 'NoExpectedShape':
      return [undefined, 'A shape for an unknown part of the spec', diffData.actual];
    //top level for body
    case 'UnsetShape':
      return [undefined, `A new body with shape`, diffData.actual];
    case 'UnsetValue':
      return ['A body', 'No body'];
    case 'NullValue':
      return [<>Expected Body</>, <>Key <b>{diffData.key}</b> as null</>];
    case 'ShapeMismatch':
      return [undefined, `The body shape has changed`, diffData.actual];
    case 'ListItemShapeMismatch':
      return ['List[???]', 'Items in the list that do not match', diffData.actualList]
    case 'UnsetObjectKey':
      return [<>Key <b>{diffData.key}</b> to be present</>, <>Key <b>{diffData.key}</b> missing</>];

    case 'NullObjectKey':
      return [<>Key <b>{diffData.key}</b> to be present</>, <>Key <b>{diffData.key}</b> as null</>];

    case 'UnexpectedObjectKey':
      return [undefined, <>New field <b>{diffData.key}</b></>, diffData.actual];
    case 'KeyShapeMismatch':
      return [<>Key <b>{diffData.key}</b> to be present</>, <>Key <b>{diffData.key}</b> missing</>, diffData.actual];
    case 'MultipleInterpretations':
      return [<>Key <b>{diffData.key}</b> to be present</>, <>Key <b>{diffData.key}</b> missing</>, diffData.actual];

    default:
      return type;
  }
}
