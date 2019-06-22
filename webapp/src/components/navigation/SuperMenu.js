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
import BasicButton from '../shape-editor/BasicButton';
import {withEditorContext} from '../../contexts/EditorContext';
import SearchBar, {fuzzyConceptFilter, fuzzyPathsFilter} from './Search';
import keydown, {Keys} from 'react-keydown';
import classNames from 'classnames'

const {RIGHT, DOWN, UP, LEFT, ENTER} = Keys

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

const initialFocus = {
    col: 0,
    row: 0
}

class SuperMenu extends React.Component {

    constructor(props) {
        super(props)

        this.up = this.up.bind(this)
        this.down = this.down.bind(this)
        this.left = this.left.bind(this)
        this.right = this.right.bind(this)
        this.enter = this.enter.bind(this)
        this.focusFirst = this.focusFirst.bind(this)

        this.menuRef = React.createRef()
        this.searchRef = React.createRef()
        this.focusedButton = React.createRef()
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.open && this.props.open !== nextProps.open) {
            this.setState({searchQuery: '', focus: null})
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.focus && this.focusedButton && this.focusedButton.current) {
            this.focusedButton.current.focus()
        }
    }

    state = {
        searchQuery: '',
        focus: null
    }

    focusFirst() {
        this.setState({focus: initialFocus})
        if (this.menuRef) {
            this.searchRef.current.blur()
            this.menuRef.current.focus()
        }
    }

    @keydown(DOWN)
    down(e) {
        e.preventDefault()
        const {focus} = this.state

        if (!focus) {
            return this.focusFirst()
        }

        this.setState({focus: {...focus, row: focus.row + 1}})
    }

    @keydown(UP)
    up(e) {
        e.preventDefault()
        const {focus} = this.state

        if (!focus) {
            return this.focusFirst()
        }

        const decremented = focus.row - 1
        if (decremented < 0) {
            this.searchRef.current.focus()
            this.setState({focus: null})
        } else {
            this.setState({focus: {...focus, row: (decremented < 0) ? 0 : decremented}})
        }
    }

    @keydown(RIGHT)
    right(e) {
        e.preventDefault()
        const {focus} = this.state

        if (!focus) {
            return this.focusFirst()
        }

        const incremented = focus.col + 1
        this.setState({focus: {...focus, col: (incremented > 1) ? 1 : incremented}})

    }

    @keydown(LEFT)
    left(e) {
        e.preventDefault()
        const {focus} = this.state

        if (!focus) {
            return this.focusFirst()
        }

        const decremented = focus.col - 1
        this.setState({focus: {...focus, col: (decremented < 0) ? 0 : decremented}})

    }

    @keydown(ENTER)
    enter(e) {
        const link = this.focusedButton.current
        if (link) {
            link.click()
            setTimeout(() => this.props.toggle(null, true), 50)
        }
    }

    render() {
        const {classes} = this.props;

        const {cachedQueryResults, basePath} = this.props;
        const {conceptsById, pathsById, pathIdsWithRequests} = cachedQueryResults

        const paths = [...pathIdsWithRequests].map(pathId => addAbsolutePath(pathId, pathsById))

        const sortedPaths = sortBy(paths, ['absolutePath']);

        const concepts = Object.values(conceptsById).filter(i => !i.deprecated);
        const sortedConcepts = sortBy(concepts, ['name']);


        const pathsFiltered = fuzzyPathsFilter(sortedPaths, this.state.searchQuery)
        const conceptsFiltered = fuzzyConceptFilter(sortedConcepts, this.state.searchQuery)

        const {focus} = this.state;

        function isFocused(col, row, rowLength) {

            let _focus = {...focus}

            if (pathsFiltered.length === 0) {
                _focus.col = 1
            }

            if (conceptsFiltered.length === 0) {
                _focus.col = 0
            }

            if (col !== _focus.col) {
                return false
            }

            if (col === _focus.col && row === _focus.row) {
                return true
            }


            if (col === _focus.col && _focus.row > rowLength - 1) {
                return (rowLength) - 1 === row
            }
        }

        return (
            <Popover
                classes={{paper: classes.root}}
                open={this.props.open}
                onClose={() => this.props.toggle(null, true)}
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
                                focusFirst={this.focusFirst}
                                inputRef={this.searchRef}
                            />
                        </Grid>
                        <Grid xs={6} item className={classes.gridItem} style={{paddingLeft: 35}}>
                            <Typography variant="h5" color="primary">Paths</Typography>
                            <List>
                                {pathsFiltered
                                    .map(({pathId, absolutePath}, index) => {
                                    const to = routerUrls.pathPage(basePath, pathId);
                                    const isSelected = isFocused(0, index, pathsFiltered.length)
                                    return (
                                        <ListItem
                                            key={pathId}
                                            style={{height: 27}}
                                            classes={{selected: classes.listItemSelected}}
                                            selected={isSelected}
                                            onMouseOver={() => this.setState({focus: null})}
                                        >
                                            <Link
                                                to={to} className={classes.bareLink}
                                                innerRef={(isSelected) ? this.focusedButton : undefined}>
                                                <BasicButton
                                                    className={classNames(classes.pathButton, {[classes.buttonSelected]: isSelected})}
                                                    onClick={() => this.props.toggle(null, true)}>{absolutePath}
                                                </BasicButton>
                                            </Link>
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
                                {conceptsFiltered.map(({name, id}, index) => {
                                    const to = `${basePath}/concepts/${id}`;

                                    const isSelected = isFocused(1, index, conceptsFiltered.length)
                                    return (
                                        <ListItem
                                            key={id}
                                            classes={{selected: classes.listItemSelected}}
                                            style={{height: 27}}
                                            selected={isSelected}
                                            onMouseOver={() => this.setState({focus: null})}
                                        >
                                            <Link to={to} className={classes.bareLink}
                                                  innerRef={(isSelected) ? this.focusedButton : undefined}>
                                                <BasicButton
                                                    className={classNames(classes.pathButton, {[classes.buttonSelected]: isSelected})}
                                                    onClick={() => this.props.toggle(null, true)}
                                                >
                                                    {name}</BasicButton>
                                            </Link>
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
