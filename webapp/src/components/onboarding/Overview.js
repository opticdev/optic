import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import {primary} from '../../theme';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Editor from '../navigation/Editor';
import {withEditorContext} from '../../contexts/EditorContext';
import {ShapeCommands} from '../../engine';
import ContributionTextField from '../contributions/ContributionTextField';
import {renameAPI} from '../../engine/routines';
import {withRfcContext} from '../../contexts/RfcContext';
import Paper from '@material-ui/core/Paper';
import {addAbsolutePath} from '../utilities/PathUtilities';
import sortBy from 'lodash.sortby';
import classNames from 'classnames';
import BasicButton from '../shape-editor/BasicButton';
import {routerUrls} from '../../routes';
import {Link} from 'react-router-dom';

const styles = theme => ({
	root: {
		padding: 22,
		paddingTop: 35
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
});


class OverView extends React.Component {

	render() {
		const {classes, baseUrl, handleCommand, mode, apiName, cachedQueryResults} = this.props;

		const {conceptsById, pathsById, pathIdsWithRequests} = cachedQueryResults;

		const paths = [...pathIdsWithRequests].map(pathId => addAbsolutePath(pathId, pathsById));

		const sortedPaths = sortBy(paths, ['absolutePath']);

		const concepts = Object.values(conceptsById).filter(i => !i.deprecated);
		const sortedConcepts = sortBy(concepts, ['name']);

		return <Editor>
			<div className={classes.root}>
				<Typography variant="h2" color="primary">{apiName}</Typography>

				<Typography variant="h5" color="primary" style={{marginTop: 35}}>Paths</Typography>
				<ul style={{paddingLeft: 5}}>
					{sortedPaths.map(({absolutePath, pathId}) => {
						const to = routerUrls.pathPage(baseUrl, pathId);
						return (
							<Link to={to}>
								<li style={{listStyle: 'none'}}><BasicButton
									className={classNames(classes.pathButton)}
								>
									{absolutePath}</BasicButton></li>
							</Link>);
					})}
				</ul>
			</div>
		</Editor>;
	}
}

export default withRfcContext(withEditorContext(withStyles(styles)(OverView)));
