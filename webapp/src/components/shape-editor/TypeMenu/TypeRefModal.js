import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import Modal from '@material-ui/core/Modal/index';
import Dialog from '@material-ui/core/Dialog/index';
import DialogTitle from '@material-ui/core/DialogTitle/index';
import Grid from '@material-ui/core/Grid/index';
import TextField from '@material-ui/core/TextField/index';
import List from '@material-ui/core/List/index';
import ListItemText from '@material-ui/core/ListItemText/index';
import ListItem from '@material-ui/core/ListItem/index';
import DialogContent from '@material-ui/core/DialogContent/index';
import {Button} from '@material-ui/core/index';
import {SchemaEditorContext} from '../../../contexts/SchemaEditorContext';
import SchemaEditor from '../SchemaEditor';
import {Commands, DataTypesHelper} from '../../../engine'

const styles = theme => ({
	root: {
		padding: 11,
		overflow: 'hidden',
		height: '100%'
	},
	container: {
		display: 'flex',
		flexDirection: 'row',
		overflow: 'hidden',
		height: 600
	},
	left: {
		width: 180,
		overflow: 'scroll',
		borderRight: '1px solid #e2e2e2'
	},
	right: {
		flex: 1,
		padding: 22,
		overflow: 'scroll'
	},
	title: {
		...theme.typography.h5,
		padding: 22,
		display: 'flex',
		flexDirection: 'row'
	},
	option: {
		paddingLeft: 12,
		height: '37px !important'
	}

});

class TypeRefModal extends React.Component {

	initialState = () => {
		return {
			selected: null
		}
	}

	state = this.initialState()


	componentWillReceiveProps(nextProps, nextContext) {
		if (nextProps.targetId !== this.props.targetId) {
			this.setState(this.initialState())
		}
	}

	select = (id) => () => {
		this.setState({selected: id})
	}

	render() {
		const {classes, targetId} = this.props

		return <SchemaEditorContext.Consumer>
			{({editorState, currentShape, conceptId, operations}) => {

				const {allowedTypeReferences} = currentShape

				const selected = allowedTypeReferences.find(i => i.id === this.state.selected)

				return <Dialog open={Boolean(targetId)} maxWidth="lg" fullWidth={true} onClose={operations.hideRefModal}>
					<div className={classes.title}>
						<div style={{flex: 1}}>Choose Concept</div>
						<div style={{width: 200, textAlign: 'right'}}>
							<Button
								disabled={!selected}
								onClick={() => {
									operations.runCommand(Commands.AssignType(targetId, DataTypesHelper.refTo(selected.id), conceptId ))
									operations.hideRefModal()
								}}
							>
								Set Type to {selected ? selected.name : '[ ]'}</Button>
						</div>
					</div>
					<div className={classes.container}>
						<div className={classes.left}>
							<List dense={true}>
								{allowedTypeReferences.map(ref => {
									return <ListItem
										button
										dense={true}
										key={ref.id}
										className={classes.option}
										selected={ref.id === this.state.selected}
										onClick={this.select(ref.id)}>
										<ListItemText primary={ref.name}/>
									</ListItem>
								})}
							</List>
						</div>
						<div className={classes.right}>
							{this.state.selected ? <SchemaEditor
								service={this.props.service}
								conceptId={this.state.selected} /> : null}
						</div>
					</div>
				</Dialog>
			}}
		</SchemaEditorContext.Consumer>
	}
}

export default withStyles(styles)(TypeRefModal)
