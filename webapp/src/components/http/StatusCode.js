import React from 'react';
import PropTypes from 'prop-types';
import {Typography} from '@material-ui/core';
import {STATUS_CODES} from 'http'

class StatusCode extends React.Component {
    render() {
        const {statusCode} = this.props;

        return (
            <div>
                <Typography variant="h5">{statusCode}</Typography>
                <Typography variant="subtitle1">{STATUS_CODES[statusCode]}</Typography>
            </div>
        );
    }
}

StatusCode.propTypes = {
    statusCode: PropTypes.number.isRequired
};

export default StatusCode;