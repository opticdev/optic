package com.opticdev.server.http.controllers

import better.files.File
import com.opticdev.core.Fixture.{AkkaTestFixture, TestBase}
import com.opticdev.core.debug.LensDebug.LensDebugInfo
import com.opticdev.opm.TestPackageProviders
import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.server.Fixture.ProjectsManagerFixture
import com.opticdev.server.state.ProjectsManager

import scala.concurrent.duration._
import scala.concurrent.Await

class DebugQuerySpec extends AkkaTestFixture("DebugQuerySpec") with TestBase with TestPackageProviders with ProjectsManagerFixture {

  lazy implicit val projectsManager = projectsManagerWithStorage()

  it("gets debug information for a lens from markdown file") {

    val future = new DebugQuery(File("test-examples/resources/example_markdown/Mongoose.md"), Range(1155, 1155), None).execute

    val result = Await.result(future, 20 seconds)

    assert(result.isDefined)
    assert(result.get.isInstanceOf[LensDebugInfo])

  }

  it("will not find any debug info for invalid file") {

    val future = new DebugQuery(File("test-examples/not-real"), Range(1155, 1155), None).execute

    val result = Await.result(future, 20 seconds)

    assert(result.isEmpty)

  }


}
