package com.seamless.contexts.requests

import com.seamless.contexts.requests.Utilities.PathComponentInfo
import org.scalatest.FunSpec

class UtilitiesSpec extends FunSpec {
  describe("prefixes") {
    it("should yield all the prefixes") {
      assert(Utilities.prefixes("/a/b/c") == Vector("/a", "/a/b", "/a/b/c"))
    }
  }

  describe("oasPathsToAddPathCommandSequence") {
    it("should ") {
      val expected = Vector(
        PathComponentInfo("/a", "a", "p1", "root"),
        PathComponentInfo("/a/b", "b", "p2", "p1"),
        PathComponentInfo("/a/b/c", "c", "p3", "p2"),
        PathComponentInfo("/a/{id}", "{id}", "p4", "p1"),
        PathComponentInfo("/a/{id2}/d", "d", "p5", "p4"),
      )
      val result = Utilities.oasPathsToPathComponentInfoSeq(
        Vector("/a/b/c", "/a/{id}", "/a/{id1}/d", "/a/{id2}/d"),
        Vector("p1", "p2", "p3", "p4", "p5").toIterator
      )
      assert(result == expected)
    }

    it("can branch properly after a path parameter") {
      val result = Utilities.oasPathsToPathComponentInfoSeq(
        Vector(
          "/wordlist/{source_lang}/{filters_advanced}",
          "/wordlist/{source_lang}/{filters_basic}"
        ),
        Vector("p1", "p2", "p3", "p4", "p5").toIterator
      )

      assert(result.map(_.absolutePath).toSet ==
        Set("/wordlist", "/wordlist/{}", "/wordlist/{source_lang}/{filters_basic}", "/wordlist/{source_lang}/{filters_advanced}"))
    }

    it("should not break if root '/' path is used in API") {
      val result = Utilities.oasPathsToPathComponentInfoSeq(
        Vector("/"),
        Vector("p1").toIterator
      )
      assert(result.isEmpty)
    }
  }
}
