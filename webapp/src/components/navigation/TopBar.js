import React, {useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {fade} from '@material-ui/core/styles';
import {NavTextColor, SearchBackground} from './constants';
import {Button} from '@material-ui/core';
import KeyboardDown from '@material-ui/icons/KeyboardArrowDown';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {primary} from '../../theme';
import {EditorModes, withEditorContext} from '../../contexts/EditorContext';
import {withRfcContext} from '../../contexts/RfcContext';
import TextField from '@material-ui/core/TextField';
import {renameAPI} from '../../engine/routines';
import CodeIcon from '@material-ui/icons/Code';
import DescriptionIcon from '@material-ui/icons/Description';
import CreateNew from './CreateNew'

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    appBar: {
        borderBottom: '1px solid #e2e2e2'
    },
    menuButton: {
        left: 20,
        // color: NavTextColor,
    },
    title: {
        display: 'none',
        color: NavTextColor,
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    spacer: {
        flexGrow: 1,
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(SearchBackground, 0.15),
        '&:hover': {
            backgroundColor: fade(SearchBackground, 0.25),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
    },
    rightIcon: {
        marginLeft: theme.spacing(1),
        color: NavTextColor
    },
    searchIcon: {
        width: theme.spacing(7),
        color: NavTextColor,
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: NavTextColor,
        cursor: 'pointer'
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 7),
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: 120,
        },
    },
    toggleButton: {
        height: 28,
        // borderColor: primary,
        color: primary
    },
    toggleButtonSelected: {
        backgroundColor: `${primary} !important`,
        color: `white !important`
    },
    titleInput: {
        width: 280,
        color: NavTextColor
    },
    button: {},
    leftIcon: {
        width: 15,
        marginRight: theme.spacing.unit,
    },
});

const APITitle = ({mode, apiName, classes, onRenamed, style}) => {

    const [stagedName, setStagedName] = useState(apiName);

    return (
        <>
            {mode === EditorModes.DOCUMENTATION ? (
                <Typography className={classes.title} variant="h6" noWrap style={style}>
                    {apiName}
                </Typography>
            ) : (
                <TextField value={stagedName}
                           style={style}
                           onBlur={() => onRenamed(stagedName)}
                           className={classes.titleInput}
                           onChange={(e) => setStagedName(e.target.value)}
                />
            )}
        </>
    );
};

class TopBar extends React.Component {


    render() {
        const {classes, mode, switchEditorMode, apiName, handleCommand, hasUnsavedChanges} = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="static" style={{backgroundColor: 'white'}} elevation={0} className={classes.appBar}>
                    <Toolbar variant="dense">
                        <Button
                            variant="text" color="primary" className={classes.menuButton}
                            onClick={this.props.toggleSuperMenu}
                        >Explore API
                            <KeyboardDown className={classes.rightIcon}/>
                        </Button>

                        <div className={classes.spacer}/>

                        <APITitle
                            mode={mode}
                            apiName={apiName}
                            classes={classes}
                            onRenamed={(name) => handleCommand(renameAPI(name))}/>

                        {(hasUnsavedChanges && process.env.REACT_APP_CLI_MODE) ? (
                            <Typography variant="caption" style={{color: '#8e8e8e', marginLeft: 20}}>
                                Saving...
                            </Typography>
                        ) : null}

                        <div className={classes.spacer}/>

                        <ToggleButtonGroup value={mode}
                                           exclusive size="small"
                                           style={{marginRight: 22}}
                                           onChange={(e, value) => switchEditorMode(value)}>
                            <ToggleButton value={EditorModes.DOCUMENTATION} className={classes.toggleButton}
                                          classes={{selected: classes.toggleButtonSelected}}>
                                Documentation
                            </ToggleButton>
                            <ToggleButton value={EditorModes.DESIGN} className={classes.toggleButton}
                                          classes={{selected: classes.toggleButtonSelected}}>
                                Design
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <Button color="primary">
                            Docs
                        </Button>
                        {!process.env.REACT_APP_CLI_MODE ? (
                            <Button color="secondary" onClick={this.props.showShare}>
                                Share
                            </Button>
                        ) : null}
                    </Toolbar>
                </AppBar>
                {mode === EditorModes.DESIGN ? (
                    <AppBar position="static" style={{backgroundColor: 'white'}} elevation={0}
                            className={classes.appBar}>
                        <CreateNew render={({addConcept, addRequest, classes}) => {
                            return <Toolbar variant="dense" style={{paddingLeft: 30}}>
                                <Button
                                    color="secondary" className={classes.button}
                                    onClick={addRequest}>
                                    <CodeIcon className={classes.leftIcon}/>
                                    New Request
                                </Button>

                                <Button
                                    color="secondary" className={classes.button}
                                    onClick={addConcept}>
                                    <DescriptionIcon className={classes.leftIcon}/>
                                    New Concept
                                </Button>
                            </Toolbar>
                        }}/>
                    </AppBar>) : null}
            </div>
        );
    }
}


export default withRfcContext(withEditorContext(withStyles(styles)(TopBar)));
