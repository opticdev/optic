import {contextName} from "../../constants/ContextText";

export class IntentBase {
	constructor({stages = [], closeAfter = false, item}) {
		this._stages = stages
		this._stage = 0
		this._closeAfter = closeAfter
		this._started = false
		this._item = item

		this._currentStage = null

		this.titleText = this.titleText.bind(this)
		this.start = this.start.bind(this)
		this.next = this.next.bind(this)
		this.back = this.back.bind(this)
		this.finish = this.finish.bind(this)
	}

	titleText() {
		return 'Doing intent...'
	}

	get stages() {
		return  this._stages
	}

	get started() {
		return this._started
	}

	start() {
		this._started = true
		this.switchTo(0)
	}

	switchTo(stageIndex) {
		const stage = this._stages[stageIndex]
		if (stage) {
			//cleanup last one
			if (this._currentStage) {
				this._currentStage.cleanup()
			}

			this._currentStage = stage
			this._stage = stageIndex
			stage.setup(this.next)
			return true
		} else {
			return false
		}
	}

	next() {
		const hadNext = this.switchTo(this._stage + 1)
		if (!hadNext) {
			this.finish()
		}
	}

	back() {
		this.switchTo(this._stage - 1)
	}

	finish() {

		if (this._currentStage) {
			this._currentStage.cleanup()
		}

		global.currentScreen.setState({intent: null})
	}

}
