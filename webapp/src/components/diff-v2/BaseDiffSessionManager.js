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

        this.events = new EventEmitter()
        this.events.on('change', debounce(() => this.events.emit('updated'), 10, { leading: true, trailing: true, maxWait: 100 }))
        this.events.on('updated', () => this.persistDiffState())
    }

    markAsManuallyIntervened(currentInteractionIndex) {
        this.diffState.status = DiffStateStatus.started;
        const currentInteraction = this.diffState.interactionResults[currentInteractionIndex] || {}
        this.diffState.interactionResults[currentInteractionIndex] = Object.assign(
            currentInteraction,
            { status: 'manual' }
        )
        this.events.emit('change')
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

    markDiffAsIgnored(diffString) {
        this.diffState.ignoredDiffs = this.diffState.ignoredDiffs || {};
        this.diffState.ignoredDiffs[diffString] = true
        this.events.emit('change')
    }

    finishInteraction(currentInteractionIndex) {
        this.diffState.status = DiffStateStatus.started;
        const currentInteraction = this.diffState.interactionResults[currentInteractionIndex] || {}

        this.diffState.interactionResults[currentInteractionIndex] = Object.assign(
            currentInteraction,
            { status: 'completed' },
        )
        this.events.emit('change')
    }

    acceptCommands(commandArray) {
        this.diffState.status = DiffStateStatus.started;
        this.diffState.acceptedInterpretations.push(commandArray.map(x => commandToJs(x)));
        this.events.emit('change')
    }

    acceptCommands2(currentInteractionIndex, commandArray) {
        this.diffState.status = DiffStateStatus.started;
        this.diffState.acceptedInterpretations.push({
            currentInteractionIndex,
            commands: commandArray.map(x => commandToJs(x))
        })
        this.events.emit('change')
    }
    
    restoreState(handleCommands) {
        if (this.diffState.status === DiffStateStatus.started) {
            const allCommands = this.diffState.acceptedInterpretations.reduce((acc, value) => [...acc, ...value], [])
            // console.log({ allCommands })
            const commandSequence = commandsFromJson(allCommands)
            const commandArray = JsonHelper.seqToJsArray(commandSequence)
            handleCommands(...commandArray)
            // console.log('done restoring')
        }
    }

    //@GOTCHA: revisit this "distributed" transaction logic. it's possible for the events to have been saved without the diffState knowing. Merging would then presumably fail
    async applyDiffToSpec(eventStore, rfcId) {
        await this.persistDiffState()
        // console.log('begin transaction')
        await this.specService.saveEvents(eventStore, rfcId)
        this.diffState.status = DiffStateStatus.persisted;
        await this.persistDiffState()
        // console.log('end transaction')
        this.events.emit('updated')
    }


    async persistDiffState() {
        console.count('persisting')
        return this.specService.saveDiffState(this.sessionId, this.diffState)
    }
}

class SessionManagerHelpers {
    restartSession() {
        
    }

    acceptInterpretation(interactionIndex, diff, interpretation) {
        // save stuff
        // mark as should-save
        // 
    }

    skipInteraction(interactionIndex) {

    }
}

export {
    BaseDiffSessionManager,
    SessionManagerHelpers
}