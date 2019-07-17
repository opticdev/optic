import React from 'react';
import * as PropTypes from 'prop-types'
import withStyles from '@material-ui/core/styles/withStyles';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {withEditorContext} from '../../contexts/EditorContext.js';
import {withRfcContext} from '../../contexts/RfcContext.js';
import {ContentTypesHelper, ShapesHelper, ShapesCommands} from '../../engine';
import classNames from 'classnames';
import Zoom from '@material-ui/core/Zoom';
import {RequestUtilities} from '../../utilities/RequestUtilities.js';
import {getNormalizedBodyDescriptor} from '../PathPage.js';
import SchemaEditor from '../shape-editor/SchemaEditor';
import {primary} from '../../theme';
import {EditorModes} from '../../contexts/EditorContext';
import ShapeViewer from '../shape-editor/ShapeViewer.js';


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
        )
    }
}

const BodySwitch = withStyles(styles)(BodySwitchWithoutStyles)

class BodyViewerWithoutContext extends React.Component {
    render() {
        const {shapeId, queries, contentType} = this.props;
        const shape = queries.shapeById(shapeId);

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
                        }}>Shape</Typography>
                    <Typography
                        variant="overline"
                        style={{
                            textTransform: 'none',
                            marginTop: 2,
                            paddingRight: 8,
                            color: primary
                        }}>{contentType}</Typography>
                </div>
                <ShapeViewer shape={shape}/>
            </div>
        )
    }
}

const BodyViewer = withEditorContext(withRfcContext(BodyViewerWithoutContext))

class LayoutWrapperWithoutStyles extends React.Component {
    render() {
        const {classes} = this.props;
        return (
            <div className={classes.wrapper}>
                <div style={{flexDirection: 'row'}}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}

const LayoutWrapper = withStyles(styles)(LayoutWrapperWithoutStyles)

class BodyEditor extends React.Component {

    constructor(props) {
        super(props);

        const {httpContentType} = getNormalizedBodyDescriptor(props.bodyDescriptor)
        this.state = {
            contentTypeInfo: ContentTypesHelper.fromString(httpContentType || 'application/json')
        };

    }

    removeBody = () => {
        const {shapeId} = getNormalizedBodyDescriptor(this.props.bodyDescriptor)
        this.props.onBodyRemoved({shapeId})
    }

    addOrRestoreBody = () => {
        const {handleCommand, rootId, bodyDescriptor} = this.props;
        const {shapeId} = getNormalizedBodyDescriptor(bodyDescriptor)
        if (shapeId) {
            this.props.onBodyRestored({shapeId})
        } else {
            const newShapeId = ShapesHelper.newShapeId()
            const command = ShapesCommands.AddShape(newShapeId, '$object', '')
            handleCommand(command)
            this.props.onBodyAdded({shapeId: newShapeId, contentType: this.state.contentTypeInfo.value})
        }
    }

    changeContentType = (event) => {
        const newContentType = event.target.value;
        const contentTypeInfo = ContentTypesHelper.fromString(newContentType)
        this.setState({contentTypeInfo});
        this.props.onContentTypeChanged({contentType: contentTypeInfo.value})
    };

    renderForViewing({shapeId, contentType}) {

        return (
            <LayoutWrapper>
                <BodyViewer shapeId={shapeId} contentType={contentType}/>
            </LayoutWrapper>
        )
    }

    render() {
        const {classes, mode, bodyDescriptor} = this.props;
        const isViewMode = mode === EditorModes.DOCUMENTATION;
        const normalizedBodyDescriptor = getNormalizedBodyDescriptor(bodyDescriptor)
        const hasBody = RequestUtilities.hasNormalizedBody(normalizedBodyDescriptor);
        const {shapeId, httpContentType: contentType} = normalizedBodyDescriptor
        if (isViewMode) {
            if (!hasBody) {
                return null
            }
            return this.renderForViewing({shapeId, contentType})
        }


        const body = hasBody ? (
            <Zoom in={hasBody}>
                <LayoutWrapper>
                    <Typography variant="caption" style={{fontSize: 13, left: 0}}>Content Type:</Typography>
                    <Select
                        value={this.state.contentTypeInfo.value}
                        className={classNames(classes.value, classes.select)}
                        onChange={this.changeContentType}>
                        {ContentTypesHelper.supportedContentTypesArray
                            .map(({value}) => {
                                return (
                                    <MenuItem value={value} key={value} button
                                              style={{fontSize: 14}}>{value}</MenuItem>
                                )
                            })
                        }
                    </Select>

                    {this.state.contentTypeInfo.supportsShape ? (
                        <BodyViewer shapeId={shapeId}/>
                    ) : null}
                </LayoutWrapper>
            </Zoom>
        ) : null

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
}

export default withEditorContext(withRfcContext(withStyles(styles)(BodyEditor)));
