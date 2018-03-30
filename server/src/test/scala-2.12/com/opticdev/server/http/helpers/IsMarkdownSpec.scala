package com.opticdev.server.http.helpers

import better.files.File
import org.scalatest.FunSpec

class IsMarkdownSpec extends FunSpec {

  it("returns true for markdown") {
    assert(IsMarkdown.check(File("test-examples/resources/example_markdown/Importing-JS.md")))
  }

  it("returns false for non-markdown file") {
    assert(!IsMarkdown.check(File("build.sbt")))
  }

}
