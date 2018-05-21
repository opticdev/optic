package com.opticdev.sdk.markdown

import org.scalatest.FunSpec

class CallOpticMarkdownSpec extends FunSpec {

  it("can find optic markdown binary in .yaml") {
    assert(CallOpticMarkdown.scriptPath.contains("server/src/main/resources/opticmarkdown"))
    CallOpticMarkdown.script
  }

  it("will find the property if set") {
    System.setProperty("opticmdbinary", "/test/location")
    assert(CallOpticMarkdown.scriptPath == "/test/location")
  }

}
