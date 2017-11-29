package com.opticdev.server.http.controllers

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.opm.TestPackageProviders
import com.opticdev.server.Fixture.ProjectsManagerFixture
import com.opticdev.server.state.ProjectsManager
import com.opticdev.server.storage.ServerStorage
import org.scalatest.FunSpec

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Await, Promise}
import scala.concurrent.duration._
class ContextQuerySpec extends AkkaTestFixture("ContextQuerySpec") with ProjectsManagerFixture with TestPackageProviders {

  it("finds context for file/range pair") {
    val future = instanceWatchingTestProject.flatMap(pm=> {
      implicit val projectsManager: ProjectsManager = pm

      val cq = new ContextQuery(File("test-examples/resources/test_project/app.js"), Range(35, 37))
      cq.execute
    })

    val result = Await.result(future, 10 seconds)

    println(result)

//    instanceWatchingTestProject((pm)=> {
//      implicit val projectsManager = pm
//      val cq = new ContextQuery(File("test-examples/resources/test_project/app.js"), Range(12, 35))
//
//      cq.execute.onComplete(i=> {
//        println(i)
//      })
//
//    })
  }

  it("will fail if project doesn't exist") {
    implicit val projectsManager = projectsManagerWithStorage(ServerStorage(Map("test" -> "test-examples/resources/tmp/test_project")))
    val cq = new ContextQuery(File("not/real/file"), Range(12, 35))
    cq.execute.onComplete(i=> {
      assert(i.isFailure)
    })
  }

}
