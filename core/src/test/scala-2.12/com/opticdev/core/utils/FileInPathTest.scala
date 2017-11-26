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

  it("All Parents of file found") {
    import com.opticdev.core.utils.FileInPath._

    val parents = File("/path/to/file").parentsOf
    assert(parents == Seq(
      File("/path/to"),
      File("/path"),
      File("/"),
    ))
  }

  describe("Finding project file in parents") {
    import com.opticdev.core.utils.FileInPath._

    it("returns a project file when found") {
      val pfOption = File("test-examples/resources/test_project/nested/firstFile.js").projectFileOption
      assert(pfOption.isDefined)
    }

    it("returns none when on project file is found") {
      val pfOption = File("/fake/path/to/place").projectFileOption
      assert(pfOption.isEmpty)
    }

  }

}
