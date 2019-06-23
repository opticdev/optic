import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import {STATUS_CODES} from 'http';

const statusCodes = [...new Set(Object.keys(STATUS_CODES).filter(x => x >= 200).map(x => x.toString()))].sort()

function HttpResponseStatusCodeInput({open, selectedStatusCode, setSelectedStatusCode}) {
    const handleChange = (e) => {
        setSelectedStatusCode(parseInt(e.target.value, 10))
    }
    return (
        <Select value={selectedStatusCode} onChange={handleChange}>
            {statusCodes
                .map((statusCode) => {
                    const description = `${statusCode}: ${STATUS_CODES[statusCode]}`
                    return (
                        <MenuItem button value={statusCode} key={statusCode}>{description}</MenuItem>
                    )
                })
            }
        </Select>
    )
}

export default HttpResponseStatusCodeInput