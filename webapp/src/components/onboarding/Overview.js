import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import {primary} from '../../theme';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

const styles = theme => ({
	root: {
		padding: 22,
		paddingTop: 35
	},
});

//Copy
const leadin = <>We built Optic to make it easier to design and document all of your team's internal APIs.
<p>In <b>Documentation</b> mode the API specification is read-only and the layout of each reference page is optimized for API consumers.</p>
<p>When you switch into <b>Design</b> mode, editors are revealed throughout the interface that let you update the API specification visually. Soon we'll be adding commenting, and a new mode for suggestions (like Google-Drive) where changes require approval from your team before being finalized.</p>
</>

const navCopy = <>You can navigate the API by clicking on the down-arrow in the top-left of the screen next to your API's name. You can also start a search using <b>Ctrl-F or Cmd-F</b>.</>

const conceptsCopy = "APIs expose the important concepts from your domain to consumers. If you imported your OpenAPI/Swagger specification, we mapped each schema to a concept. You can edit a concept by entering Design mode and using the shape editor. "

const requestsCopy = <>
	<p>In Optic, requests are grouped by path so it's easy to determine all the operations a resource supports.</p>
	<p>You can add responses types, request bodies, and parameters using the Add menu in the bottom right of the editor that appears when you are in Design mode. After they're created, each of these components can be edited inline.</p>
</>

function ParagraphSplit({left, right, style}) {

	return <Grid container style={style}>
		<Grid item xs={7}>
			{left}
		</Grid>

		<Grid item xs={5} style={{textAlign: 'center'}}>
			{right}
		</Grid>

	</Grid>

}

class OverView extends React.Component {
	render() {

		const {classes} = this.props

		return <div className={classes.root}>
			<Typography variant="h3" color="primary" style={{marginBottom: 28}}>Using the API Designer</Typography>
			<ParagraphSplit
				left={<Typography variant="body1">{leadin}</Typography>}
				right={<div style={{marginTop: 65}}>
					<img width={250} src={"/doc_mode.png"} />
					<img width={250} style={{marginTop: 20}} src={"/design_mode.png"} />
				</div>}
			/>
			<ParagraphSplit
				left={<Typography variant="body1">
					{navCopy}
				</Typography>}
				right={<img width={250} src={"/show-api.png"} />}
			/>


			<Typography variant="h4" color="primary" style={{marginBottom: 20, marginTop: 28}}>Editing Concepts</Typography>
			<Typography variant="body1">{conceptsCopy}</Typography>
			<img width={'90%'} src={"/shape_editor.gif"} style={{marginTop: 11}}/>


			<Typography variant="h4" color="primary" style={{marginBottom: 20, marginTop: 28}}>Editing Endpoints</Typography>
			<ParagraphSplit
				left={<Typography variant="body1">{requestsCopy}</Typography>}
				right={<div><img width={250} src={"/add_menu.gif"} /></div>}
			/>

			will add more here once I can play with it and know which parts are difficult...


			<Typography variant="h4" color="primary" style={{marginBottom: 20, marginTop: 28}}>Need Help?</Typography>
			<Typography variant="body1">We spend every week speaking with users and improving these tools. If you're having any issues we're happy to get on a video call and help you out. You can react us at email@email.com or on Intercom.</Typography>
			<Button href="google.com" color="secondary" target="_blank">Explore Docs</Button>
			<Button href="github.com" color="secondary" target="_blank">Report Issue on GitHub</Button>

		</div>
	}
}

export default withStyles(styles)(OverView)
