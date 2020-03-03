import React, {useEffect, useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {Typography} from '@material-ui/core';
import {DocGrey, methodColors} from './DocConstants';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {secondary} from '../../theme';
import {ExampleViewer, ShapeViewerWithQuery} from '../shapes/ShapeViewer';
import {Show} from '../shared/Show';
import {DiffUIEventEmitter, DiffUIEventEmitterEvents} from '../diff/v2/DiffContext';

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
      <Typography variant="body" component="span" style={{
        fontWeight: 600,
        fontFamily: 'monospace',
        fontSize: 16,
        color: methodColors[method.toUpperCase()]
      }}>{method.toUpperCase()}</Typography>
      <Typography variant="body" component="span"
                  style={{
                    marginLeft: 9,
                    fontFamily: 'monospace',
                    fontSize: 16,
                    wordBreak: 'break-all',
                    color: DocGrey
                  }}>{url || '/'}</Typography>
    </DocCodeBox>
  );
};

export const ShapeOverview = withStyles(styles)(({shapeId, classes, contentType, title}) => {

  return (
    <DocCodeBox title={title}>
      {contentType && <Typography variant="subtitle1" className={classes.contentType}>{contentType}</Typography>}
      <div>RENDER THE SHAPE HERE</div>
    </DocCodeBox>
  );
});

export const ExampleOnly = withStyles(styles)(({classes, contentType, title, example, disableNaming}) => {
  return (
    <DocCodeBox title={title}>
      {contentType && <Typography variant="subtitle1" className={classes.contentType}>{contentType}</Typography>}
      <ExampleViewer example={example} disableNaming={disableNaming}/>
    </DocCodeBox>
  );
});

export const ShapeOnly = withStyles(styles)(({classes, title, contentType, shapeId, disableNaming}) => {

  return (
    <DocCodeBox title={title}>
      {contentType && <Typography variant="subtitle1" className={classes.contentType}>{contentType}</Typography>}
      <ShapeViewerWithQuery shapeId={shapeId} disableNaming={disableNaming}/>
    </DocCodeBox>
  );
});

class _ExampleShapeViewer extends React.Component {

  state = {
    showExample: false
  };

  componentWillReceiveProps = (nextProps, nextContext) => {
    const exampleWasProvided = typeof this.props.example !== 'undefined';
    const exampleIsProvided = typeof nextProps.example !== 'undefined';
    if (!exampleWasProvided && exampleIsProvided) {
      this.setShowExample(true);
    } else if (!exampleIsProvided) {
      this.setShowExample(false);
    }
  };

  showExampleIfPresent = () => {
    const exampleIsProvided = typeof this.props.example !== 'undefined';
    if (exampleIsProvided) {
      this.setShowExample(true);
    }
  };

  showSpecIfPossible = () => {
    if (this.props.shapeId) {
      this.setShowExample(false);
    }
  };

  componentDidMount() {
    DiffUIEventEmitter.on(DiffUIEventEmitterEvents.SHOW_EXAMPLE_WHEN_POSSIBLE, this.showExampleIfPresent);
    DiffUIEventEmitter.on(DiffUIEventEmitterEvents.SHOW_SPEC_WHEN_POSSIBLE, this.showSpecIfPossible);
  }

  componentWillUnmount() {
    DiffUIEventEmitter.off(DiffUIEventEmitterEvents.SHOW_EXAMPLE_WHEN_POSSIBLE, this.showExampleIfPresent);
    DiffUIEventEmitter.off(DiffUIEventEmitterEvents.SHOW_SPEC_WHEN_POSSIBLE, this.showSpecIfPossible);
  }

  setShowExample = (bool) => {
    this.setState({showExample: bool});
  };

  render() {
    const {shapeId, showShapesFirst, classes, exampleTags, example, title, contentType} = this.props;
    const {showExample} = this.state;

    const exampleProvided = typeof example !== 'undefined';

    const rightRegion = (
      <StyledTabs value={showExample ? 0 : 1}>
        {exampleProvided && <StyledTab label="Example" value={0} onClick={() => this.setShowExample(true)}/>}
        <StyledTab label="Shape" value={1} onClick={() => this.setShowExample(false)}/>
      </StyledTabs>
    );

    const exampleRender = (() => {
      return (
        <ExampleViewer example={example} exampleTags={exampleTags}/>
      );
    })();

    const shapeRender = (
      <ShapeViewerWithQuery shapeId={shapeId} disableNaming={true}/>
    );

    return (
      <DocCodeBox title={title} rightRegion={rightRegion}>
        {contentType &&
        <Typography variant="subtitle1" className={classes.contentType}>{contentType}</Typography>}

        <Show when={showExample} children={exampleRender}/>
        <Show when={!showExample} children={shapeRender}/>
      </DocCodeBox>
    );
  }
};

export const ExampleShapeViewer = withStyles(styles)(_ExampleShapeViewer);

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
