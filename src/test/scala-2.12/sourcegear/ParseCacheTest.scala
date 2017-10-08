package sourcegear

import better.files.File
import com.opticdev.core.sourcegear.graph.FileNode
import com.opticdev.core.sourcegear.{ParseCache, SGConstants}
import org.scalatest.{BeforeAndAfter, BeforeAndAfterAll, FunSpec}

import scalax.collection.mutable.Graph

class ParseCacheTest extends FunSpec {

  describe("Parse Cache") {

    val parseCache = new ParseCache {
      override val maxCachedFiles = 4
    }

    val file1 = FileNode("/src/test/resources/tmp/test_project/1", "ABC")

    describe("additions") {

      it("work when empty or below limit") {
        parseCache.clear

        parseCache.add(file1, Graph())
        assert(parseCache.cache.contains(file1))
        assert(parseCache.cachedFiles.head == file1)
      }

      it("bump file to the top if already in buffer") {
        parseCache.clear

        parseCache.add(file1, Graph())
        parseCache.add(FileNode("/src/test/resources/tmp/test_project/2", "ABC"), Graph())
        parseCache.add(file1, Graph())
        assert(parseCache.cachedFiles.size == 2)
        assert(parseCache.cachedFiles.head == file1)
      }

      it("does not duplicate file when hash is different, just replaces/bumps") {
        parseCache.clear
        parseCache.add(FileNode("/src/test/resources/tmp/test_project/2", "ABC"), Graph())
        parseCache.add(FileNode("/src/test/resources/tmp/test_project/2", "BCD"), Graph())

        assert(parseCache.cache.size == 1)
        assert(parseCache.cachedFiles.head == FileNode("/src/test/resources/tmp/test_project/2", "BCD"))
      }

      it("will remove oldest cache when exceeds size limit") {
        parseCache.clear

        parseCache.add(file1, Graph())
        parseCache.add(FileNode("/src/test/resources/tmp/test_project/2", "ABC"), Graph())
        parseCache.add(FileNode("/src/test/resources/tmp/test_project/3", "ABC"), Graph())
        parseCache.add(FileNode("/src/test/resources/tmp/test_project/4", "ABC"), Graph())
        parseCache.add(FileNode("/src/test/resources/tmp/test_project/5", "ABC"), Graph())

        assert(!parseCache.cache.contains(file1))
        assert(!parseCache.cachedFiles.contains(file1))
      }
    }

    it("can lookup a record by file"){
      parseCache.clear
      parseCache.add(file1, Graph())
      val cacheOption = parseCache.get(file1)
      assert(cacheOption.isDefined)
    }

  }

}
