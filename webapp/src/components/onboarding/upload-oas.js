import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import LinearProgress from '@material-ui/core/LinearProgress';
import {withRouter} from 'react-router-dom';
import {withImportedOASContext} from '../../contexts/ImportedOASContext';

const styles = theme => ({
	root: {
		backgroundColor: '#fafafa',
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		height: '100%',
		alignItems: 'center',
	},
	uploadCenter: {
		width: 500,
		height: 200,
		marginTop: 200,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center'
	},
	leftIcon: {
		marginRight: theme.spacing(1),
	},
	uploadButton: {
	}
});

class UploadOAS extends React.Component {

	state = {
		fileUploaded: false,
		error: null
	}

	fileSelected = (event) => {
		const file = event.target.files[event.target.files.length - 1]
		const c = this


		if (file) {
			let reader = new FileReader();
			reader.readAsText(file, "UTF-8");
			reader.onload = function (evt) {
				const contents = evt.target.result;
				c.setState({fileUploaded: true, error: null})
				c.processSpec(contents)
			}
			reader.onerror = function (evt) {
				debugger
			}
		}

	}

	processSpec = async (contents) => {
		const {history, setProvidedCommands} = this.props

		const response = await fetch('https://hfsop9qif1.execute-api.us-east-2.amazonaws.com/dev/oas/coversion', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({fileContents: contents})
		});

		if (response.status === 200) {
			const commands = await response.text()
			setProvidedCommands(commands, () => history.push('/new'))
		} else {
			console.error('OAS parse error '+ await response.text())
			this.setState({fileUploaded: false, error: 'Error parsing OAS file. Please make sure it is valid and try again'})
		}
	}

	render() {

		const {classes} = this.props
		const {fileUploaded, error} = this.state

		return <div className={classes.root}>

			<Paper elevation={2} className={classes.uploadCenter}>

				<Typography variant="overline" color="primary"
							style={{lineHeight: 1.4, fontSize: 20, marginBottom: 11}}>Import an existing API Specification</Typography>

				{!fileUploaded ? (
					<>
				<input
					accept=".json,application/json,.yaml,.yml"
					className={classes.input}
					style={{ display: 'none' }}
					id="raised-button-file"
					multiple
					onChange={this.fileSelected}
					type="file"
				/>
				{error ? <Typography variant="overline" color="error"></Typography> : null}
				<label htmlFor="raised-button-file">
					<Button variant="contained" component="span" color="secondary" className={classes.uploadButton}>
						<CloudUploadIcon className={classes.leftIcon} color="default" />
						Select OAS File
					</Button>
				</label>
				</>
				) : (
					<>
					<Typography variant="body1" style={{color: '#27794e'}}>Spec Selected. Processing...!</Typography>
					<Typography variant="caption" style={{color: '#49525f'}}>This will take a few seconds</Typography>
					<LinearProgress variant="indeterminate" style={{width: 400, marginTop: 22}} />
					</>
				)}


			</Paper>

		</div>
	}
}

export default withImportedOASContext(withRouter(withStyles(styles)(UploadOAS)))
