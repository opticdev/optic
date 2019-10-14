import React from 'react';
import * as PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import {withRouter} from 'react-router-dom';
import {withEditorContext} from '../../contexts/EditorContext.js';
import {ExpansionStore} from '../../contexts/ExpansionContext.js';
import {withRfcContext} from '../../contexts/RfcContext.js';
import {ShapeEditorStore} from '../../contexts/ShapeEditorContext.js';
import {ShapesHelper, ShapesCommands} from '../../engine';
import Zoom from '@material-ui/core/Zoom';
import {routerUrls} from '../../routes.js';
import {RequestUtilities} from '../../utilities/RequestUtilities.js';
import {getNormalizedBodyDescriptor} from '../PathPage.js';
import {primary} from '../../theme';
import {EditorModes} from '../../contexts/EditorContext';
import ShapeViewer from '../shape-editor/ShapeViewer.js';

import {styles as shapeViewerStyles} from '../ConceptsPage.js';
import TextField from '@material-ui/core/TextField';
import {withNavigationContext} from '../../contexts/NavigationContext.js';

const styles = theme => ({
  root: {},
  value: {
    marginLeft: theme.spacing(1),
  },
  select: {
    fontSize: 14
  },
  wrapper: {}

});

class BodySwitchWithoutStyles extends React.Component {
  render() {
    const {onChange, checked, classes} = this.props;
    return (
      <div>
        <Typography variant="caption" style={{fontSize: 13, left: 0}}>Has Body:</Typography>
        <Switch
          checked={checked}
          size="small" color="primary"
          className={classes.value}
          onChange={onChange}/>
      </div>
    );
  }
}

const BodySwitch = withStyles(styles)(BodySwitchWithoutStyles);

class BodyViewerWithoutContext extends React.Component {
  render() {
    const {history} = this.props;
    const {classes} = this.props;
    const {onShapeSelected} = this.props;
    const {baseUrl, shapeId, shapeHeaderText = 'Shape', queries, contentType} = this.props;

    const shape = queries.shapeById(shapeId);
    // console.log(shape);
    return (
      <div>
        <div style={{display: 'flex'}}>
          <Typography
            variant="overline"
            style={{
              marginTop: 2,
              paddingRight: 8,
              flex: 1,
              color: primary
            }}>{shapeHeaderText}</Typography>
          <Typography
            variant="overline"
            style={{
              textTransform: 'none',
              marginTop: 2,
              paddingRight: 8,
              color: primary
            }}>{contentType}</Typography>
        </div>
        <ShapeEditorStore onShapeSelected={(shapeId) => {
          if (onShapeSelected) {
            onShapeSelected(shapeId);
            return;
          }
          history.push(routerUrls.conceptPage(baseUrl, shapeId));
        }}>
          <ExpansionStore>
            <div className={classes.shapeEditorContainer}>
              <ShapeViewer shape={shape}/>
            </div>
          </ExpansionStore>
        </ShapeEditorStore>
      </div>
    );
  }
}

const BodyViewer = withNavigationContext(withRouter(withEditorContext(withRfcContext(withStyles(shapeViewerStyles)(BodyViewerWithoutContext)))));

class LayoutWrapperWithoutStyles extends React.Component {
  render() {
    const {classes} = this.props;
    return (
      <div className={classes.wrapper}>
        <div style={{flexDirection: 'row'}}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

const LayoutWrapper = withStyles(styles)(LayoutWrapperWithoutStyles);
const defaultContentType = 'application/json';

class BodyEditor extends React.Component {

  removeBody = () => {
    const {shapeId} = getNormalizedBodyDescriptor(this.props.bodyDescriptor);
    this.props.onBodyRemoved({shapeId});
  };

  addOrRestoreBody = () => {
    const {handleCommand, rootId, bodyDescriptor} = this.props;
    const {shapeId} = getNormalizedBodyDescriptor(bodyDescriptor);
    if (shapeId) {
      this.props.onBodyRestored({shapeId});
    } else {
      const newShapeId = ShapesHelper.newShapeId();
      const command = ShapesCommands.AddShape(newShapeId, '$object', '');
      handleCommand(command);
      this.props.onBodyAdded({shapeId: newShapeId, contentType: defaultContentType});
    }
  };

  changeContentType = (event) => {
    const contentType = event.target.value;
    this.props.onContentTypeChanged({contentType});
  };

  renderForViewing({shapeId, contentType}) {

    return (
      <LayoutWrapper>
        <BodyViewer shapeId={shapeId} contentType={contentType}/>
      </LayoutWrapper>
    );
  }

  render() {
    const {classes, mode, bodyDescriptor, nestedId} = this.props;
    const isViewMode = mode === EditorModes.DOCUMENTATION;
    const normalizedBodyDescriptor = getNormalizedBodyDescriptor(bodyDescriptor);
    const hasBody = RequestUtilities.hasNormalizedBody(normalizedBodyDescriptor);
    const {shapeId, httpContentType: contentType} = normalizedBodyDescriptor;
    if (isViewMode) {
      if (!hasBody) {
        return null;
      }
      return this.renderForViewing({shapeId, contentType});
    }

    const body = hasBody ? (
      <LayoutWrapper>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <Typography variant="caption" style={{fontSize: 13, left: 0}}>Content Type:</Typography>
          <TextField inputProps={{style: {fontSize: 14, marginLeft: 6, width: 240}}} value={contentType}
                     onBlur={this.changeContentType}/>
        </div>
        <BodyViewer shapeId={shapeId}/>
        {nestedId && (nestedId !== shapeId) && (
          <div style={{paddingTop: 5, paddingLeft: 40, paddingRight: 0}}><BodyViewer shapeId={nestedId}
                                                                                     shapeHeaderText="⮑ Nested Shape Under Review"/>
          </div>
        )}
      </LayoutWrapper>
    ) : null;

    return (
      <>
        <BodySwitch checked={hasBody} onChange={hasBody ? this.removeBody : this.addOrRestoreBody}/>
        {body}
      </>
    );
  }
}

BodyEditor.propTypes = {
  rootId: PropTypes.string.isRequired,
  bodyDescriptor: PropTypes.object,
  currentShape: PropTypes.object
};

export default withEditorContext(withRfcContext(withStyles(styles)(BodyEditor)));
