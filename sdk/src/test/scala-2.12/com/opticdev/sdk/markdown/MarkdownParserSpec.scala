package com.opticdev.sdk.markdown

import better.files.File
import com.opticdev.common.storage.DataDirectory
import org.scalatest.{BeforeAndAfter, BeforeAndAfterAll, BeforeAndAfterEach, FunSpec}

class MarkdownParserSpec extends FunSpec with BeforeAndAfterAll {

  override def beforeAll(): Unit = {
    super.beforeAll()
    DataDirectory.init
    DataDirectory.bin.list.foreach(_.delete(true))
  }

  it("will succeed if given a valid file") {
    val outputTry = MarkdownParser.parseMarkdown(File("test-examples/resources/example_markdown/Importing-JS.md"))
    assert(outputTry.isSuccess)
  }

  it("will fail if given no file") {
    assert(MarkdownParser.parseMarkdown(File("")).isFailure)
  }

  it("will fail if given an invalid file") {
    assert(MarkdownParser.parseMarkdown(File("not-real.file")).isFailure)
  }

}
