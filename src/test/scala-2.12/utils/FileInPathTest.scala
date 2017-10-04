package utils

import better.files.File
import org.scalatest.FunSpec

class FileInPathTest extends FunSpec {

  describe("File in path") {
    import com.opticdev.core.utils.FileInPath._
    it("will detect if a file is another") {
      assert(File("src/main/test").isChildOf(File("src/main")))
      assert(File("src").isChildOf(File("/")))
    }

    it("will detect if a file is not in another") {
      assert(!File("src").isChildOf(File("src/main/test")))
      assert(!File("/").isChildOf(File("/src/main/test")))
    }

  }

}
