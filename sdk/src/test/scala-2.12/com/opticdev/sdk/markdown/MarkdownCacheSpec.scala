package com.opticdev.sdk.markdown

import better.files.File
import com.opticdev.common.storage.DataDirectory
import com.opticdev.parsers.utils.Crypto
import org.scalatest.{BeforeAndAfterAll, FunSpec}

import scala.concurrent.duration._
import scala.concurrent.Await

class MarkdownCacheSpec extends FunSpec with BeforeAndAfterAll {

  override def beforeAll(): Unit = {
//    DataDirectory.delete
    DataDirectory.init
    DataDirectory.markdownCache.list.foreach(_.delete(true))
    super.beforeAll()
  }

  val file = File("test-examples/resources/example_markdown/Importing-JS.md")

  it("cache markdown by file hash") {
    val jsObject = MarkdownParser.parseMarkdownFile(file, useCache = false).get.jsObject

    val result = Await.result(MarkdownCache.cacheMarkdown(file, jsObject), 5 seconds)

    assert(result.name == file.sha256.toLowerCase)
    assert(result.byteArray sameElements jsObject.toString().getBytes)
  }

  it("can lookup markdown by file/hash") {

    val parsed = MarkdownParser.parseMarkdownFile(file).get
    val result = Await.result(MarkdownCache.cacheMarkdown(file, parsed.jsObject), 5 seconds)

    assert(MarkdownCache.lookup(file).contains(parsed))
  }

  it("will not return an output if hash does not exist") {
    assert(MarkdownCache.lookup("hashFAKE").isEmpty)
  }

  it("will not return an output if the OpticMarkdown response is invalid for current version.") {
    val fakeFile = DataDirectory.markdownCache / "fake"
    fakeFile.touch()
    fakeFile.write("NOT GONNA WORK")
    assert(MarkdownCache.lookup("fake").isEmpty)
  }

  it("a sha256 hash of file is the same as a hash of its contents") {
    assert(file.sha256.toLowerCase == Crypto.createSha256Hash(file.contentAsString).toLowerCase)
  }

}
