package com.opticdev.server.http

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Directives._
import akka.stream.ActorMaterializer
import com.opticdev.server.http.state.StateManager

import scala.io.StdIn
object Server {

  def main(args: Array[String] = Array())(implicit stateManager: StateManager) {

    implicit val actorSystem = ActorSystem("my-system")
    implicit val materializer = ActorMaterializer()
    // needed for the future flatMap/onComplete in the end
    implicit val executionContext = actorSystem.dispatcher

    val httpService = new HttpService()

    val bindingFuture = Http().bindAndHandle(httpService.routes, "localhost", 30333)

    println(s"Server online at http://localhost:30333/\nPress RETURN to stop...")
    StdIn.readLine() // let it run until user presses return
    bindingFuture
      .flatMap(_.unbind()) // trigger unbinding from the port
      .onComplete(_ => actorSystem.terminate()) // and shutdown when done
  }

}
