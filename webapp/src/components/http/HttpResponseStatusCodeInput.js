import IconButton from '@material-ui/core/IconButton';
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import EditIcon from '@material-ui/icons/Edit'
import Menu from '@material-ui/core/Menu';
import {STATUS_CODES} from 'http';

const statusCodes = [...new Set(Object.keys(STATUS_CODES).filter(x => x >= 200).map(x => x.toString()))].sort()

function HttpResponseStatusCodeInput({selectedStatusCode, setSelectedStatusCode}) {

    function handleStatusCodeSelected(e) {
        setSelectedStatusCode(parseInt(e.target.value, 10))
        handleClose()
    }

    const [anchorEl, setAnchorEl] = React.useState(null);

    function handleClick(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleClose() {
        setAnchorEl(null);
    }

    return (
        <>
            <IconButton onClick={handleClick}><EditIcon/></IconButton>
            <Menu
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorEl={anchorEl}
            >
                {statusCodes
                    .map((statusCode) => {
                        const description = `${statusCode}: ${STATUS_CODES[statusCode]}`
                        return (
                            <MenuItem
                                button
                                value={statusCode} key={statusCode}
                                onClick={handleStatusCodeSelected}
                            >{description}</MenuItem>
                        )
                    })
                }
            </Menu>
        </>
    )
}

export default HttpResponseStatusCodeInput