package com.opticdev.core.sourcegear.project.monitoring

import better.files.File
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.{GearSet, SourceGear}
import com.opticdev.parsers.{ParserBase, SourceParserManager}

class ShouldWatchSpec extends TestBase {

  val validExtensions = Set(".js")
  val excludedTestPaths = Seq(
    File("test-examples/resources/example_source"),
    File("test-examples/resources/example_source/LocationPlayground.js")
  )

  it("will accept files with the right extensions") {
    assert(ShouldWatch.file(File("test-examples/resources/test_project/app.js"), validExtensions, excludedTestPaths))
  }

  it("will reject files that are children of an excluded path") {
    assert(!ShouldWatch.file(File("test-examples/resources/example_source/ImportSource.js"), validExtensions, excludedTestPaths))
  }

  it("will reject files that are excluded explicitly") {
    assert(!ShouldWatch.file(File("test-examples/resources/example_source/LocationPlayground.js"), validExtensions, excludedTestPaths))
  }

  it("will reject files with the wrong extensions") {
    assert(!ShouldWatch.file(File("build.sbt"), validExtensions, excludedTestPaths))
  }

  it("will reject files that don't exist") {
    assert(!ShouldWatch.file(File("notREAL.js"), validExtensions, excludedTestPaths))
  }

}