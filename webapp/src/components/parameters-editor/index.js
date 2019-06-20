import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {primary} from '../../theme';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableBody from '@material-ui/core/TableBody';
import classNames from 'classnames'
import {seedString} from '../../engine/examples/ExampleData';
import SchemaEditor from '../shape-editor/SchemaEditor';
import {DisplayRootTypeName} from '../shape-editor/TypeName';
import ParameterNameInput from './ParameterNameInput';


const styles = theme => ({
	root: {
		maxWidth: 800,
	},
	paper: {
		marginTop: theme.spacing(3),
		width: '100%',
		overflowX: 'auto',
		marginBottom: theme.spacing(2),
	},
	table: {
		minWidth: 650,
	},

	tableTitle: {
		padding: 10,
		paddingBottom: 15,
		color: primary
	},
	nameCol: {
		width: 150,
		overflow: 'hidden'
	},
	required: {
		fontSize: 11,
		color: '#122739'
	},
	cell: {
		border: 'none',
	},
	expandContent: {
		margin: 0
	},
	singleLine: {
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		width: 500
	},
	multiLine: {
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		width: 500
	},
	nameCell: {
		paddingLeft: 0,
		marginLeft: -10
	},
	detailRoot: {
		display: 'flex',
		flexDirection: 'column'
	},
	expandedSummary: {
		marginBottom: -20
	},
	focusedSummary: {
		backgroundColor: 'white !important'
	}
});

function createData(name, description, type, required) {
	return { name, description, type, required, inlineConceptId: seedString(handler, name) };
}
const rows = [
	createData('sort', 'the key we should sort the data by, the key we should sort the data by, the key we should sort the data bythe key we should sort the data bythe key we should sort the data bythe key we should sort the data by', 'String',true),
	createData('filter', 'JSON filter using our query', 'Object (4 fields)', false),
	createData('latitude', 'the latitude of the object', 'Number'),
	createData('longitude', 'The longitude of the object', 'Number', true),
	createData('hello', '356, 16.0, 49, 3.9'),
];


class ParametersEditor extends React.Component {

	state = {
		expandedParameterIds: []
	}

	updateExpandedParameterIds = (id) => (e, opened) => {
		const inArray = this.state.expandedParameterIds.includes(id)
		if (inArray && !opened) {
			this.setState({expandedParameterIds: this.state.expandedParameterIds.filter(i => i !== id)})
		} else if (!inArray && opened) {
			this.setState({expandedParameterIds: [...this.state.expandedParameterIds, id]})
		}
	}

	render() {

		const {classes, mode} = this.props

		return (
			<div className={classes.root}>
				<Typography variant="h5" className={classes.tableTitle}>Query Parameters</Typography>
				<Table className={classes.table} size="small">
					<TableBody>
						{rows.map(row => {

							const isExpanded = this.state.expandedParameterIds.includes(row.name)

							return (<>
									<ExpansionPanel onChange={this.updateExpandedParameterIds(row.name)}>
										<ExpansionPanelSummary
											expandIcon={<ExpandMoreIcon/>}
											aria-controls="panel1a-content"
											classes={{
												content: classes.expandContent,
												expanded: classes.expandedSummary,
												focused: classes.focusedSummary
											}}
											style={{width: '100%'}}
											id="panel1a-header"
										>
											<TableRow key={row.name}>
												<TableCell component="th" scope="row" className={classNames(classes.cell, classes.nameCell)}>
													<div className={classes.nameCol}>
														<ParameterNameInput defaultName={row.name} mode={mode} />
														{row.required ? <> <br/><i
															className={classes.required}>required</i> </> : null}
													</div>
												</TableCell>
												<TableCell align="left" className={classes.cell}>
													<DisplayRootTypeName
														shape={service.currentShapeProjection('test-api', row.inlineConceptId).root}
														style={{marginBottom: -17}}
													/>
													<br/>
													<div className={(isExpanded) ? classes.multiline : classes.singleLine}>{row.description}</div>
												</TableCell>
											</TableRow>
										</ExpansionPanelSummary>
										<ExpansionPanelDetails classes={{root: classes.detailRoot}}>
											<Typography variant="overline" style={{marginTop: 2, paddingRight: 8, color: primary}}>Shape</Typography>
											<SchemaEditor conceptId={row.inlineConceptId} mode={mode} />
										</ExpansionPanelDetails>
									</ExpansionPanel>
								</>
							)})
						}
					</TableBody>
				</Table>
			</div>)
	}
}

export default withStyles(styles)(ParametersEditor)
