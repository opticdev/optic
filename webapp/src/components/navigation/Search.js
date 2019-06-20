import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import FuzzySearch from 'fuzzy-search';
import {Keys} from 'react-keydown';

const {DOWN} = Keys
const styles = theme => ({
	root: {
		padding: '2px 4px',
		display: 'flex',
		alignItems: 'center',
		maxWidth: 540,
	},
	input: {
		marginLeft: 8,
		flex: 1,
	},
	iconButton: {
		padding: 10,
	},
	divider: {
		width: 1,
		height: 28,
		margin: 4,
	},
});

class SearchBar extends React.Component {
	render() {

		const {classes, onChange, focusFirst, inputRef} = this.props

		return (
			<Paper className={classes.root} elevation={2}>
				<IconButton className={classes.iconButton} aria-label="Search">
					<SearchIcon />
				</IconButton>
				<InputBase
					className={classes.input}
					autoFocus={true}
					onChange={onChange}
					onKeyDown={(e) => {
						if (e.keyCode === DOWN) {
							e.preventDefault()
							focusFirst()
						}
					}}
					inputProps={{
						ref: inputRef
					}}
					placeholder="Search API"
				/>
			</Paper>
		)
	}
}

export default withStyles(styles)(SearchBar)


export function fuzzyPathsFilter(paths, query) {
	const searcher = new FuzzySearch(paths, ['absolutePath', 'name'], {sort: true}, {
		caseSensitive: false,
	});

	return searcher.search(query)
}

export function fuzzyConceptFilter(concepts, query) {
	const searcher = new FuzzySearch(concepts, ['name'], {sort: true}, {
		caseSensitive: false,
	});

	return searcher.search(query)
}
