package com.opticdev.server.http

import java.net.BindException

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Directives._
import akka.stream.ActorMaterializer
import com.opticdev.core.actorSystem
import com.opticdev.server.state.ProjectsManager

import scala.io.StdIn
object Server {

  def start()(implicit projectsManager: ProjectsManager) {

    implicit val materializer = ActorMaterializer()
    // needed for the future flatMap/onComplete in the end
    implicit val executionContext = actorSystem.dispatcher

    val httpService = new HttpService()

    //@todo make this fail with an exception
    val future = Http().bindAndHandle(httpService.routes, "localhost", 30333)
    future.onComplete(i=> {
      if (i.isSuccess) println(s"Server online at http://localhost:30333/\nPress RETURN to stop...")
      else throw i.failed.get
    })

  }

}
