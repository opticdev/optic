package com.opticdev.sdk.markdown

import better.files.File
import com.opticdev.common.storage.DataDirectory
import org.scalatest.{BeforeAndAfter, BeforeAndAfterAll, BeforeAndAfterEach, FunSpec}

class MarkdownParserSpec extends FunSpec with BeforeAndAfterAll {

  override def beforeAll(): Unit = {
    super.beforeAll()
    DataDirectory.init
  }

  it("will succeed if given a valid file") {
    val outputTry = MarkdownParser.parseMarkdownFile(File("test-examples/resources/example_markdown/Importing-JS.md"))
    assert(outputTry.isSuccess)
  }

  it("will succeed if given a valid string") {
    val outputTry = MarkdownParser.parseMarkdownString(File("test-examples/resources/example_markdown/Importing-JS.md").contentAsString)
    assert(outputTry.isSuccess)
  }

  it("will fail if given an invalid file") {
    assert(MarkdownParser.parseMarkdownFile(File("not-real.file")).isFailure)
  }

}
