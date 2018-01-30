package com.opticdev.server.http.controllers

import better.files.File
import com.opticdev.arrow.Arrow
import com.opticdev.arrow.results.GearResult
import com.opticdev.core.Fixture.{AkkaTestFixture, TestBase}
import com.opticdev.core.sourcegear.SGConstructor
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.opm.TestPackageProviders
import com.opticdev.server.Fixture.ProjectsManagerFixture
import com.opticdev.server.state.ProjectsManager
import org.scalatest.FunSpec

import scala.concurrent.duration._
import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global


class ArrowQuerySpec extends AkkaTestFixture("ArrowQuerySpec") with ProjectsManagerFixture with TestPackageProviders {

  def runquery(query: String) = {
    instanceWatchingTestProject.flatMap(pm => {
      implicit val projectsManager: ProjectsManager = pm
      val aq = new ArrowQuery(File("test-examples/resources/tmp/test_project/app.js"), query, Range(35, 37), None)
      aq.execute
    })
  }

  it("can run a simple query") {
    val result = Await.result(runquery("Route"), 10 seconds)
    assert(result.size == 1)
    assert(result.head.isInstanceOf[GearResult])
  }

}
