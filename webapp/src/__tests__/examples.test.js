import {Facade, Queries, RfcCommandContext} from '../engine';
import fs from 'fs'

xdescribe('Example loading', function () {
    const examples = [
        './public/example-commands/mattermost-commands.json'
    ]

    examples.forEach(function (exampleFileName) {
        it('should parse the commands', function () {
            const rfcId = 'rrr'
            const eventStore = Facade.makeEventStore()
            const initialCommandsString = fs.readFileSync(exampleFileName)
            const commandContext = new RfcCommandContext('userId', 'sessionId', 'batchId')
            const service = Facade.fromJsonCommands(eventStore, rfcId, commandContext, initialCommandsString)
        });
    })
});