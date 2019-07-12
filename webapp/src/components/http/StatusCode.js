import React from 'react';
import PropTypes from 'prop-types';
import {Typography} from '@material-ui/core';
import {STATUS_CODES} from 'http'
import {EditorModes, withEditorContext} from '../../contexts/EditorContext.js';
import HttpResponseStatusCodeInput from './HttpResponseStatusCodeInput.js';

const successColor = '#277a4e'
const errorColor = '#7b2733'

class StatusCode extends React.Component {
    handleStatusCodeChange = (statusCode) => {
        this.props.onChange(statusCode)
    }

    render() {
        const {statusCode, mode} = this.props;

        const color = (statusCode < 400 && statusCode >= 200) ? successColor : errorColor
        const editor = mode === EditorModes.DOCUMENTATION ? null : (
            <HttpResponseStatusCodeInput
                selectedStatusCode={statusCode}
                setSelectedStatusCode={this.handleStatusCodeChange}/>
        )
        return (
            <div>
                <Typography variant="h5" style={{color}}>{statusCode} {editor}</Typography>
                <Typography variant="subtitle1" style={{fontWeight: 400}}>{STATUS_CODES[statusCode]}</Typography>
            </div>
        );
    }
}

StatusCode.propTypes = {
    statusCode: PropTypes.number.isRequired
};

export default withEditorContext(StatusCode);
