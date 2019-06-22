import React from 'react';
import PropTypes from 'prop-types';
import {Typography} from '@material-ui/core';
import {STATUS_CODES} from 'http'

const successColor = '#277a4e'
const errorColor = '#7b2733'

class StatusCode extends React.Component {
    render() {
        const {statusCode} = this.props;

        const color = (statusCode < 400 && statusCode >= 200) ? successColor : errorColor

        return (
            <div>
                <Typography variant="h5" style={{color}}>{statusCode}</Typography>
                <Typography variant="subtitle1" style={{fontWeight: 200}}>{STATUS_CODES[statusCode]}</Typography>
            </div>
        );
    }
}

StatusCode.propTypes = {
    statusCode: PropTypes.number.isRequired
};

export default StatusCode;
