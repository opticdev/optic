package com.useoptic.proxy

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.stream.ActorMaterializer
import com.useoptic.proxy.services.control.ControlRouter
import com.useoptic.proxy.services.proxy.ProxyRouter

import scala.concurrent.duration._
import scala.concurrent.Await

object Lifecycle {

  implicit val actorSystem = ActorSystem("optic-proxy")
  implicit val materializer = ActorMaterializer()
  implicit val executionContext = actorSystem.dispatcher

  def main(args: Array[String]): Unit = {
    startProxyServer
    startControlServer
  }

  def startControlServer = {
    val future = Http().bindAndHandle(ControlRouter.routes, "localhost", 30334)
    val a = Await.result(future, 10 seconds)
    println("Started Control Service on localhost:30334")
  }


  def startProxyServer = {
    val future = Http().bindAndHandle(ProxyRouter.routes, "localhost", 30333)
    val a = Await.result(future, 10 seconds)
    println("Started Proxy on localhost:30333")
  }

}
