import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Commands, newRfcService} from './engine/index'
import niceTry from 'nice-try'
import Button from '@material-ui/core/Button';

const engine = newRfcService()
let schemaId = 'test-schema'

class App extends React.Component {

  generateProjection() {
    return niceTry(() => engine.currentShapeProjection(schemaId)) || 'None yet'
  }

  state = {
    projection: this.generateProjection()
  }

  processCommand(command) {
    try {
      const id = engine.processCommand(command)
      this.setState({projection: this.generateProjection()})
      return id
    } catch (e) {
      alert(e)
    }
  }

  makeSchema(name) {
    schemaId = this.processCommand(Commands.AddSchema(name)).get__O()
  }

  addField(name) {
    const id = this.processCommand(Commands.AddField(`${schemaId}_root`, schemaId)).get__O()
    this.processCommand(Commands.SetFieldName(id, name, schemaId))
  }

  render() {
    return (
        <div className="App" style={{textAlign: 'left'}}>
          <pre>{this.state.projection}</pre>
          <Button onClick={() => this.makeSchema('Test Schema')}>Create Schema</Button>
          <Button onClick={() => this.addField('fieldA')}>Add 'fieldA'</Button>
          <Button onClick={() => this.addField('aidan')}>Add 'aidan'</Button>
          <Button onClick={() => this.addField('dev')}>Add 'dev'</Button>
        </div>
    );
  }
}

export default App;
