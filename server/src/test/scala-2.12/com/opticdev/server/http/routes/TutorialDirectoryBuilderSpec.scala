package com.opticdev.server.http.routes

import better.files.File
import com.opticdev.server.http.routes.installer.TutorialDirectoryBuilder
import org.scalatest.FunSpec

class TutorialDirectoryBuilderSpec extends FunSpec {

  it("can create the tutorial directory") {
    TutorialDirectoryBuilder.build
    assert(File("/tmp/optic-guided-tutorial").children.map(_.name).toSet == Set("optic.yml", "stub.js", "opticapi.js"))
  }

}
