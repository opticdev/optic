import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {DocDarkGrey, DocGrey, methodColors} from '../../requests/DocConstants';
import {Typography} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import VisibilityIcon from '@material-ui/icons/Visibility';
import TocIcon from '@material-ui/icons/Toc';
import {LightTooltip} from '../../tooltips/LightTooltip';
import {GenericContextFactory} from '../../../contexts/GenericContextFactory';
import {ExampleViewer, ShapeViewerWithQuery} from '../../shapes/ShapeViewer';
import {DocCodeBox, ExampleOnly} from '../../requests/DocCodeBox';
import classNames from 'classnames';
import {withEndpointsContext} from '../../../contexts/EndpointContext';
import {DiffDoc, DiffDocGrid} from '../../requests/DocGrid';


export const DiffToggleStates = {
  EXAMPLE: 'example',
  SHAPE: 'shape',
};

const {
  Context: DiffToggleContext,
  withContext: withDiffToggleContext
} = GenericContextFactory(null);

class DiffToggleContextStore extends React.Component {

  state = {
    showTab: DiffToggleStates.SHAPE
  };

  render() {
    const context = {
      showTab: this.state.showTab,
      setTabTo: (e) => this.setState({showTab: e})
    };

    return (
      <DiffToggleContext.Provider value={context}>
        {this.props.children}
      </DiffToggleContext.Provider>
    );
  }
}

export {
  DiffToggleContextStore,
  withDiffToggleContext
};


const darkBackground = '#3c4257';
const lightBackground = '#4f566b';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 750,
    minHeight: 120,
    overflow: 'hidden',
    borderRadius: 4
  },
  header: {
    backgroundColor: darkBackground,
    alignItems: 'center',
    display: 'flex',
    paddingLeft: 5,
    height: 29
  },
  shouldBlur: {
    opacity: .6,
    '&:hover': {
      opacity: 1
    },
    transition: 'opacity .2s'
  },
  inner: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: lightBackground
  },
  toggle: {
    width: 29,
    height: 29,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  empty: {
    textAlign: 'center',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

class _DiffShapeViewer extends React.Component {
  render() {
    const {classes, showTab, setTabTo, shapeId, example, exampleTags, shapeTags, diffs, contentType, title} = this.props;
    const showShape = showTab === DiffToggleStates.SHAPE;

    const toggleColor = showShape ? '#7da3af' : '#af544d';

    const Empty = ({text}) => (
      <div className={classes.empty}>
        <Typography variant="h5" style={{color: '#a3acb9'}}>{text}</Typography>
      </div>
    );

    const contents = (() => {

      if (showShape) {
        if (shapeId) {
          return <ShapeViewerWithQuery shapeId={shapeId} shapeTags={shapeTags} diffs={diffs}/>;
        } else {
          return <Empty text="Not Documented in Specification"/>;
        }
      } else {
        if (example) {
          return <ExampleViewer example={example} exampleTags={exampleTags} diffs={diffs}/>;
        } else {
          return <Empty text="No Example to Show"/>;
        }
      }

    })();


    const button = showShape ? (
      <div className={classes.toggle} style={{backgroundColor: toggleColor}}>
        <LightTooltip title="Show Example">
          <IconButton onClick={() => setTabTo(DiffToggleStates.EXAMPLE)} size="small" disableRipple disableFocusRipple>
            <VisibilityIcon style={{height: 20, width: 20, color: '#f9f9f9'}}/> </IconButton>
        </LightTooltip>
      </div>
    ) : (
      <div className={classes.toggle} style={{backgroundColor: toggleColor}}>
        <LightTooltip title="Show Shape">
          <IconButton onClick={() => setTabTo(DiffToggleStates.SHAPE)} size="small" disableRipple disableFocusRipple>
            <TocIcon style={{height: 20, width: 20, color: '#f9f9f9'}}/> </IconButton>
        </LightTooltip>
      </div>
    );

    const shouldBlur = !(showShape ? Boolean(shapeId) : Boolean(example));

    return (
      <div className={classNames(classes.root, {[classes.shouldBlur]: shouldBlur})}>
        <div className={classes.header}>
          <Typography variant="subtitle2" style={{color: '#a3acb9', fontSize: 14, fontWeight: 500}}>
            {title}
          </Typography>
          <div style={{flex: 1}}/>
          <Typography variant="subtitle2" style={{
            color: '#a3acb9',
            marginRight: 8,
            fontSize: 12,
            fontWeight: 400
          }}>{contentType}</Typography>
          {button}
        </div>
        <div className={classes.inner}>
          <div style={{flex: 1}}>
            {contents}
          </div>
        </div>
      </div>
    );
  }
}

export const DiffShapeViewer = withDiffToggleContext(withStyles(styles)(_DiffShapeViewer));

export const URLViewer = withDiffToggleContext(withStyles(styles)(withEndpointsContext(({classes, host, url, setTabTo, showTab, endpointDescriptor}) => {

  const {endpointPurpose, httpMethod, fullPath} = endpointDescriptor;
  const showShape = showTab === DiffToggleStates.SHAPE;
  const toggleColor = showShape ? '#7da3af' : '#af544d';

  const button = showShape ? (
    <div className={classes.toggle} style={{backgroundColor: toggleColor}}>
      <LightTooltip title="Show Example">
        <IconButton onClick={() => setTabTo(DiffToggleStates.EXAMPLE)} size="small" disableRipple disableFocusRipple>
          <VisibilityIcon style={{height: 20, width: 20, color: '#f9f9f9'}}/> </IconButton>
      </LightTooltip>
    </div>
  ) : (
    <div className={classes.toggle} style={{backgroundColor: toggleColor}}>
      <LightTooltip title="Show Shape">
        <IconButton onClick={() => setTabTo(DiffToggleStates.SHAPE)} size="small" disableRipple disableFocusRipple>
          <TocIcon style={{height: 20, width: 20, color: '#f9f9f9'}}/> </IconButton>
      </LightTooltip>
    </div>
  );

  const contents = (
    <>
      <div>
        <Typography variant="body" component="span" style={{
          fontWeight: 600,
          fontFamily: 'monospace',
          fontSize: 16,
          color: methodColors[httpMethod.toUpperCase()]
        }}>{httpMethod.toUpperCase()}</Typography>
        <Typography variant="body" component="span"
                    style={{
                      marginLeft: 9,
                      fontFamily: 'monospace',
                      fontSize: 16,
                      wordBreak: 'break-all',
                      color: DocGrey
                    }}>{url || fullPath || '/'}</Typography>
      </div>
      {(host && !showShape) && <Typography style={{color: '#e2e2e2'}} variant="subtitle2">Host: {host}</Typography>}
    </>
  );

  return (
    <DiffDoc>
      <div style={{paddingBottom: 18}}>
      <Typography variant="h5" color="primary">Endpoint Purpose</Typography>
      <Typography variant="body1">Description</Typography>
      </div>
      <div className={classes.root} style={{minHeight: 'inherit'}}>
        <div className={classes.header}>
          <Typography variant="subtitle2" style={{color: '#a3acb9', fontSize: 14, fontWeight: 500}}>
            URL + Path
          </Typography>
          <div style={{flex: 1}}/>
          {button}
        </div>
        <div className={classes.inner}>
          <div style={{flex: 1, padding: 12}}>
            {contents}
          </div>
        </div>
      </div>
    </DiffDoc>
  );

})));
