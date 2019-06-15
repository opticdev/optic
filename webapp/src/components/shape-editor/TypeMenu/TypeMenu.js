import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Menu from '@material-ui/core/Menu/index';
import MenuItem from '@material-ui/core/MenuItem/index';
import Chip from '@material-ui/core/Chip/index';
import {CollectionTypes, primitiveColors, PrimitiveTypes, typeOptionNames} from '../Types';
import classNames from 'classnames';
import Button from '@material-ui/core/Button/index';
import {SchemaEditorContext} from '../../../contexts/SchemaEditorContext';
import {Commands, DataTypesHelper} from '../../../engine'
import BasicButton from '../BasicButton';

const styles = theme => ({
	chip: {
		margin: theme.spacing(.6),
		fontSize: 12,
		height: 20,
	},
	button: {
		fontSize: 13,
		textTransform: 'capitalize',
		marginTop: -1
	},
	buttonWrapper: {
		paddingRight: 15
	},
	changeType: {
		fontSize: 12,
		marginTop: 2,
		fontWeight: 500,
		paddingRight: 15
	}
});

const TypeChip = withStyles(styles)(({name, id, color, handleClick, classes, style}) => {

	const styles = {
		color: '#727272',
	};

	return <div className={classes.buttonWrapper}>
		<BasicButton
			className={classes.button}
			style={style}
			onClick={() => handleClick(id)}>{name}</BasicButton>
	</div>;
});

class TypeMenu extends React.Component {

	renderType = (type, handleTypeClick) => {
		return <TypeChip id={type.id}
						 key={type.id}
						 color={primitiveColors[type.id]}
						 name={typeOptionNames[type.id] || type.id}
						 handleClick={handleTypeClick(type)}
		/>
	};

	render = () => {
		const {classes, id} = this.props;

		return <SchemaEditorContext.Consumer>
			{({editorState, operations, conceptId}) => {

				const handleTypeClick = (type) => () => {
					operations.runCommand(Commands.AssignType(id, DataTypesHelper.primitivesMap[type.id], conceptId))
					operations.hideTypeMenu()
				};

				return <>
					<span className={classes.changeType}>Change Type:</span>
					{DataTypesHelper.primitiveArray.map(i => this.renderType(i, handleTypeClick))}
					<TypeChip name={'Select Concept'}
							  style={{color: '#8a558e' }}
							  handleClick={operations.showRefModal(id)}
					/>
				</>
			}}
		</SchemaEditorContext.Consumer>
	};
}

export default withStyles(styles)(TypeMenu);
