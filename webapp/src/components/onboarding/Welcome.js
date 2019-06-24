import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import {primary} from '../../theme';
import Divider from '@material-ui/core/Divider';
import ThumbUp from '@material-ui/icons/ThumbUp';
import Launch from '@material-ui/icons/Launch';
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import {Link} from 'react-router-dom';
import {track} from '../../Analytics';


const styles = theme => ({
	root: {
		backgroundColor: '#fafafa',
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		height: '100%',
		alignItems: 'center',
		paddingBottom: 200
	},
	welcomeCenter: {
		width: 850,
		height: 'fill-content',
		marginTop: 100,
		display: 'flex',
		flexDirection: 'column',
		paddingTop: 50,
		padding: 22
	},
	roadmapItem: {
		marginTop: 10,
		flexDirection: 'row',
		display: 'flex'
	},
	button: {
		margin: '0 auto',
		width: 300
	},
	leftIcon: {
		marginRight: theme.spacing(1),
	},
	rightIcon: {
		marginLeft: theme.spacing(1),
	},
	iconSmall: {
		fontSize: 20,
	},
	exampleImage: {
		height: 40,
		margin: theme.spacing(2),
	}
});

const tagline = 'Open Source Toolkit for API Design';
const valueProps = [
	<><b>The visual API designer</b> improves productivity and helps your team build higher quality APIs</>,
	<><b>Let Optic deal with OpenAPI</b>, you get to focus on designing great APIs.</>,
	<><b>Documentation mode</b> makes specifications more accessible to team members</>,
	<><b>Import an existing Swagger/OpenAPI</b> specification or start from scratch</>,
	<><b>Open Source</b> and developed by Optic (YCombinator S18)</>
];

const roadmapHeading = 'On the Roadmap';

// const RoadMapItems = [
// 	{title: 'API Linting ', githubIssue: '', id: 0, upvotes: 212},
// 	{title: 'Suggest / Review / Approve Changes Workflow', githubIssue: '', id: 0, upvotes: 112},
// 	{title: 'Integrated Code Generators', githubIssue: '', id: 0, upvotes: 94},
// 	{title: 'Contract Testing Tools', githubIssue: '', id: 0, upvotes: 45},
// ];

const Examples = [
	{logo: 'github.png', link: 'github'},
	{logo: 'circleci.png', link: 'circleci'},
	{logo: 'jira.svg', link: 'jira'},
	{logo: 'stripe.svg', link: 'stripe'},
	{logo: 'launchdarkly.png', link: 'launchdarkly'},
	{logo: 'netlify.svg', link: 'netlify'},
	{logo: 'gitlab.svg', link: 'gitlab'},
]

const tryItOut = 'Try Seamless';

class Welcome extends React.Component {

	componentDidMount() {
		track("Loaded Welcome");
	}

	render() {

		const {classes} = this.props;

		return <div className={classes.root}>

			<Paper elevation={2} className={classes.welcomeCenter}>
				<Typography variant="h1" color="primary"
							style={{fontWeight: 500, textAlign: 'center', marginTop: 12}}>{'{seamless}'}</Typography>
				<Typography variant="overline" color="primary"
							style={{textAlign: 'center', fontSize: 30, marginTop: 25}}>{tagline}</Typography>

				<Grid container>
					<Grid item xs={6}>
						<img style={{width: 400,  margin: '0 auto'}} src="/app-screenshot.png"/>
					</Grid>

					<Grid item xs={6}>
						<ul>
							{valueProps.map((text, index) => (
								<li key={index}>
									<Typography variant="body1" color="primary"
												style={{lineHeight: 1.4}}>{text}</Typography>
								</li>
							))}
						</ul>
					</Grid>
				</Grid>

				<Divider style={{marginTop: 50}}/>

				<Typography variant="overline" color="primary"
							style={{textAlign: 'center', fontSize: 30, marginTop: 30}}>{tryItOut}</Typography>


				<Grid container>
					<Grid item xs={6} style={{textAlign: 'center'}}>
						<Link to={'/upload-oas'} style={{textDecoration: 'none'}}>
						<Button variant="contained" color="secondary" className={classes.button}>
							<CloudUploadIcon className={classes.leftIcon} />
							Upload OpenAPI/Swagger Spec
						</Button>
						</Link>
					</Grid>
					<Grid item xs={6} style={{textAlign: 'center'}}>
						<Link to={'/new'} style={{textDecoration: 'none'}}>
							<Button variant="contained" color="secondary" className={classes.button}>
								<Launch className={classes.leftIcon} />
								Start New API
							</Button>
						</Link>
					</Grid>

					<Grid item xs={12} style={{textAlign: 'center', paddingTop: 30}}>

						<Typography variant="overline" color="primary" style={{fontSize: 15, }}>OR try it with one of these Popular APIs</Typography>

						<div>
							{Examples.map(i => (
								<Link to={`/examples/${i.link}`} onClick={() => {
									track("Loaded Example", {name: i.link});
								}}>
									<img className={classes.exampleImage} src={'/example-logos/'+i.logo} />
								</Link>))}
						</div>

					</Grid>

				</Grid>



				{/*<Divider style={{marginTop: 50}}/>*/}

				{/*<Typography variant="overline" color="primary"*/}
				{/*			style={{textAlign: 'center', fontSize: 30, marginTop: 30}}>{roadmapHeading}</Typography>*/}

				{/*<ul>*/}
				{/*	{RoadMapItems.map((roadmapItem, index) => (*/}
				{/*		<li key={index} className={classes.roadmapItem}>*/}
				{/*			<Typography variant="body1" color="primary"*/}
				{/*						style={{lineHeight: 1.4, fontSize: 20}}>{roadmapItem.title}</Typography>*/}

				{/*			<div style={{marginTop: -2, marginLeft: 23}}>*/}
				{/*				<Button className={classes.upvote}>*/}
				{/*					(view Issue)*/}
				{/*				</Button>*/}


				{/*				<Button className={classes.upvote} color="secondary">*/}
				{/*					Upvote ({roadmapItem.upvotes})*/}
				{/*				</Button>*/}
				{/*			</div>*/}
				{/*		</li>*/}
				{/*	))}*/}
				{/*</ul>*/}

			</Paper>

		</div>;
	}
}

export default withStyles(styles)(Welcome);
