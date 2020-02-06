package com.useoptic.contexts.requests

import com.useoptic.contexts.requests.Commands._
import com.useoptic.contexts.requests.Utilities.PathComponentInfo
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
        PathComponentInfo(Vector(), "a", "p1", "root"),
        PathComponentInfo(Vector(), "b", "p2", "p1"),
        PathComponentInfo(Vector("/a/b/c"), "c", "p3", "p2"),
        PathComponentInfo(Vector("/a/{id}"), "{id}", "p4", "p1"),
        PathComponentInfo(Vector("/a/{id1}/d", "/a/{id2}/d"), "d", "p5", "p4"),
      )
      val result = Utilities.oasPathsToPathComponentInfoSeq(
        Vector("/a/b/c", "/a/{id}", "/a/{id1}/d", "/a/{id2}/d"),
        Vector("p1", "p2", "p3", "p4", "p5").toIterator
      )

      assert(result == expected)
    }

    it("there's a mapping for every user provided path, even ambiguous / conflicted") {
      val result = Utilities.oasPathsToPathComponentInfoSeq(
        Vector(
          "/wordlist/{source_lang}/{filters_advanced}",
          "/wordlist/{source_lang}/{filters_basic}"
        ),
        Vector("p1", "p2", "p3", "p4", "p5").toIterator
      )

      assert(result.flatMap(_.originalPaths).toSet ==
        Set("/wordlist/{source_lang}/{filters_basic}", "/wordlist/{source_lang}/{filters_advanced}"))
    }

    it("should not break if root '/' path is used in API") {
      val result = Utilities.oasPathsToPathComponentInfoSeq(
        Vector("/"),
        Vector("p1").toIterator
      )
      assert(result.isEmpty)
    }
  }

  describe("path matching") {
    describe("without path parameters") {
      val pathMap = Map(
        "root" -> PathComponent("root", BasicPathComponentDescriptor("", ""), isRemoved = false),
        "A" -> PathComponent("A", BasicPathComponentDescriptor("root", "a"), isRemoved = false),
        "B" -> PathComponent("B", BasicPathComponentDescriptor("A", "b"), isRemoved = false),
        "C" -> PathComponent("C", BasicPathComponentDescriptor("B", "c"), isRemoved = false),
      )
      it("should resolve all existing paths and not resolve non-existing paths") {
        assert(Utilities.resolvePath("/", pathMap).contains("root"))
        assert(Utilities.resolvePath("/a", pathMap).contains("A"))
        assert(Utilities.resolvePath("/b", pathMap).isEmpty)
        assert(Utilities.resolvePath("/c", pathMap).isEmpty)
        assert(Utilities.resolvePath("/a/b", pathMap).contains("B"))
        assert(Utilities.resolvePath("/a/c", pathMap).isEmpty)
        assert(Utilities.resolvePath("/b/c", pathMap).isEmpty)
        assert(Utilities.resolvePath("/a/b/c", pathMap).contains("C"))
        assert(Utilities.resolvePath("/a/b/c/d", pathMap).isEmpty)

        implicit val pathComponents: Map[PathComponentId, PathComponent] = pathMap
        assert(pathMap.keys.map(pathId => Utilities.toAbsolutePath(pathId)) == Set("/", "/a", "/a/b", "/a/b/c"))
      }
    }
    describe("with path parameters") {
      val pathMap = Map(
        "root" -> PathComponent("root", BasicPathComponentDescriptor("", ""), isRemoved = false),
        "A" -> PathComponent("A", ParameterizedPathComponentDescriptor("root", "a", UnsetRequestParameterShapeDescriptor()), isRemoved = false),
        "B" -> PathComponent("B", BasicPathComponentDescriptor("A", "b"), isRemoved = false),
        "C" -> PathComponent("C", ParameterizedPathComponentDescriptor("B", "c", UnsetRequestParameterShapeDescriptor()), isRemoved = false),
      )
      it("should resolve all existing paths and not resolve non-existing paths") {
        assert(Utilities.resolvePath("/", pathMap).contains("root"))
        assert(Utilities.resolvePath("/a", pathMap).contains("A"))
        assert(Utilities.resolvePath("/b", pathMap).contains("A"))
        assert(Utilities.resolvePath("/c", pathMap).contains("A"))
        assert(Utilities.resolvePath("/a/b", pathMap).contains("B"))
        assert(Utilities.resolvePath("/a/c", pathMap).isEmpty)
        assert(Utilities.resolvePath("/b/c", pathMap).isEmpty)
        assert(Utilities.resolvePath("/a/b/c", pathMap).contains("C"))
        assert(Utilities.resolvePath("/a/b/d", pathMap).contains("C"))
        assert(Utilities.resolvePath("/a/b/c/d", pathMap).isEmpty)

        implicit val pathComponents: Map[PathComponentId, PathComponent] = pathMap
        assert(pathMap.keys.map(pathId => Utilities.toAbsolutePath(pathId)) == Set("/", "/:a", "/:a/b", "/:a/b/:c"))
      }
    }

    describe("with both at the same level") {
      val pathMap = Map(
        "root" -> PathComponent("root", BasicPathComponentDescriptor("", ""), isRemoved = false),
        "A1" -> PathComponent("A1", BasicPathComponentDescriptor("root", "a1"), isRemoved = false),
        "A2" -> PathComponent("A2", ParameterizedPathComponentDescriptor("root", "a", UnsetRequestParameterShapeDescriptor()), isRemoved = false),
        "B1" -> PathComponent("B1", BasicPathComponentDescriptor("A1", "b"), isRemoved = false),
        "B2" -> PathComponent("B2", BasicPathComponentDescriptor("A2", "b"), isRemoved = false),
        "C" -> PathComponent("C", ParameterizedPathComponentDescriptor("B1", "c", UnsetRequestParameterShapeDescriptor()), isRemoved = false),
      )
      it("should resolve all existing paths and not resolve non-existing paths") {
        assert(Utilities.resolvePath("/", pathMap).contains("root"))
        assert(Utilities.resolvePath("/a", pathMap).contains("A2"))
        assert(Utilities.resolvePath("/b", pathMap).contains("A2"))
        assert(Utilities.resolvePath("/c", pathMap).contains("A2"))
        assert(Utilities.resolvePath("/a1", pathMap).contains("A1"))
        assert(Utilities.resolvePath("/a/b", pathMap).contains("B2"))
        assert(Utilities.resolvePath("/a1/b", pathMap).contains("B1"))
        assert(Utilities.resolvePath("/b/c", pathMap).isEmpty)
        assert(Utilities.resolvePath("/a/b/c", pathMap).isEmpty)
        assert(Utilities.resolvePath("/a1/b/c", pathMap).contains("C"))
        assert(Utilities.resolvePath("/a/b/d", pathMap).isEmpty)
        assert(Utilities.resolvePath("/a1/b/d", pathMap).contains("C"))
        assert(Utilities.resolvePath("/a/b/c/d", pathMap).isEmpty)
        assert(Utilities.resolvePath("/a1/b/c/d", pathMap).isEmpty)
        implicit val pathComponents: Map[PathComponentId, PathComponent] = pathMap
        assert(pathMap.keys.map(pathId => Utilities.toAbsolutePath(pathId)) == Set("/", "/a1", "/:a", "/:a/b", "/a1/b", "/a1/b/:c"))
      }
    }
  }
}
