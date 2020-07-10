package com.useoptic.diff.interactions

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.coverage._
import com.useoptic.diff.helpers.SpecHelpers
import com.useoptic.diff.interactions.visitors.CoverageVisitors
import com.useoptic.diff.shapes.resolvers.DefaultShapesResolvers
import com.useoptic.types.capture.HttpInteraction
import org.scalatest.FunSpec
import io.circe.literal._

class CoverageVisitorSpec extends FunSpec {
//  describe("Coverage Visitors") {
//    describe("scenario 1") {
//      val specHelpers = new SpecHelpers()
//
//      val rfcState: RfcState = TestHelpers.fromCommands(
//        specHelpers.simpleGet(json"""["a"]""") ++
//          specHelpers.simplePost(json"""[1]""")
//      )
//      val interactions: Seq[HttpInteraction] = Seq(
//        InteractionHelpers.simpleGet(json"""[]""", 200),
//        InteractionHelpers.simpleGet(json"""[1]""", 200),
//      )
//
//      def fixture(spec: RfcState, interactions: Seq[HttpInteraction]) = {
//        val resolvers = new DefaultShapesResolvers(rfcState)
//        val visitors = new CoverageVisitors(resolvers)
//        val traverser = new Traverser(rfcState, visitors)
//        interactions.foreach(interaction => traverser.traverse(interaction))
//        println(visitors.report.coverageCounts.counts)
//        visitors
//      }
//
//      it("should count the total number of interactions observed") {
//        val visitors = fixture(rfcState, interactions)
//        assert(visitors.report.coverageCounts.counts(TotalInteractions()) == 2)
//      }
//      it("should count the number of interactions by path") {
//        val visitors = fixture(rfcState, interactions)
//        assert(visitors.report.coverageCounts.counts(TotalForPath("root")) == 2)
//      }
//      it("should count the number of interactions by path and method") {
//        val visitors = fixture(rfcState, interactions)
//        assert(visitors.report.coverageCounts.counts(TotalForPathAndMethod("root", "GET")) == 2)
//      }
//      it("should count the number of interactions by path and method and request body content type") {
//        val visitors = fixture(rfcState, interactions)
//        assert(visitors.report.coverageCounts.counts(TotalForPathAndMethodWithoutBody("root", "GET")) == 2)
//      }
//      it("should count the number of interactions by path and method and status code") {
//        val visitors = fixture(rfcState, interactions)
//        assert(visitors.report.coverageCounts.counts(TotalForPathAndMethodAndStatusCode("root", "GET", 200)) == 2)
//      }
//      it("should count the number of interactions by path and method and status code and response body content type") {
//        val visitors = fixture(rfcState, interactions)
//        assert(visitors.report.coverageCounts.counts(TotalForPathAndMethodAndStatusCodeAndContentType("root", "GET", 200, "application/json")) == 2)
//      }
//      it("should count the number of interactions by requestId") {
//        val visitors = fixture(rfcState, interactions)
//        assert(visitors.report.coverageCounts.counts(TotalForRequest("request1")) == 2)
//      }
//      it("should count the number of interactions by responseId") {
//        val visitors = fixture(rfcState, interactions)
//        assert(visitors.report.coverageCounts.counts(TotalForResponse("response1")) == 2)
//      }
//    }
//  }
}
