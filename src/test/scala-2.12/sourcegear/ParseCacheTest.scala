package sourcegear

import better.files.File
import com.opticdev.core.sourcegear.{ParseCache, SourceGearConstants}
import org.scalatest.FunSpec

import scalax.collection.mutable.Graph

class ParseCacheTest extends FunSpec {

  describe("Parse Cache") {

    implicit val SGConstants = new SourceGearConstants {
      override val parseCache = 4 //small for testing
    }

    val parseCache = new ParseCache

    val file1 = File("/src/test/resources/tmp/test_project/1")

    describe("additions") {

      it("work when empty or below limit") {
        parseCache.add(file1, Graph())
        assert(parseCache.cache.contains(file1))
        assert(parseCache.cachedFiles.head == file1)
      }

      it("bump file to the top if already in buffer") {
        parseCache.add(File("/src/test/resources/tmp/test_project/2"), Graph())
        parseCache.add(file1, Graph())
        assert(parseCache.cachedFiles.size == 2)
        assert(parseCache.cachedFiles.head == file1)
      }

      it("will remove oldest cache when exceeds size limit") {
        parseCache.clear

        parseCache.add(file1, Graph())
        parseCache.add(File("/src/test/resources/tmp/test_project/2"), Graph())
        parseCache.add(File("/src/test/resources/tmp/test_project/3"), Graph())
        parseCache.add(File("/src/test/resources/tmp/test_project/4"), Graph())
        parseCache.add(File("/src/test/resources/tmp/test_project/5"), Graph())

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
