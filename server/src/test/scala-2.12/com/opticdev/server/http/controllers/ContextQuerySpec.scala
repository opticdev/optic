package com.opticdev.server.http.controllers

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.server.Fixture.ProjectsManagerFixture
import com.opticdev.server.state.ProjectsManager
import com.opticdev.server.storage.ServerStorage
import org.scalatest.FunSpec

import scala.concurrent.ExecutionContext.Implicits.global

class ContextQuerySpec extends AkkaTestFixture("ContextQuerySpec") with ProjectsManagerFixture {

  it("finds context for file/range pair") {
    implicit val projectsManager = instanceWatchingTestProject
    val cq = new ContextQuery(File("test-examples/resources/test_project/app.js"), Range(12, 35))
    cq.execute.onComplete(i=> {
      println(i)
    })
  }

  it("will fail if project doesn't exist") {
    implicit val projectsManager = projectsManagerWithStorage(ServerStorage(Map("test" -> "test-examples/resources/tmp/test_project")))
    val cq = new ContextQuery(File("not/real/file"), Range(12, 35))
    cq.execute.onComplete(i=> {
      assert(i.isFailure)
    })
  }

}
