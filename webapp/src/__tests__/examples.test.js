import {Facade, Queries} from '../engine';
import fs from 'fs'

describe('Example loading', function () {
    const examples = [
        './public/example-commands/mattermost-commands.json'
    ]

    examples.forEach(function (exampleFileName) {
        it('should parse the commands', function () {
            const rfcId = 'rrr'
            const eventStore = Facade.makeEventStore()
            const initialCommandsString = fs.readFileSync(exampleFileName)
            const service = Facade.fromJsonCommands(eventStore, initialCommandsString, rfcId)
        });
    })
});