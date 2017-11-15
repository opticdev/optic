package com.opticdev.core.utils

import better.files.File
import org.scalatest.FunSpec

class FileInPathTest extends FunSpec {

  describe("File in path") {
    import com.opticdev.core.utils.FileInPath._

    it("will detect if a file is another") {
      assert(File("src/main/test").inPathOf(File("src/main")))
      assert(File("src").inPathOf(File("/")))
    }

    it("will detect if a file is not in another") {
      assert(!File("src").inPathOf(File("src/main/test")))
      assert(!File("/").inPathOf(File("/src/main/test")))
    }

  }

}
