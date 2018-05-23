package com.opticdev.server.http

import java.net.BindException

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Directives._
import akka.stream.ActorMaterializer
import com.opticdev.core.actorSystem
import com.opticdev.server.state.ProjectsManager

import scala.concurrent.Await
import scala.io.StdIn
import scala.concurrent.duration._
object Server {

  def start()(implicit projectsManager: ProjectsManager) {

    implicit val materializer = ActorMaterializer()
    // needed for the future flatMap/onComplete in the end
    implicit val executionContext = actorSystem.dispatcher

    val httpService = new HttpService()

    val future = Http().bindAndHandle(httpService.routes, "localhost", 30333)

    Await.result(future, 10 seconds)

    println("Server Started on localhost:30333")
  }

}
