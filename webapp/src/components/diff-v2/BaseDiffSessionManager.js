import { EventEmitter } from 'events';
import debounce from 'lodash.debounce';
import { commandsFromJson, JsonHelper, commandToJs } from '../../engine/index.js';

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
        this.skippedInteractions = new Set()
        this.acceptedCommands = []

        this.events = new EventEmitter()
        this.events.on('change', debounce(() => this.events.emit('updated'), 10, { leading: true, trailing: true, maxWait: 100 }))
    }

    isStartable(interactionIndex) {
        return !this.skippedInteractions.has(interactionIndex)
    }

    skipInteraction(currentInteractionIndex) {
        this.diffState.status = DiffStateStatus.started;
        const currentInteraction = this.diffState.interactionResults[currentInteractionIndex] || {}

        this.diffState.interactionResults[currentInteractionIndex] = Object.assign(
            currentInteraction,
            { status: 'skipped' }
        )
        this.events.emit('change')
    }

    acceptCommands(commandArray) {
        this.diffState.status = DiffStateStatus.started;
        this.diffState.acceptedInterpretations.push(commandArray.map(x => commandToJs(x)));
        this.events.emit('change')
    }

    acceptCommands2(item, commandArray) {
        this.diffState.acceptedInterpretations.push(commandArray.map(x => commandToJs(x)))
        this.diffState.itemsForExamples[item.requestId] = this.diffState.itemsForExamples[item.requestId] || []
        this.diffState.itemsForExamples[item.requestId].push(item)
        this.events.emit('change')
    }
}

class SessionManagerHelpers {
    constructor(diffSessionManager) {
        this.diffSessionManager = diffSessionManager
    }
    
    restartSession() {

    }

    acceptInterpretation(interactionIndex, diff, interpretation) {
        // save stuff
        // mark as should-save
        // skip remaining
    }

    skipInteraction(interactionIndex) {

    }
}

export {
    BaseDiffSessionManager,
    SessionManagerHelpers
}