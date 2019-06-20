import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import Highlight from 'react-highlight'
import Typography from '@material-ui/core/Typography';
import {Button} from '@material-ui/core';
import {withSnackbar} from 'notistack';
import {withRfcContext} from '../../contexts/RfcContext';
import copy from 'copy-to-clipboard';

const styles = theme => ({
	root: {

	},
});

class ShareDialog extends React.Component {

	copyState = () => {
		const events = this.props.serializeEvents()
		copy(events)
		this.props.enqueueSnackbar('Copied current state to clipboard')
	}

	render() {
		require('highlight.js/styles/tomorrow-night.css')

		return <Dialog open={this.props.open} maxWidth={"md"} fullWidth onClose={this.props.close}>
			<DialogTitle>
				<Typography variant="h4">Share</Typography>
			</DialogTitle>
			<DialogContent>
				<Grid container>
				<Grid container xs={12} style={{marginBottom: 55}}>
					<div style={{display: 'flex', flexDirection: 'column'}}>
						<Typography variant="h5">Persisting your spec in the repo</Typography>
						<Typography variant="body1">
							<p>The easiest way to share your API specification with your team is persist it in your repo. We built a lightweight CLI that lets anyone on your team view and edit the spec by running 'api spec'. Like everything else we've built, it's open source and free to use. All the data and computation is local and is accessible to those with read access to the repo.</p>
						</Typography>

						<Typography variant="button">
							1. Install the CLI using npm
						</Typography>
						<Highlight className='bash'>
							{"npm install @seamless/cli -g"}
						</Highlight>

						<Typography variant="button">
							2. Copy the Editor State to Clipboard
						</Typography>
						<Typography variant="body1">
							Press the button below to copy the current state of your specification from editor to your clipboard
						</Typography>
						<Button color="secondary"
								onClick={this.copyState}
								style={{marginTop: 11, marginBottom: 11, width: 'fit-content'}}>
							Copy Website State</Button>


						<Typography variant="button">
							3. Init Optic in your Repo
						</Typography>
						<Typography variant="body1">
							Now we need to initialize Optic in your repo. We'll pass the '--web-import' flag so Optic knows to read-in the initial spec from the clipboard. Sorry, you can't copy and paste this command or you'll overwrite the state we just copied.
						</Typography>
						<div style={{userSelect: 'none', pointerEvents: 'none'}}>
						<Highlight className='bash'>
							{"cd /path/to/api/\napi init --paste"}
						</Highlight>
						</div>
						<Typography variant="body1">
							You'll see a folder called '.api', this stores a changelog of all the changes made to your API. There's also a ReadMe to help your teammates get setup -- you might want to add a few lines at the top explaining what you liked and dislike about Optic.
						</Typography>

						<Typography variant="button" style={{marginTop: 11}}>
							4. Open the editor locally
						</Typography>
						<Highlight className='bash'>
							{"api spec"}
						</Highlight>

						<Typography variant="body1">
							That's it! Your team can use Optic to design and document your internal APIs and more [coming soon...]
						</Typography>
					</div>
				</Grid>
				{/*<Grid container xs={5}>*/}

				{/*</Grid>*/}
				</Grid>
			</DialogContent>
		</Dialog>
	}
}

export default withRfcContext(withSnackbar(withStyles(styles)(ShareDialog)))
