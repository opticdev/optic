package com.useoptic.ddd

import org.scalatest.FunSpec

class InMemoryEventStoreSpec extends FunSpec {
  type TestEvent = String

  def fixture() = new InMemoryEventStore[TestEvent]()

  describe("empty store") {
    it("should not return any events") {
      val store = fixture()
      val events = store.listEvents("a")
      assert(events.isEmpty)
    }
    it("should add events for only the specified aggregateId") {
      val store = fixture()
      val expectedEvents1 = Vector("e1", "e2")
      val expectedEvents2 = Vector("e3", "e4")
      store.append("a", expectedEvents1)

      assert(store.listEvents("a") == expectedEvents1)
      assert(store.listEvents("b").isEmpty)

      store.append("a", expectedEvents2)
      assert(store.listEvents("a") == expectedEvents1 ++ expectedEvents2)
      assert(store.listEvents("b").isEmpty)
    }
  }
}
