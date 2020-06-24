package com.useoptic.contexts.rfc

import com.useoptic.diff.JsonFileFixture
import com.useoptic.dsa.OpticIds
import org.scalatest.FunSpec

class ScmStateSpec extends FunSpec with JsonFileFixture {

  def fixture(slug: String): Vector[Events.RfcEvent] = eventsFrom(slug)

  it("can build a history from Git Context") {
    val f = fixture("todo-with-git")
    val eventStore = RfcServiceJSFacade.makeEventStore()
    eventStore.append("test", f)
    implicit val ids = OpticIds.newDeterministicIdGenerator
    val rfcService = new RfcService(eventStore)
    val scmState = rfcService.currentState("test").scmState
    assert(scmState.branchCommitMap("master").size == 3)
  }

}
