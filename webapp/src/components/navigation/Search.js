import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import FuzzySearch from 'fuzzy-search';

const styles = theme => ({
	root: {
		padding: '2px 4px',
		display: 'flex',
		alignItems: 'center',
		width: '100%'
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

		const {classes, onChange, inputRef, apiName} = this.props

		return (
			<Paper className={classes.root} elevation={2}>
				<IconButton className={classes.iconButton} aria-label="Search">
					<SearchIcon />
				</IconButton>
				<InputBase
					className={classes.input}
					autoFocus={true}
					onChange={onChange}
					inputProps={{
						ref: inputRef
					}}
					placeholder={`Search ${apiName || 'API'}...`}
				/>
			</Paper>
		)
	}
}

export default withStyles(styles)(SearchBar)


export function fuzzyPathsFilter(paths, query) {

  function flattenAll(all, a = []) {
    all.forEach(i => {
      a.push(i)
      flattenAll(i.children, a)
    })
  }

  const allPaths = []
  flattenAll(paths.children, allPaths)

  const searcher = new FuzzySearch(allPaths, ['searchString', 'name'], {sort: true}, {
    caseSensitive: false,
  });

  const pathIds = searcher.search(query).map(i => i.pathId)
  return pathIds
}

export function fuzzyConceptFilter(concepts, query) {
	const searcher = new FuzzySearch(concepts, ['name'], {sort: true}, {
		caseSensitive: false,
	});

	return searcher.search(query)
}
