import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';

const styles = theme => ({
  search: {
    position: 'relative',
    margin: 6,
    marginBottom: 6,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: '#e2e2e2',
    '&:hover': {
      backgroundColor: '#e2e2e2',
    },
    marginLeft: 0,
    width: '100%'
  },
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    width: '100%',
  },
});

class ApiSearch extends React.Component {
	render() {
	  const {classes} = this.props
		return (
      <div className={classes.search}>
        <div className={classes.searchIcon}>
          <SearchIcon />
        </div>
        <InputBase
          placeholder="Search…"
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput,
          }}
          inputProps={{ 'aria-label': 'search' }}
        />
      </div>
    )
	}
}

export default withStyles(styles)(ApiSearch)
