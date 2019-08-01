import React, {useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Editor, {FullSheetNoPaper} from '../navigation/Editor';
import {EditorModes, withEditorContext} from '../../contexts/EditorContext';
import {withRfcContext} from '../../contexts/RfcContext';
import {addAbsolutePath, getName, getNameWithFormattedParameters, getParentPathId} from '../utilities/PathUtilities';
import sortBy from 'lodash.sortby';
import Paper from '@material-ui/core/Paper';
import {RfcCommands, ShapeCommands} from '../../engine';
import ContributionTextField from '../contributions/ContributionTextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import Collapse from '@material-ui/core/Collapse';
import {Link} from 'react-router-dom';
import {routerUrls} from '../../routes';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import CreateNew from '../navigation/CreateNew';

const styles = theme => ({
	row: {
		padding: 22,
		display: 'flex',
		flexDirection: 'row'
	},
	buttonRow: {
		display: 'flex',
		flexDirection: 'row',
		marginTop: 22
	},
	subView: {
		minHeight: 90,
		flex: 1,
		padding: 11
	},
	bareLink: {
		textDecoration: 'none',
		color: 'inherit',
		cursor: 'pointer'
	},
});

const PathListItem = withRfcContext(({path, baseUrl, cachedQueryResults}) => {
	const {name, children, depth, toggled, pathId} = path;
	const requests = cachedQueryResults.requestIdsByPathId[pathId] || [];
	const [open, setOpen] = React.useState(toggled);

	function handleClick() {
		setOpen(!open);
	}

	const url = routerUrls.pathPage(baseUrl, pathId);

	const requestsWithMethods = requests.map(id => {
		return [id, cachedQueryResults.requests[id].requestDescriptor.httpMethod];
	});

	return <>
		<ListItem style={{paddingLeft: 18 * depth}}>
			<ListItemText primary={<Link to={url} style={{color: 'inherit', textDecoration: 'none'}}>{name}</Link>}/>
			{requestsWithMethods.map(i => {
				return <Link to={url + '#' + i[0]} style={{marginRight: 4, textDecoration: 'none'}}>
					<Chip button color="primary" style={{cursor: 'pointer'}} label={i[1].toUpperCase()}
						  size="small"/>
				</Link>;
			})}
			{children.length ? <IconButton size={'small'}>{(open ? <ExpandLess onClick={handleClick}/> :
				<ExpandMore onClick={handleClick}/>)}</IconButton> : null}
		</ListItem>
		{children.length ? (
			<Collapse in={open} timeout="auto" unmountOnExit>
				{children.map(i => <PathListItem path={i} baseUrl={baseUrl}/>)}
			</Collapse>
		) : null}
	</>;

});


class OverView extends React.Component {

	componentDidMount() {

		const {switchEditorMode} = this.props;
		const {pathIdsWithRequests} = this.props.cachedQueryResults;

		if (pathIdsWithRequests.size === 0) {
			setTimeout(() => {
				switchEditorMode(EditorModes.DESIGN);
			}, 1);
		}

	}

	render() {
		const {classes, apiName, cachedQueryResults, mode, handleCommand, queries, baseUrl} = this.props;
		const {contributions, conceptsById, pathsById, pathIdsWithRequests} = cachedQueryResults;

		const concepts = Object.values(conceptsById).filter(i => !i.deprecated);
		const sortedConcepts = sortBy(concepts, ['name']);


		const pathTree = flattenPaths('root', pathsById);
		const paths = [...pathIdsWithRequests].map(pathId => addAbsolutePath(pathId, pathsById));

		const desc = contributions.getOrUndefined('api', 'description');
		const complexity = queries.complexityScore();

		return (
			<Editor>
				<FullSheetNoPaper>
					<Paper className={classes.row}>
						<div style={{flex: 1, paddingBottom: 11}}>
							<Typography variant="h3" color="primary">{apiName}</Typography>

							<ContributionTextField
								key={`api-desc`}
								value={desc}
								variant={'multi'}
								placeholder={'API Description'}
								mode={mode}
								style={{marginTop: 22}}
								onBlur={(value) => {
									const command = RfcCommands.AddContribution('api', 'description', value);
									handleCommand(command);
								}}
							/>
						</div>

						<div style={{width: 230, paddingLeft: 30, paddingTop: 11}}>
							<Typography variant="overline" color="primary">
								API Complexity: <b style={{fontSize: '1.1em'}}> {complexity}</b>
							</Typography>
						</div>

					</Paper>

					<div className={classes.buttonRow}>
						<Paper className={classes.subView} style={{marginRight: 25}}>
							<Typography variant="h5" color="primary">Paths</Typography>

							<List dense>
								{pathTree.children.map(i => <PathListItem path={i} baseUrl={baseUrl}/>)}
							</List>

							{pathTree.children.length === 0 ? (
								<CreateNew render={({addRequest, classes}) => {
									return <>There are no paths in your API <Button
										color="secondary" onClick={() => {
										this.props.switchEditorMode(EditorModes.DESIGN);
										addRequest();
									}}>Add Request</Button></>;
								}}/>
							) : null}

						</Paper>
						<Paper className={classes.subView}>
							<Typography variant="h5" color="primary">Concepts</Typography>

							<List dense>
								{sortedConcepts.map(i => {
									const to = routerUrls.conceptPage(baseUrl, i.shapeId);
									return <Link to={to} style={{textDecoration: 'none', color: 'inherit'}}>
										<ListItem button dense>
											<ListItemText primary={i.name}/>
										</ListItem>
									</Link>;
								})}
							</List>

							{sortedConcepts.length === 0 ? (
								<CreateNew render={({addConcept, classes}) => {
									return <>There are no concepts in your API.
										<Button
										color="secondary" onClick={() => {
										this.props.switchEditorMode(EditorModes.DESIGN);
										addConcept();
									}}>Add Concept</Button></>;
								}}/>
							) : null}


						</Paper>
					</div>


				</FullSheetNoPaper>
			</Editor>
		);
	}
}

function flattenPaths(id, paths, depth = 0) {
	const path = paths[id];
	const name = '/' + getNameWithFormattedParameters(path);

	const children = Object.entries(paths)
		.filter(i => {
			const [childId, childPath] = i;
			return getParentPathId(childPath) === id;
		}).map(i => {
			const [childId, childPath] = i;
			return flattenPaths(childId, paths, depth + 1);
		});

	return {
		name,
		toggled: depth < 2,
		children: sortBy(children, 'name'),
		depth,
		pathId: id
	};
}

export default withRfcContext(withEditorContext(withStyles(styles)(OverView)));
