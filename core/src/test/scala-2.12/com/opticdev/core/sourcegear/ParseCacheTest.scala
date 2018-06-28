package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.core.sourcegear.annotations.FileNameAnnotation
import com.opticdev.core.sourcegear.graph.FileNode
import org.scalatest.{BeforeAndAfterEach, FunSpec}
import scalax.collection.mutable.Graph

class ParseCacheTest extends FunSpec with BeforeAndAfterEach {

  val parseCache = new ParseCache {
    override val maxCachedFiles = 4
  }

  override def beforeEach(): Unit = {
    parseCache.clear
    super.beforeEach()
  }

  describe("Parse Cache") {

    val file1 = File("test-examples/resources/tmp/test_project/1")

    describe("Cache record equality") {

      it("can determine if contents have changed") {
        assert(CacheRecord(Graph(), null, "testContents", None) differentFrom "otherContents")
      }

    }

    describe("additions") {

      it("work when empty or below limit") {
        parseCache.add(file1, CacheRecord(Graph(), null, "a", None))
        assert(parseCache.cache.contains(file1))
        assert(parseCache.cachedFiles.head == file1)
      }

      it("bump file to the top if already in buffer") {
        val record = CacheRecord(Graph(), null, "otherContents", None)

        parseCache.add(file1, record)
        parseCache.add(File("test-examples/resources/tmp/test_project/2"), record)
        parseCache.add(file1, record)
        assert(parseCache.cachedFiles.size == 2)
        assert(parseCache.cachedFiles.head == file1)
      }

      it("does not duplicate file when hash is different, just replaces/bumps") {
        parseCache.add(File("test-examples/resources/tmp/test_project/2"), CacheRecord(Graph(), null, "a", None))
        parseCache.add(File("test-examples/resources/tmp/test_project/2"), CacheRecord(Graph(), null, "b", None))

        assert(parseCache.cache.size == 1)
        assert(parseCache.cachedFiles.head == File("test-examples/resources/tmp/test_project/2"))
      }

      it("will remove oldest cache when exceeds size limit") {
        val record = CacheRecord(Graph(), null, "otherContents", None)
        parseCache.add(file1, record)
        parseCache.add(File("test-examples/resources/tmp/test_project/2"), record)
        parseCache.add(File("test-examples/resources/tmp/test_project/3"), record)
        parseCache.add(File("test-examples/resources/tmp/test_project/4"), record)
        parseCache.add(File("test-examples/resources/tmp/test_project/5"), record)

        assert(!parseCache.cache.contains(file1))
        assert(!parseCache.cachedFiles.contains(file1))
      }
    }

    it("can lookup a record by file"){
      parseCache.add(file1, CacheRecord(Graph(), null, "otherContents", None))
      val cacheOption = parseCache.get(file1)
      assert(cacheOption.isDefined)
    }

    it("can preserves filenames through caching"){
      parseCache.add(file1, CacheRecord(Graph(), null, "otherContents", Some(FileNameAnnotation("TEST"))))
      val cacheOption = parseCache.get(file1)
      assert(cacheOption.isDefined)
      assert(cacheOption.get.fileNameAnnotationOption.contains(FileNameAnnotation("TEST")))
    }

    describe("is current for file") {

      it("returns false when file does not exist in cache") {
        assert(!parseCache.isCurrentForFile(File("test-examples/resources/tmp/test_project/2"), "test"))
      }

      it("returns true when file is in cache & contents are the same") {
        parseCache.add(File("test-examples/resources/tmp/test_project/2"), CacheRecord(Graph(), null, "contents", None))
        assert(parseCache.isCurrentForFile(File("test-examples/resources/tmp/test_project/2"), "contents"))
      }

      it("returns false when file is in cache & contents are the different") {
        parseCache.add(File("test-examples/resources/tmp/test_project/2"), CacheRecord(Graph(), null, "abc", None))
        assert(!parseCache.isCurrentForFile(File("test-examples/resources/tmp/test_project/2"), "contents"))
      }

    }

  }

}
