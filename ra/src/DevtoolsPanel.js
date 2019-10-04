import React from 'react';
import url from 'url';
import { Switch, Route, Link } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Zip from 'jszip';
import { BodyParser } from './BodyParser';

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
function nameAndValueListToObject(nameAndValueList) {
	return nameAndValueList.reduce((acc, { name, value }) => {
		acc[name] = value;
		return acc;
	}, {});
}

function decodeRequestBody(harRequest) {
	const { postData = {} } = harRequest;
	const { mimeType, text } = postData;
	console.log(postData)
	return new BodyParser().parse(mimeType, text)
}

function decodeResponseBody(harResponse) {
	const { content } = harResponse;
	const { size, mimeType, text } = content;
	if (size > 0) {
		return new BodyParser().parse(mimeType, text)
	}
	return text;
}

export function toApiInteraction(entry) {
	const parsedUrl = url.parse(entry.request.url, true);
	const cookies = nameAndValueListToObject(entry.request.cookies);
	return {
		request: {
			url: parsedUrl.pathname,
			method: entry.request.method,
			headers: nameAndValueListToObject(entry.request.headers),
			cookies,
			queryParameters: parsedUrl.query,
			body: (entry.request.postData) ? decodeRequestBody(entry.request) : null
		},
		response: {
			statusCode: entry.response.status,
			headers: nameAndValueListToObject(entry.response.headers),
			body: (entry.response.content) ? decodeResponseBody(entry.response) : null
		}
	};
}

class PathsForHost extends React.Component {
	downloadStuff = () => {
		const { groups, match } = this.props;
		const { hostname } = match.params;
		const entries = groups.get(hostname)

		const readmeFileName = 'Readme.md'
		const readmeFileContents = `Install the Optic CLI ('npm install -g @useoptic/cli') and then run 'api spec'.`
		const harFileName = 'har.json';
		const harFileContents = JSON.stringify(wrapHarEntries(entries), null, 2);
		const sessionFileName = `${hostname}.optic_session.json`
		const sessionFileContents = JSON.stringify({
			session: {},
			samples: entries.map(x => toApiInteraction(x))
		})
		withChrome((chrome) => {
			const zip = new Zip();
			zip.file(readmeFileName, readmeFileContents);
			zip.file(harFileName, harFileContents);
			zip
				.folder('.api')
				.file('api.yml', '')
				.folder('sessions')
				.file(sessionFileName, sessionFileContents);
			console.log(zip)
			zip.generateAsync({ type: 'blob' })
				.then(function (blob) {
					const url = window.URL.createObjectURL(blob);
					console.log({ url });
					chrome.downloads.download({ url, filename: `optic_${hostname}.zip` });
				});
		});
	};

	render() {
		const { match } = this.props;
		const { hostname } = match.params;

		return (
			<HarContext.Consumer>
				{({ groups }) => {
					const entries = groups.get(hostname)
					const urls = [...new Set(entries.map(entry => entry.request.url))].sort()
					return (
						<div>
							<div style={{ margin: 10, padding: 10 }}>
								<Button color="secondary" onClick={this.downloadStuff}>Download log for {hostname}</Button>
							</div>
							<Paper style={{ margin: 10, padding: 10 }}>
								<List>
									{urls.map(url => {
										return (
											<ListItem button>
												<ListItemText>{url}</ListItemText>
											</ListItem>
										)
									})}
								</List>
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
		const { entries } = this.state;
		const har = { log: { entries } };
		const groups = groupByDomain(entries);
		return (
			<HarContext.Provider value={{ har, groups, setEntries: this.setEntries }}>
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
		const { match } = this.props;
		return (
			<HarContext.Consumer>
				{({ groups }) => {
					return (
						<div>
							<Paper style={{ margin: 10, padding: 10 }}>
								<Link to="/capture">&larr; back to capture</Link>
							</Paper>
							<Paper style={{ margin: 10, padding: 10 }}>{
								[...groups.entries()]
									.map(([key, values]) => {
										return (
											<Chip component={Link} to={`${match.url}/${key}`}
												label={`${key}: ${values.length}`} />
										);
									})
							}
							</Paper>

							<Switch>
								<Route path={`${match.path}/:hostname`} component={withHar(PathsForHost)} />
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