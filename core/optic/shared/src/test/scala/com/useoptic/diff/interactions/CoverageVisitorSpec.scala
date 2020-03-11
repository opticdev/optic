package com.useoptic.diff.interactions

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.helpers.SpecHelpers
import com.useoptic.diff.interactions.interpretations.InteractionHelpers
import com.useoptic.diff.interactions.visitors.CoverageVisitors
import com.useoptic.types.capture.HttpInteraction
import org.scalatest.FunSpec
import io.circe.literal._

class CoverageVisitorSpec extends FunSpec {
  describe("Coverage Visitors") {
    describe("scenario 1") {
      val rfcState: RfcState = TestHelpers.fromCommands(
        SpecHelpers.simpleGet(json"""["a"]""") ++
          SpecHelpers.simplePost(json"""[1]""")
      )
      val interactions: Seq[HttpInteraction] = Seq(
        InteractionHelpers.simpleGet(json"""[]""", 200),
        InteractionHelpers.simpleGet(json"""[1]""", 200),
      )

      def fixture(spec: RfcState, interactions: Seq[HttpInteraction]) = {
        val visitors = new CoverageVisitors()
        val traverser = new Traverser(rfcState, visitors)
        interactions.foreach(interaction => traverser.traverse(interaction))
        println(visitors.counter.counts)
        visitors
      }

      it("should count the total number of interactions observed") {
        val visitors = fixture(rfcState, interactions)
        assert(visitors.counter.counts("total") == 2)
      }
      it("should count the number of interactions by path") {
        val visitors = fixture(rfcState, interactions)
        assert(visitors.counter.counts("paths-root") == 2)
      }
      it("should count the number of interactions by path and method") {

      }
      it("should count the number of interactions by requestId") {
        val visitors = fixture(rfcState, interactions)
        assert(visitors.counter.counts("request1") == 2)
      }
      it("should count the number of interactions by responseId") {
        val visitors = fixture(rfcState, interactions)
        assert(visitors.counter.counts("response2") == 2)
      }
    }
  }
}
