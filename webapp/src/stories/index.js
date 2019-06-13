import React from 'react';

import {storiesOf} from '@storybook/react';
import {mui} from './MUI';
import SchemaEditor from '../components/shape-editor/SchemaEditor';
import {newRfcService} from '../engine';
import {seedExampleUserWriteModel, seedFriendModel} from '../engine/examples/ExampleData';
import {SchemaEditorModes} from '../components/shape-editor/Constants';
import TopBar from '../components/navigation/TopBar';
import MasterView from '../components/navigation/MasterView';
import FloatingAddButton from '../components/navigation/FloatingAddButton';
import BodyEditor from '../components/body-editor'
import ParametersEditor from '../components/parameters-editor'
import {RfcStore, withRfcContext} from '../contexts/RfcContext.js';

storiesOf('xyz')
    .add('loading data from above', () => {
        const InitialStateContext = React.createContext(null);

        class Child extends React.Component {
            render() {
                const {handleCommand} = this.props;
                return (
                    <button onClick={handleCommand}>click me</button>
                )
            }
        }

        const ChildWithRfcContext = withRfcContext(Child)
        const c = (
            <InitialStateContext.Consumer>
                {(value) => {
                    debugger
                    if (value === null) {
                        return;
                    }
                    return (
                        <RfcStore>
                            <ChildWithRfcContext/>
                        </RfcStore>
                    )
                }}
            </InitialStateContext.Consumer>
        )
        return (
            <div>
                <InitialStateContext.Provider value={null}>
                    (no value provided)
                    {c}
                </InitialStateContext.Provider>
                <InitialStateContext.Provider value={1}>
                    (value provided)
                    {c}
                </InitialStateContext.Provider>
            </div>
        )
    })

storiesOf('Schema Editor', module)
    .add('edit mode', mui((() => {
        const service = newRfcService()
        let name = 'test-schema'
        const handler = service.commandHandlerForAggregate('test-api')

        seedFriendModel(handler)
        const conceptId = seedExampleUserWriteModel(handler, name)

        return <SchemaEditor service={service} conceptId={conceptId} mode={SchemaEditorModes.EDIT}/>
    })()))
    .add('view mode', mui((() => {
        const service = newRfcService()
        let name = 'test-schema'
        const handler = service.commandHandlerForAggregate('test-api')

        seedFriendModel(handler)
        const conceptId = seedExampleUserWriteModel(handler, name)

        return <SchemaEditor service={service} conceptId={conceptId} mode={SchemaEditorModes.VIEW}/>
    })()));

storiesOf('Navigation', module)
    .add('topbar', mui((() => {
        return <TopBar/>
    })()))
    .add('master-view', mui((() => {
        return <MasterView/>
    })(), 0))


storiesOf('Context Fab', module)
    .add('example', mui((() => {
        return <FloatingAddButton/>
    })()))

storiesOf('Parameters Editor', module)
    .add('view example', mui((() => {
        return <ParametersEditor mode={SchemaEditorModes.VIEW}/>
    })()))
    .add('edit example', mui((() => {
        return <ParametersEditor mode={SchemaEditorModes.EDIT}/>
    })()))

storiesOf('Body Editor', module)
    .add('view example no body', mui((() => {
        return <BodyEditor mode={SchemaEditorModes.VIEW}/>
    })()))
    .add('view example with body', mui((() => {
        return <BodyEditor hasBody={true} mode={SchemaEditorModes.VIEW}/>
    })()))
    .add('edit example', mui((() => {
        return <BodyEditor mode={SchemaEditorModes.EDIT}/>
    })()))


// storiesOf('Type Modal', module)
// 	.add('to Storybook', mui(<TypeMenu />));
//
//
// storiesOf('Type Ref Modal', module)
// 	.add('basic', mui((() => {
// 		const service = newRfcService()
// 		let name = 'test-schema'
// 		const handler = service.commandHandlerForAggregate('test-api')
//
// 		seedFriendModel(handler)
// 		const id = seedExampleUserWriteModel(handler, name)
//
// 		const context = {
// 			editorState: {
// 				projection: service.currentShapeProjection('test-api', id)
// 			},
// 			conceptId: id
// 		}
//
// 		return (
// 			<div>
// 				<SchemaEditorContext.Provider value={context}>
// 					<TypeRefModal service={service} />
// 				</SchemaEditorContext.Provider>
// 			</div>
// 		)
// 	})()))

