package com.opticdev.server.http.routes.socket.debuggers

import akka.NotUsed
import akka.actor.{ActorSystem, PoisonPill, Props}
import akka.pattern.ask
import akka.stream.OverflowStrategy
import akka.stream.scaladsl.{Flow, Sink, Source}
import akka.util.Timeout
import better.files.File
import com.opticdev.server.http.routes.socket.debuggers.debuggers.Protocol._
import com.opticdev.server.http.routes.socket.{Connection, ConnectionManager, OpticEvent, SocketRouteOptions}
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json.{JsNumber, JsObject, JsString, Json}

import scala.concurrent.Await
import scala.concurrent.duration._
import scala.util.Try

class DebuggerConnection(slug: String, actorSystem: ActorSystem)(implicit projectsManager: ProjectsManager) extends Connection {

  private[this] val connectionActor = actorSystem.actorOf(Props(classOf[DebuggerConnectionActor], slug, projectsManager))

  def chatInSink(sender: String) = Sink.actorRef[DebuggerEvents](connectionActor, Terminated())

  def sendUpdate(event: UpdateDebuggerEvent) = {
    connectionActor ! event
  }

  override def websocketFlow: Flow[String, OpticEvent, NotUsed] = {
    val in =
      Flow[String]
        .map(i=> {
          val parsedTry = Try(Json.parse(i).as[JsObject])
          val eventTry  = Try(parsedTry.get.value("event").as[JsString].value)
          val message = if (eventTry.isSuccess) {
            eventTry.get match {
              case _ => UnknownEvent(i)
            }
          } else UnknownEvent(i)

          message
        })
        .to(chatInSink(slug))

    val out =
      Source.actorRef[OpticEvent](1, OverflowStrategy.fail)
        .mapMaterializedValue(connectionActor ! Registered(_))

    Flow.fromSinkAndSource(in, out)
  }

  def poison = connectionActor ! PoisonPill

}

object DebuggerConnection extends ConnectionManager[DebuggerConnection] {

  override def apply(slug: String, socketRouteOptions: SocketRouteOptions)(implicit actorSystem: ActorSystem, projectsManager: ProjectsManager) = {
    println(slug+" debugger connected")
    new DebuggerConnection(slug, actorSystem)
  }

  def broadcastUpdate(update: UpdateDebuggerEvent) = listConnections.foreach(i=> i._2.sendUpdate(update))

  def killDebugger(slug: String) = {
    println(slug+" debugger disconnected")
    val connectionOption = connections.get(slug)
    if (connectionOption.isDefined) {
      connectionOption.get.poison
      connections -= slug
    }
  }
}

