package com.opticdev.core.sourcegear

import com.opticdev.core.sourcegear.graph.FileNode
import org.scalatest.FunSpec

import scalax.collection.mutable.Graph

class ParseCacheTest extends FunSpec {

  describe("Parse Cache") {

    val parseCache = new ParseCache {
      override val maxCachedFiles = 4
    }

    val dummyRecord = CacheRecord(Graph(), null, null)

    val file1 = FileNode("test-examples/resources/tmp/test_project/1", "ABC")

    describe("additions") {

      it("work when empty or below limit") {
        parseCache.clear

        parseCache.add(file1, dummyRecord)
        assert(parseCache.cache.contains(file1))
        assert(parseCache.cachedFiles.head == file1)
      }

      it("bump file to the top if already in buffer") {
        parseCache.clear

        parseCache.add(file1, dummyRecord)
        parseCache.add(FileNode("test-examples/resources/tmp/test_project/2", "ABC"), dummyRecord)
        parseCache.add(file1, dummyRecord)
        assert(parseCache.cachedFiles.size == 2)
        assert(parseCache.cachedFiles.head == file1)
      }

      it("does not duplicate file when hash is different, just replaces/bumps") {
        parseCache.clear
        parseCache.add(FileNode("test-examples/resources/tmp/test_project/2", "ABC"), dummyRecord)
        parseCache.add(FileNode("test-examples/resources/tmp/test_project/2", "BCD"), dummyRecord)

        assert(parseCache.cache.size == 1)
        assert(parseCache.cachedFiles.head == FileNode("test-examples/resources/tmp/test_project/2", "BCD"))
      }

      it("will remove oldest cache when exceeds size limit") {
        parseCache.clear

        parseCache.add(file1, dummyRecord)
        parseCache.add(FileNode("test-examples/resources/tmp/test_project/2", "ABC"), dummyRecord)
        parseCache.add(FileNode("test-examples/resources/tmp/test_project/3", "ABC"), dummyRecord)
        parseCache.add(FileNode("test-examples/resources/tmp/test_project/4", "ABC"), dummyRecord)
        parseCache.add(FileNode("test-examples/resources/tmp/test_project/5", "ABC"), dummyRecord)

        assert(!parseCache.cache.contains(file1))
        assert(!parseCache.cachedFiles.contains(file1))
      }
    }

    it("can lookup a record by file"){
      parseCache.clear
      parseCache.add(file1, dummyRecord)
      val cacheOption = parseCache.get(file1)
      assert(cacheOption.isDefined)
    }

  }

}
