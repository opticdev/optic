import React from 'react';
import * as PropTypes from 'prop-types'
import withStyles from '@material-ui/core/styles/withStyles';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {ContentTypesHelper} from '../../engine';
import classNames from 'classnames';
import Paper from '@material-ui/core/Paper';
import Zoom from '@material-ui/core/Zoom';
import SchemaEditor from '../shape-editor/SchemaEditor';
import {primary} from '../../theme';
import {EditorModes} from '../../contexts/EditorContext';


const styles = theme => ({
    root: {},
    value: {
        marginLeft: theme.spacing(1),
    },
    select: {
        fontSize: 14
    },
    bodyPaper: {
        padding: theme.spacing(2)
    }

});

class BodyEditor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            hasBody: !!this.props.shapeId,
            contentType: ContentTypesHelper.fromString('application/json')
        };

    }

    toggleHasBody = (event) => {
        const checked = event.target.checked;
        this.setState({hasBody: checked});
    };

    changeContentType = (event) => {
        const newContentType = event.target.value;
        this.setState({contentType: ContentTypesHelper.fromString(newContentType)});
    };

    render() {
        const {classes, mode, shapeId} = this.props;

        const switcher = (
            <div style={{display: isViewMode ? 'none' : 'inherit'}}>
                <Typography variant="caption" style={{fontSize: 13, left: 0}}>Has Body:</Typography>
                <Switch checked={this.state.hasBody}
                        size="small" color="primary"
                        className={classes.value}
                        onChange={this.toggleHasBody}/>
            </div>
        )

        if (mode === EditorModes.DOCUMENTATION && !this.state.hasBody) {
            return null;
        }

        const isViewMode = mode === EditorModes.DOCUMENTATION;

        return (
            <>
                {switcher}
                <Zoom in={this.state.hasBody}>
                    <Paper elevation={1} className={classes.bodyPaper}>
                        <div style={{flexDirection: 'row'}}>
                            <Typography variant="caption" style={{fontSize: 13, left: 0}}>Content Type:</Typography>

                            {isViewMode ? (
                                <Typography variant="caption"
                                            style={{
                                                fontSize: 13,
                                                marginLeft: 6
                                            }}>{this.state.contentType.value}</Typography>
                            ) : (
                                <Select
                                    value={this.state.contentType.value}
                                    className={classNames(classes.value, classes.select)}
                                    onChange={this.changeContentType}>
                                    {ContentTypesHelper.supportedContentTypesArray.map(({value}) => (
                                        <MenuItem value={value} key={value} button
                                                  style={{fontSize: 14}}>{value}</MenuItem>
                                    ))}
                                </Select>
                            )}

                            {this.state.contentType.supportsShape ? (
                                <>
                                    <div>
                                        <Typography variant="overline"
                                                    style={{
                                                        marginTop: 2,
                                                        paddingRight: 8,
                                                        color: primary
                                                    }}>Shape</Typography>
                                    </div>

                                    <SchemaEditor shapeId={shapeId} mode={mode}/>
                                </>
                            ) : null}

                        </div>

                    </Paper>
                </Zoom>
            </>
        );
    }
}

BodyEditor.propTypes = {
    shapeId: PropTypes.string
}

export default withStyles(styles)(BodyEditor);
