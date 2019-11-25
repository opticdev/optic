package com.seamless.contexts.rfc

import com.seamless.diff.JsonFileFixture
import org.scalatest.FunSpec

class ScmStateSpec extends FunSpec with JsonFileFixture {

  def fixture(slug: String): Vector[Events.RfcEvent] = eventsFrom(slug)

  it("can build a history from Git Context") {
    val f = fixture("todo-with-git")
    val eventStore = RfcServiceJSFacade.makeEventStore()
    eventStore.append("test", f)
    val rfcService = new RfcService(eventStore)
    val scmState = rfcService.currentState("test").scmState
    assert(scmState.branchCommitMap("master").size == 3)
  }

}
