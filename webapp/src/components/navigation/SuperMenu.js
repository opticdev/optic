import ListItemText from '@material-ui/core/ListItemText';
import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Popover from '@material-ui/core/Popover';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import {routerUrls} from '../../routes.js';
import {primary} from '../../theme';
import sortBy from 'lodash.sortby';
import {withRfcContext} from '../../contexts/RfcContext';
import {Link} from 'react-router-dom';
import {addAbsolutePath} from '../utilities/PathUtilities.js';
import {withEditorContext} from '../../contexts/EditorContext';
import SearchBar, {fuzzyConceptFilter, fuzzyPathsFilter} from './Search';

const styles = theme => ({
    root: {
        width: '90%',
        height: '90%'
    },
    gridItem: {
        padding: 15

    },
    pathButton: {
        padding: 5,
        fontSize: 15,
        fontWeight: 200,
        '&:hover': {
            color: primary,
            fontWeight: 400
        }
    },
    listItemSelected: {
        backgroundColor: 'rgba(78,165,255,0.08) !important',
    },
    buttonSelected: {
        color: primary,
        fontWeight: 400
    },
    operations: {
        fontSize: 10,
        marginLeft: 15,
        marginTop: 4
    },
    bareLink: {
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer'
    },
    searchWrapper: {
        padding: 22
    }
});


class SuperMenu extends React.Component {

    constructor(props) {
        super(props)

        this.menuRef = React.createRef()
        this.searchRef = React.createRef()
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.open && this.props.open !== nextProps.open) {
            this.setState({searchQuery: ''})
        }
    }

    handleClose = () => {
        this.props.toggle(null, true)
    }

    state = {
        searchQuery: '',
    }

    render() {
        const {classes} = this.props;

        const {cachedQueryResults, baseUrl} = this.props;
        const {conceptsById, pathsById, pathIdsWithRequests} = cachedQueryResults

        const paths = [...pathIdsWithRequests].map(pathId => addAbsolutePath(pathId, pathsById))

        const sortedPaths = sortBy(paths, ['absolutePath']);

        const concepts = Object.values(conceptsById).filter(i => !i.deprecated);
        const sortedConcepts = sortBy(concepts, ['name']);


        const pathsFiltered = fuzzyPathsFilter(sortedPaths, this.state.searchQuery)
        const conceptsFiltered = fuzzyConceptFilter(sortedConcepts, this.state.searchQuery)


        return (
            <Popover
                classes={{paper: classes.root}}
                open={this.props.open}
                onClose={this.handleClose}
                transitionDuration={this.props.open ? 0 : 200}
                anchorOrigin={{
                    vertical: 52,
                    horizontal: 5,
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <div>
                    <Grid container ref={this.menuRef}>
                        <Grid xs={12} item className={classes.searchWrapper}>
                            <SearchBar
                                searchQuery={this.state.searchQuery}
                                onChange={(e) => this.setState({searchQuery: e.target.value})}
                                inputRef={this.searchRef}
                            />
                        </Grid>
                        <Grid xs={6} item className={classes.gridItem} style={{paddingLeft: 35}}>
                            <Typography variant="h5" color="primary">Paths</Typography>
                            <List>
                                {pathsFiltered
                                    .map(({pathId, absolutePath}) => {
                                        const to = routerUrls.pathPage(baseUrl, pathId);
                                        return (
                                            <ListItem
                                                key={pathId}
                                                style={{height: 27}}
                                                component={Link}
                                                to={to}
                                                onClick={this.handleClose}
                                                button
                                            >
                                                <ListItemText primary={(
                                                    <Typography
                                                        title={absolutePath}
                                                        style={{
                                                            fontSize: 15,
                                                            fontWeight: 200,
                                                            textOverflow: 'ellipsis',
                                                            overflow: 'hidden',
                                                            whiteSpace: 'nowrap'
                                                        }}>{absolutePath}</Typography>
                                                )}/>
                                            </ListItem>
                                        );
                                    })}
                                {!pathsFiltered.length && this.state.searchQuery ? (
                                    <Typography variant="caption" color="error">No Paths Found for
                                        '{this.state.searchQuery}'</Typography>
                                ) : null}
                            </List>
                        </Grid>
                        <Grid xs={6} item className={classes.gridItem}>
                            <Typography variant="h5" color="primary">Concepts</Typography>
                            <List>
                                {conceptsFiltered.map(({name, id}) => {
                                    const to = routerUrls.conceptPage(baseUrl, id);

                                    return (
                                        <ListItem
                                            key={id}
                                            style={{height: 27}}
                                            component={Link}
                                            to={to}
                                            onClick={this.handleClose}
                                            button
                                        >
                                            <ListItemText primary={(
                                                <Typography
                                                    title={name}
                                                    style={{
                                                        fontSize: 15,
                                                        fontWeight: 200,
                                                        textOverflow: 'ellipsis',
                                                        overflow: 'hidden',
                                                        whiteSpace: 'nowrap'
                                                    }}>{name}</Typography>
                                            )}/>
                                        </ListItem>
                                    );
                                })}
                                {!conceptsFiltered.length && this.state.searchQuery ? (
                                    <Typography variant="caption" color="error">No Concepts Found for
                                        '{this.state.searchQuery}'</Typography>
                                ) : null}
                            </List>
                        </Grid>


                    </Grid>


                </div>
            </Popover>
        );
    }
}

export default withEditorContext(withRfcContext(withStyles(styles)(SuperMenu)));
