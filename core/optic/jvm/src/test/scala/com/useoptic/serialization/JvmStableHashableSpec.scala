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
      assert(diff.toHash()(JvmStableHashable.hash) == "03bbd8f6b62f7fa0661fa2040dbacc1a914a2970")
    }
  }
}
