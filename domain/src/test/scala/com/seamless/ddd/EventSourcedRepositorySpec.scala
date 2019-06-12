package com.seamless.ddd

import org.scalatest.FunSpec

class EventSourcedRepositorySpec extends FunSpec {
  type TestEvent = String
  type TestState = Int
  type TestCommandContext = String
  type TestCommand = String

  object TestAggregate extends EventSourcedAggregate[TestState, TestCommand, TestCommandContext, TestEvent] {
    override def applyEvent(event: TestEvent, state: TestState): TestState = {
      state + 1
    }

    override def handleCommand(state: TestState): PartialFunction[(TestCommandContext, TestCommand), Effects[TestEvent]] = ???

    override def initialState: TestState = {
      0
    }
  }

  def fixture() = new EventSourcedRepository[TestState, TestEvent](TestAggregate, new InMemoryEventStore[TestEvent])

  describe("test") {
    it("should load the initial state for any aggregateId") {
      val repository = fixture()
      assert(repository.findById("a") == 0)
      repository.save("a", Vector("z"))
      assert(repository.findById("a") == 1)
      repository.save("a", Vector("z"))
      assert(repository.findById("a") == 2)
    }
  }
}
