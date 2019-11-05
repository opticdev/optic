import React, {useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {Typography} from '@material-ui/core';
import {DocGrey, methodColors} from './DocConstants';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {secondary} from '../../theme';
import ReactJson from 'react-json-view';
import {HighlightedIDsStore} from './shape/HighlightedIDs';
import {ExampleViewer, ShapeViewerWithQuery} from './shape/ShapeViewer';
import {Show} from './Show';

const styles = theme => ({
  container: {
    borderRadius: 9,
    backgroundColor: '#4f5568',
    overflow: 'hidden',
    marginTop: 11
  },
  header: {
    backgroundColor: '#3d4256',
    padding: 4,
    paddingLeft: 10,
    display: 'flex',
    flexDirection: 'row',
    cursor: 'default'
  },
  headingText: {
    fontSize: 12,
    color: DocGrey,
    fontWeight: 500,
  },
  content: {
    padding: 10,
    paddingTop: 15,
  },
  contentType: {
    marginBottom: 12,
    fontSize: 13,
    color: DocGrey,
    fontWeight: 500
  }
});

class _DocCodeBox extends React.Component {
  render() {
    const {classes, children, title, rightRegion} = this.props;
    return (
      <div className={classes.container}>
        <div className={classes.header}>
          <Typography variant="overline" className={classes.headingText}>{title}</Typography>
          <div style={{flex: 1}}/>
          {rightRegion}
        </div>
        <div className={classes.content}>
          {children}
        </div>
      </div>
    );
  }
}

export const DocCodeBox = withStyles(styles)(_DocCodeBox);

export const EndpointOverviewCodeBox = ({title = 'Endpoint', method, url}) => {
  return (
    <DocCodeBox title={title}>
      <Typography variant="body" component="span" style={{fontWeight: 600, color: methodColors[method.toUpperCase()]}}>{method.toUpperCase()}</Typography>
      <Typography variant="body" component="span" style={{marginLeft: 9, color: DocGrey}}>{url}</Typography>
    </DocCodeBox>
  );
};

export const ShapeOverview =  withStyles(styles)(({shapeId, classes, contentType, title}) => {

  return (
    <DocCodeBox title={title}>
      {contentType && <Typography variant="subtitle1" className={classes.contentType}>{contentType}</Typography>}
      <div>RENDER THE SHAPE HERE</div>
    </DocCodeBox>
  );
});

export const ExampleOnly =  withStyles(styles)(({classes, contentType, title, example}) => {
  return (
    <DocCodeBox title={title}>
      {contentType && <Typography variant="subtitle1" className={classes.contentType}>{contentType}</Typography>}
      <HighlightedIDsStore>
        <ExampleViewer example={example}/>
      </HighlightedIDsStore>
    </DocCodeBox>
  );
});

export const ShapeOnly =  withStyles(styles)(({classes, title, shapeId}) => {
  return (
    <DocCodeBox title={title}>
      <HighlightedIDsStore>
        <ShapeViewerWithQuery shapeId={shapeId}/>
      </HighlightedIDsStore>
    </DocCodeBox>
  );
});

export const ExampleShapeViewer = withStyles(styles)(({shapeId, classes, example, title, contentType}) => {

  const [showExample, setShowExample] = useState(true);

  const rightRegion = (
    <StyledTabs value={showExample ? 0 : 1}>
      <StyledTab label="Example" onClick={() => setShowExample(true)}/>
      <StyledTab label="Shape" onClick={() => setShowExample(false)}/>
    </StyledTabs>
  );

  const exampleRender = (() => {
    return (
      <>
        <HighlightedIDsStore>
          <ExampleViewer example={{
            path: '/path/to/file',
            number: 126543,
            id: 'first_file',
            mime_type: 'image/gif',
            sha: '26a86ahdh3'
          }}/>
        </HighlightedIDsStore>
      </>
    );
  })();

  const shapeRender = (
    <HighlightedIDsStore>
      <ShapeViewerWithQuery shapeId={shapeId}/>
    </HighlightedIDsStore>
  )

  return (
    <DocCodeBox title={title} rightRegion={rightRegion}>
      {contentType && <Typography variant="subtitle1" className={classes.contentType}>{contentType}</Typography>}

      <Show when={showExample} children={exampleRender}/>
      <Show when={!showExample} children={shapeRender}/>
    </DocCodeBox>
  );
});

/* Custom Tabs */
export const StyledTabs = withStyles({
  root: {
    height: 29,
    minHeight: 'inherit'
  },
  indicator: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    '& > div': {
      width: '100%',
      backgroundColor: secondary,
    },
  },
})(props => <Tabs {...props} TabIndicatorProps={{children: <div/>}}/>);

export const StyledTab = withStyles(theme => ({
  root: {
    textTransform: 'none',
    color: '#fff',
    padding: 0,
    marginTop: 5,
    height: 25,
    minHeight: 'inherit',
    minWidth: 'inherit',
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.pxToRem(12),
    marginRight: theme.spacing(2),
    '&:focus': {
      opacity: 1,
    },
  },
}))(props => <Tab disableRipple {...props} />);
