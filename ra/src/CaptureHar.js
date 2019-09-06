import React from 'react';
import PropTypes from 'prop-types';
import {withChrome, withHar} from './DevtoolsPanel';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import {withRouter} from 'react-router-dom';

global.shouldLogEntry = function (entry) {
	const isJsonResponse = entry.response.content.mimeType.indexOf('application/json') === 0;
	const isPost = !!entry.request.postData;
	return isJsonResponse || isPost;
};

class CaptureHar extends React.Component {
	state = {
		shouldListen: false,
		entries: []
	};

	componentDidMount() {
		withChrome((chrome) => {
			chrome.devtools.network.onRequestFinished
				.addListener((entry) => {
					if (!this.state.shouldListen) {
						return;
					}
					if (!global.shouldLogEntry(entry)) {
						return;
					}
					entry.getContent((text, encoding) => {
						console.log({entry, text, encoding});
						const responseWithContent = {
							...entry.response,
							content: {
								...entry.response.content,
								text,
								encoding
							}
						};
						const entryWithContent = {
							...entry,
							response: responseWithContent
						};
						this.setState({
							entries: [...this.state.entries, entryWithContent]
						});
					});
				});
		});
	}

	start = () => {
		this.setState({
			shouldListen: true
		});

	};

	stop = () => {
		this.setState({
			shouldListen: false
		});
	};

	done = () => {
		this.props.setEntries(this.state.entries);
		this.props.history.push('/cleanup');
	};

	reset = () => {
		this.setState({entries: []});
	};

	render() {
		return (
			<Paper style={{margin: 10, padding: 10}}>
				<Button onClick={this.start} disabled={this.state.shouldListen}>start</Button>
				<Button onClick={this.stop} disabled={!this.state.shouldListen}>stop</Button>
				<Button onClick={this.done} disabled={this.state.entries.length === 0}>done</Button>
				<Button onClick={this.reset} disabled={this.state.entries.length === 0}>reset</Button>
				<Typography variant="h6">{this.state.entries.length} API interactions captured</Typography>
				<Typography variant="caption">
					{this.state.shouldListen ? 'capturing...' : 'press start to capture API interactions'}
				</Typography>
			</Paper>
		);
	}
}

CaptureHar.propTypes = {};

export default withRouter(withHar(CaptureHar));