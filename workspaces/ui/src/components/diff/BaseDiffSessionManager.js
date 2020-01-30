import { EventEmitter } from 'events';
import debounce from 'lodash.debounce';

export const DiffStateStatus = {
    persisted: 'persisted',
    started: 'started',
}

class BaseDiffSessionManager {
    constructor(sessionId, session, specService) {
        this.sessionId = sessionId;
        this.session = session;
        this.specService = specService;

        this.skippedInteractions = new Set();
        this.acceptedCommands = [];
        this.exampleInteractions = new Map();


        this.addedIds = []
        this.changedIds = []

        this.events = new EventEmitter()
        this.events.on('change', debounce(() => this.events.emit('updated'), 10, { leading: true, trailing: true, maxWait: 100 }))
    }

    reset() {
        this.skippedInteractions = new Set()
        this.acceptedCommands = [];
        this.exampleInteractions = new Map()
        this.addedIds = [];
        this.changedIds = [];
    }

    getTaggedIds() {
        return {
            addedIds: this.addedIds,
            changedIds: this.changedIds,
        }
    }

    isStartable(_, item) {
        return !this.skippedInteractions.has(item.index)
    }

    skipInteraction(currentInteractionIndex) {
        this.skippedInteractions.add(currentInteractionIndex)
        this.events.emit('change')
    }

    acceptCommands(item, commandArray) {
        this.acceptedCommands.push(commandArray);
        this.exampleInteractions.set(item.index, item)
        this.events.emit('change')
    }

    tagIds = (addedIds = [], changedIds = []) => {
        this.addedIds.push(...addedIds)
        this.changedIds.push(...changedIds)
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
