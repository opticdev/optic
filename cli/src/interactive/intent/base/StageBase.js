export class StageBase {
	constructor() {
		this.setup = this.setup.bind(this)
		this.cleanup = this.cleanup.bind(this)
		this.result = this.result.bind(this)
	}

	result() {

	}

	setup(triggerNext) {

	}

	cleanup() {

	}

}
