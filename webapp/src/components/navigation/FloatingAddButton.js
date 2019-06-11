import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import Button from '@material-ui/core/Button';
import ArrowRightAlt from '@material-ui/icons/ArrowRightAlt';
import Code from '@material-ui/icons/Code';
import Description from '@material-ui/icons/Description';
import Search from '@material-ui/icons/Search';
import Label from '@material-ui/icons/Label';
import Message from '@material-ui/icons/Message';
import QuestionAnswer from '@material-ui/icons/QuestionAnswerOutlined';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import KeyboardVoiceIcon from '@material-ui/icons/KeyboardVoice';
import Icon from '@material-ui/core/Icon';

const styles = theme => ({
	fab: {
		position: 'fixed',
		bottom: 50,
		right: 50
	},
	wrapper: {
		display: 'flex',
		flexDirection: 'row'
	},
	button: {
	},
	leftIcon: {
		marginRight: theme.spacing.unit,
	},
	rightIcon: {
		marginLeft: theme.spacing.unit,
	},
	iconSmall: {
		fontSize: 20,
	},
});

class FloatingAddButton extends React.Component {

	state = {
		anchorEl: false,
	}

	handleOpen = (event) => {
		this.setState({anchorEl: event.target})
	}

	handleClose = (event) => {
		this.setState({anchorEl: false})
	}

	render() {
		const {classes} = this.props
		return (
			<>
			<Fab className={classes.fab} color="secondary" onClick={this.handleOpen}>
				<AddIcon />
			</Fab>

				<Menu open={Boolean(this.state.anchorEl)} anchorEl={this.state.anchorEl} onClose={this.handleClose}>
					<div className={classes.wrapper}>
						<List dense subheader={<ListSubheader>API</ListSubheader>}>
							<ListItem>
								<Button color="primary" className={classes.button}>
									<ArrowRightAlt className={classes.leftIcon} />
									Resource
								</Button>
							</ListItem>

							<ListItem>
								<Button color="primary" className={classes.button}>
									<Code className={classes.leftIcon} />
									Operation
								</Button>
							</ListItem>

							<ListItem>
								<Button color="primary" className={classes.button}>
									<Description className={classes.leftIcon} />
									Concept
								</Button>
							</ListItem>

						</List>

						<List dense subheader={<ListSubheader>POST</ListSubheader>}>
							<ListItem>
								<Button color="primary" className={classes.button}>
									<Search className={classes.leftIcon} />
									Query Parameter
								</Button>
							</ListItem>

							<ListItem>
								<Button color="primary" className={classes.button}>
									<Label className={classes.leftIcon} />
									Header Parameter
								</Button>
							</ListItem>

							<ListItem>
								<Button color="primary" className={classes.button}>
									<Message className={classes.leftIcon} />
									Request Body
								</Button>
							</ListItem>

							<ListItem>
								<Button color="primary" className={classes.button}>
									<QuestionAnswer className={classes.leftIcon} />
									Response
								</Button>
							</ListItem>

						</List>
					</div>
				</Menu>
			</>
		)
	}
}

export default withStyles(styles)(FloatingAddButton)
