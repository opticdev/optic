import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import {TutorialContext} from '../../contexts/TutorialContext';
import DialogContent from '@material-ui/core/DialogContent';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import Grid from '@material-ui/core/Grid';
import {primary} from '../../theme';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import {ReactTypeformEmbed} from 'react-typeform-embed';
import Button from '@material-ui/core/Button';

const styles = theme => ({
	root: {},
	stepper: {
		height: 50,
		width: 280,
		margin: '0 auto',
		backgroundColor: 'white'
	},
	content: {
		height: 400
	},
	paperImg: {
		width: 380,
		height: 'fit-content',
		maxHeight: 215,
		marginTop: 40,
		margin: '0 auto',
	},
	img: {
		backgroundColor: '#e2e2e2'
	},
	nextButton: {
		position: 'absolute',
		bottom: 33,
		right: 50,
	}
});

class TutorialDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			step: 0
		};
	}

	handleStep = (index) => {
		this.setState({step: index});
	};

	handleNext = () => {
		//validate
		this.setState({step: this.state.step + 1});
	};

	render() {

		const {classes, isNew} = this.props;
		const {step} = this.state;

		const steps = [
			['', <ReactTypeformEmbed url="https://adc2019.typeform.com/to/I9houZ" style={{height: 545}}/>],
			['API Designer + Documentation', <>
				<Grid container>
					<Grid item xs={12}>
						<Typography variant="h6" style={{textAlign: 'center'}}>
							Seamless combines a powerful API Designer and beautiful API docs.
						</Typography>
					</Grid>
					<Grid item xs={6} style={{textAlign: 'center'}}>
						<Paper className={classes.paperImg}><img className={classes.img} src="/doc-mode.png"
																 width="100%"/></Paper>
					</Grid>
					<Grid item xs={6} style={{textAlign: 'center'}}>
						<Paper className={classes.paperImg}><img className={classes.img} src="/design-mode.png"
																 width="100%"/></Paper>
					</Grid>
				</Grid>
			</>],
			['Search your API Docs', <>
				<Grid container>
					<Grid item xs={12}>
						<Typography variant="h6" style={{textAlign: 'center'}}>
							Search your API's documentation from the Explore Menu or by double-tapping Shift
						</Typography>
					</Grid>
					<Grid item xs={12} style={{textAlign: 'center'}}>
						<Paper className={classes.paperImg}><img className={classes.img} src="/search.gif" width="100%"/></Paper>
					</Grid>
				</Grid>
			</>],
			['Design Concepts', <>
				<Grid container>
					<Grid item xs={12}>
						<Typography variant="h6" style={{textAlign: 'center'}}>
							Model the important concepts in your domain with Seamless's shape builder
						</Typography>
					</Grid>
					<Grid item xs={12} style={{textAlign: 'center'}}>
						<Paper className={classes.paperImg}><img className={classes.img} src="/creating-concepts.gif"
																 width="100%"/></Paper>
					</Grid>
				</Grid>
			</>],
			['Describe Your Requests', <>
				<Grid container>
					<Grid item xs={12}>
						<Typography variant="h6" style={{textAlign: 'center'}}>
							Describe your API's paths, requests and responses
						</Typography>
					</Grid>
					<Grid item xs={12} style={{textAlign: 'center'}}>
						<Paper className={classes.paperImg}><img className={classes.img} src="/creating-requests.gif"
																 width="100%"/></Paper>
					</Grid>
				</Grid>
			</>]
		];

		if (!isNew) {
			steps.shift();
		}

		const [StepTitle, StepContent] = steps[step];

		return <TutorialContext.Consumer>
			{({tutorialCompleted, showTutorial}) => {

				const isLastStep = !steps[step+1]

				return <Dialog open={showTutorial} onClose={tutorialCompleted} maxWidth="md" fullWidth>
					<DialogTitle>
						<Typography variant="h4" color="primary" style={{textAlign: 'center'}}>
							{StepTitle}
						</Typography>
					</DialogTitle>

					<DialogContent>

						<div className={classes.content}>
							<div style={{height: 320}}>
								{StepContent}
							</div>

							<Stepper alternativeLabel nonLinear activeStep={step} className={classes.stepper}>
								{steps.map((step, index) => {
									const stepProps = {};
									const buttonProps = {};
									return (
										<Step key={index} {...stepProps}>
											<StepButton
												disableRipple={true}
												onClick={() => this.handleStep(index)}
												// completed={isStepComplete(index)}
												{...buttonProps}
												icon={' '}
											>
											</StepButton>
										</Step>
									);
								})}
							</Stepper>
							<Button color='secondary' className={classes.nextButton} onClick={() => {
								if (isLastStep) {
									tutorialCompleted()
								} else {
									this.handleNext()
								}
							}}>{ (isLastStep) ? 'Finish' : 'Next'} -></Button>
						</div>

					</DialogContent>
				</Dialog>;
			}}
		</TutorialContext.Consumer>;
	}
}

export default withStyles(styles)(TutorialDialog);
