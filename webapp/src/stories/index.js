import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import {mui} from './MUI';
import Button from '@material-ui/core/Button';
import TypeMenu from '../components/TypeMenu/TypeMenu';
import TypeRefModal from '../components/TypeMenu/TypeRefModal';
import KeyTypeRow from '../components/KeyTypeRow';
import SchemaEditor from '../components/SchemaEditor';
import {newRfcService} from '../engine';
import {seedExampleUserWriteModel, seedFriendModel} from '../engine/examples/ExampleData';
import {SchemaEditorContext} from '../contexts/SchemaEditorContext';
import {SchemaEditorModes} from '../components/Constants';

storiesOf('Schema Editor', module)
	.add('edit mode', mui((() => {
		const service = newRfcService()
		let name = 'test-schema'
		const handler = service.commandHandlerForAggregate('test-api')

		seedFriendModel(handler)
		const conceptId = seedExampleUserWriteModel(handler, name)

		return <SchemaEditor service={service} conceptId={conceptId} mode={SchemaEditorModes.EDIT} />
	})()))
	.add('view mode', mui((() => {
		const service = newRfcService()
		let name = 'test-schema'
		const handler = service.commandHandlerForAggregate('test-api')

		seedFriendModel(handler)
		const conceptId = seedExampleUserWriteModel(handler, name)

		return <SchemaEditor service={service} conceptId={conceptId} mode={SchemaEditorModes.VIEW} />
	})()));

storiesOf('Type Modal', module)
	.add('to Storybook', mui(<TypeMenu />));


storiesOf('Type Ref Modal', module)
	.add('basic', mui((() => {
		const service = newRfcService()
		let name = 'test-schema'
		const handler = service.commandHandlerForAggregate('test-api')

		seedFriendModel(handler)
		const id = seedExampleUserWriteModel(handler, name)

		const context = {
			editorState: {
				projection: service.currentShapeProjection('test-api', id)
			},
			conceptId: id
		}

		return (
			<div>
				<SchemaEditorContext.Provider value={context}>
					<TypeRefModal service={service} />
				</SchemaEditorContext.Provider>
			</div>
		)
	})()))
