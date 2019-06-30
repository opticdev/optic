import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import {Typography} from '@material-ui/core';
import {EditorModes, withEditorContext} from '../../contexts/EditorContext';

const styles = theme => ({
	root: {
		display: 'flex',
		flexDirection: 'row',
	},
});

class RequestPageHeader extends React.Component {
	render() {
		const {forType, classes, mode, addAction} = this.props;

		return <div style={{marginTop: 22}}>
			<div className={classes.root}>
				<Typography variant="h6" color="primary" style={{width: 200}}>{forType}{'s'}</Typography>
				<div style={{flex: 1}}/>
				{mode === EditorModes.DESIGN ?
					<Button color="secondary" onClick={addAction} className={classes.root}>+ {forType}</Button> : null}
			</div>
		</div>;
	}
}

export default withEditorContext(withStyles(styles)(RequestPageHeader));
