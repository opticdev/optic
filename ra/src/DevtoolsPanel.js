import React from 'react';
import {Switch, Route, Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography/index';
import List from '@material-ui/core/List/index';
import ListItem from '@material-ui/core/ListItem/index';
import ListItemText from '@material-ui/core/ListItemText/index';
import TextField from '@material-ui/core/TextField/index';
import pathToRegexp from 'path-to-regexp/index';
import Button from '@material-ui/core/Button/index';
import Paper from '@material-ui/core/Paper/index';
import Chip from '@material-ui/core/Chip/index';
import Zip from 'jszip';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

export function withChrome(f) {
	if (global.chrome) {
		f(global.chrome);
	}
}

function groupByDomain(harEntries) {
	const groups = harEntries
		.reduce((acc, entry) => {
			const host = new URL(entry.request.url).hostname;
			const values = acc.get(host) || [];
			values.push(entry);
			acc.set(host, values);
			return acc;
		}, new Map());
	return groups;
}

function wrapHarEntries(entries) {
	return {
		log: {
			entries
		}
	};
}

class PathsForHost extends React.Component {
	state = {
		path: '',
		savedPaths: []
	};
	handlePathChange = (e) => {
		const path = e.target.value;
		this.setState({
			path,
		});
	};
	addPath = () => {
		this.setState({
			savedPaths: [...this.state.savedPaths, this.state.path].sort(),
			path: ''
		});
	};

	downloadStuff = () => {
		const {groups, match} = this.props;
		const {hostname} = match.params;
		const harFileName = 'har.json';
		const harFileContents = JSON.stringify(wrapHarEntries(groups.get(hostname)), null, 2);

		const ymlPaths = ['', ...this.state.savedPaths.map(x => `"${x}"`)].join('\n    - ');
		const opticYmlContents = `document:
  id: ${hostname.replace(/[^\w\d-]/g, '-')}
  version: 0.1.0
  har: ${harFileName}		
  paths: ${ymlPaths}
		`;
		const opticYmlFileName = 'optic.yml';

		withChrome((chrome) => {
			const zip = new Zip();
			zip.file(harFileName, harFileContents);
			zip.file(opticYmlFileName, opticYmlContents);
			zip.generateAsync({type: 'blob'})
				.then(function (blob) {
					const url = window.URL.createObjectURL(blob);
					console.log({url});
					chrome.downloads.download({url, filename: 'optic.zip'});
				});
		});
	};

	removeSavedPath = (pathname) => () => {
		this.setState({
			savedPaths: this.state.savedPaths.filter(x => x !== pathname)
		});
	};

	render() {
		const {match} = this.props;
		const {path, savedPaths} = this.state;
		const regex = pathToRegexp(path);
		console.log({path, regex});
		const {hostname} = match.params;
		return (
			<HarContext.Consumer>
				{({groups}) => {
					const entriesForHost = groups.get(hostname);
					const regexes = this.state.savedPaths.map(x => pathToRegexp(x));
					const urls = [...new Set(entriesForHost.map(x => new URL(x.request.url).pathname))]
						.filter(path => !regexes.some(regex => regex.test(path)))
						.sort();
					return (
						<div>
							{urls.length === 0 ? null : (
								<Paper style={{padding: 10, margin: 10}}>
									<Typography variant="h4">Unsaved Paths</Typography>
									<TextField
										label="path expression" value={path} onChange={this.handlePathChange}
										fullWidth/>
									{path !== '' && <Button color="secondary" onClick={this.addPath}>Save</Button>}
									<Typography variant="subheading">paths matching expression:</Typography>
									<List>
										{urls.map(pathname => {
											const isMatch = regex.test(pathname);
											return (
												<ListItem
													button
													key={pathname} selected={isMatch}
													onClick={() => this.setState({path: pathname})}>
													<ListItemText>{pathname}</ListItemText>
												</ListItem>
											);
										})}
									</List>
								</Paper>
							)}
							<Paper style={{padding: 10, margin: 10}}>
								<Typography variant="h4">Saved Paths</Typography>
								<List>
									{savedPaths.map((pathname) => {
										return (
											<ListItem
												button
												key={pathname} onClick={() => this.setState({path: pathname})}>
												<ListItemText>{pathname}</ListItemText>
												<ListItemSecondaryAction>
													<IconButton
														aria-label="Delete" onClick={this.removeSavedPath(pathname)}>
														<DeleteIcon/>
													</IconButton>
												</ListItemSecondaryAction>
											</ListItem>
										);
									})}
								</List>
								{savedPaths.length === 0 ? (
									<Typography variant="body1">save observed paths above to continue</Typography>
								) : (
									<Button color="secondary" onClick={this.downloadStuff}>Download optic.yml</Button>
								)}
							</Paper>
						</div>
					);
				}}
			</HarContext.Consumer>
		);
	}
}

export const HarContext = React.createContext(null);

export class HarStore extends React.Component {
	state = {
		entries: []
	};
	setEntries = (entries) => {
		this.setState({
			entries
		});
	};

	render() {
		const {entries} = this.state;
		const har = {log: {entries}};
		const groups = groupByDomain(entries);
		return (
			<HarContext.Provider value={{har, groups, setEntries: this.setEntries}}>
				{this.props.children}
			</HarContext.Provider>
		);
	}
}

export const withHar = function (Wrapped) {
	return function (props) {
		return (
			<HarContext.Consumer>
				{(harContext) => {
					return <Wrapped {...props} {...harContext} />;
				}}
			</HarContext.Consumer>
		);
	};
};

class DevtoolsPanel extends React.Component {
	render() {
		const {match} = this.props;
		return (
			<HarContext.Consumer>
				{({groups}) => {
					return (
						<div>
							<Paper style={{margin: 10, padding: 10}}>
								<Link to="/capture">back to capture</Link>
							</Paper>
							<Paper style={{margin: 10, padding: 10}}>{
								[...groups.entries()]
									.map(([key, values]) => {
										return (
											<Chip component={Link} to={`${match.url}/${key}`}
												  label={`${key}: ${values.length}`}/>
										);
									})
							}
							</Paper>

							<Switch>
								<Route path={`${match.path}/:hostname`} component={withHar(PathsForHost)}/>
							</Switch>
						</div>
					);
				}}
			</HarContext.Consumer>
		);
	}
}

DevtoolsPanel.propTypes = {};

export default DevtoolsPanel;