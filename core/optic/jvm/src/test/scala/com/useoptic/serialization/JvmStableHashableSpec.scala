package com.useoptic.serialization

import com.useoptic.diff.interactions.{InteractionDiffResult, InteractionTrail, Method, SpecPath, UnmatchedRequestBodyContentType, Url}
import org.scalatest.FunSpec

class JvmStableHashableSpec extends FunSpec {
  describe("given a particular InteractionDiffResult") {
    it("should produce the expected sha1 ") {
      val diff: InteractionDiffResult = UnmatchedRequestBodyContentType(
        InteractionTrail(Seq(Url(), Method("GET"))),
        SpecPath("path_wYt9lgNJVf")
      )
      assert(diff.toHash()(JvmStableHashable.hash) == "756c80f2212b17c3da0c4a24079469644c9dac62")
    }
  }
}
