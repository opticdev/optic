import { EventEmitter } from 'events';
import debounce from 'lodash.debounce';
import { commandToJs } from '../../engine/index.js';

export const DiffStateStatus = {
    persisted: 'persisted',
    started: 'started',
}

class BaseDiffSessionManager {
    constructor(sessionId, session, diffState, specService) {
        this.sessionId = sessionId;
        this.session = session;
        this.diffState = diffState;
        this.specService = specService;

        this.skippedInteractions = new Set();
        this.acceptedCommands = [];
        this.exampleInteractions = new Map();

        this.events = new EventEmitter()
        this.events.on('change', debounce(() => this.events.emit('updated'), 10, { leading: true, trailing: true, maxWait: 100 }))
    }


    isStartable(diffState, item) {
        return !this.skippedInteractions.has(item.index)
    }

    skipInteraction(currentInteractionIndex) {
        this.skippedInteractions.add(currentInteractionIndex)
        this.events.emit('change')
    }

    acceptCommands(item, commandArray) {
        this.acceptedCommands.push(commandArray.map(x => commandToJs(x)));
        this.exampleInteractions.set(item.index, item)
        this.events.emit('change')
    }

    // queries

    listAcceptedCommands() {
        return this.acceptedCommands.flatMap(x => x);
    }

    listExamplesToAdd() {
        return this.exampleInteractions.values()
    }
}

export {
    BaseDiffSessionManager
}