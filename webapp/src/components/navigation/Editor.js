import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import TopBar from './TopBar';
import Paper from '@material-ui/core/Paper';
import keydown, {ALL_KEYS} from 'react-keydown';
import SuperMenu from './SuperMenu';
import ShareDialog from './ShareDialog';
import {EditorModes, withEditorContext} from '../../contexts/EditorContext';


const styles = theme => ({
    pageContainer: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100vh !important'
    },
    navWrapper: {
        height: 50
    },
    navExpandedWrapper: {
        height: 100
    },
    contentWrapper: {
        flex: 1,
        overflow: 'scroll',
        backgroundColor: '#fafafa',
        display: 'flex',
        justifyContent: 'center',
    },
    margin: {
        minWidth: 30,
        flex: 1,
    },
    leftMargin: {
        minWidth: 30,
        flex: 1,
        [theme.breakpoints.down('md')]: {
            display: 'none'
        },
    },
    sheet: {
        marginTop: 40,
        maxWidth: 1000,
        flex: 6.5,
        height: 'fit-content',
        paddingBottom: 20,
        marginBottom: 40,
        width: 850,
        paddingLeft: 15,
        paddingRight: 15,
        [theme.breakpoints.down('md')]: {
            marginLeft: 22,
            maxWidth: 900
        },
    },
    fullSheet: {
        minHeight: 1200
    },
    toc: {
        marginTop: 120,
        position: 'fixed',
        float: 'right',
        padding: 20,
        paddingLeft: '2%'
    }
});

export const Sheet = withStyles(styles)(({classes, style, children}) => {
    return (
        <Paper className={classes.sheet} style={style} id="center-sheet">
            {children}
        </Paper>
    );
});
export const FullSheet = withStyles(styles)(({classes, style, children}) => {
    return (
        <Paper className={`${classes.sheet} ${classes.fullSheet}`} style={style} id="center-sheet">
            {children}
        </Paper>
    );
});

const Margin = withStyles(styles)(({classes, children, className}) => {
    return <div className={className || classes.margin}>{children}</div>;
});

const TOC = withStyles(styles)(({classes, children}) => {
    return <div className={classes.toc}>
        {children}
    </div>;
});

let lastShift = null

class Editor extends React.Component {

    state = {
        superMenuOpen: false,
        shareOpen: false
    };

    @keydown(ALL_KEYS)
    searchShortcut(e) {
        const shouldHandle = e.shiftKey && e.which === 16
        if (!shouldHandle) {
            return
        }
        const now = new Date().getTime()
        if (lastShift && now - lastShift < 150) {
            e.preventDefault();
            e.stopPropagation();
            this.toggleSuperMenu(null);
        }
        lastShift = now
    }

    @keydown('escape')
    escape(e) {
        e.preventDefault();
        e.stopPropagation();
        this.closeAll();
    }

    closeAll = () => {
        this.toggleSuperMenu(null, true);
    };

    toggleSuperMenu = (e, forceClose) => {
        this.setState({superMenuOpen: (forceClose) ? false : !this.state.superMenuOpen});
    };

    showShare = () => {
        this.setState({shareOpen: true});
    };

    hideShare = () => {
        this.setState({shareOpen: false});
    };

    render() {

        const {classes, mode} = this.props;

        return (
            <div className={classes.pageContainer}>
                <div className={(mode === EditorModes.DOCUMENTATION) ? classes.navWrapper : classes.navExpandedWrapper}>
                    <TopBar toggleSuperMenu={this.toggleSuperMenu} showShare={this.showShare}/>
                </div>
                <div className={classes.contentWrapper} ref={this.props.scrollContainerRef}>
                    <Margin className={classes.leftMargin}>
                        {this.props.leftMargin ? <TOC children={this.props.leftMargin}/> : null}
                    </Margin>
                    {this.props.children}
                    <Margin/>
                </div>
                <SuperMenu open={this.state.superMenuOpen} toggle={this.toggleSuperMenu}/>
                <ShareDialog close={this.hideShare} open={this.state.shareOpen}/>
            </div>
        );
    }
}

export default withEditorContext(withStyles(styles)(Editor));
