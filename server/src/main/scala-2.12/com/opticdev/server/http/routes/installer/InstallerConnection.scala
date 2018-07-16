package com.opticdev.server.http.routes.installer

import akka.NotUsed
import akka.actor.{ActorSystem, PoisonPill, Props}
import akka.stream.OverflowStrategy
import akka.stream.scaladsl.{Flow, Sink, Source}
import better.files.File
import com.opticdev.server.http.routes.installer.installer.Protocol._
import com.opticdev.server.http.routes.socket.{Connection, ConnectionManager, OpticEvent, SocketRouteOptions}
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json._

import scala.util.Try

class InstallerConnection(actorSystem: ActorSystem)(implicit projectsManager: ProjectsManager) extends Connection {

  private[this] val connectionActor = actorSystem.actorOf(Props(classOf[InstallerConnectionActor]))

  def chatInSink(sender: String) = Sink.actorRef[InstallerEvents](connectionActor, Terminated())

  def sendUpdate(event: UpdateInstallerEvent) = {
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
              case "install-ide-plugins" => {
                val skip = Try((parsedTry.get \ "skip").as[JsArray].value.collect { case x: JsString => x.value }.toSeq).getOrElse(Seq())
                InstallIDEPlugins(skip)
              }

              case _ => UnknownEvent(i)
            }
          } else UnknownEvent(i)

          message
        })
        .to(chatInSink("installer"))

    val out =
      Source.actorRef[OpticEvent](1, OverflowStrategy.fail)
        .mapMaterializedValue(connectionActor ! Registered(_))

    Flow.fromSinkAndSource(in, out)
  }

  def poison = connectionActor ! PoisonPill

}

object InstallerConnection extends ConnectionManager[InstallerConnection] {

  override def apply(slug: String, socketRouteOptions: SocketRouteOptions)(implicit actorSystem: ActorSystem, projectsManager: ProjectsManager) = {
    println("installer connected")
    new InstallerConnection(actorSystem)
  }

  def broadcastUpdate(update: UpdateInstallerEvent) = listConnections.foreach(i=> i._2.sendUpdate(update))
  def broadcastUpdateTo(editorSlug: String, update: UpdateInstallerEvent) = listConnections.get(editorSlug).foreach(_.sendUpdate(update))

  def killInstallers() = {
    connections = Map()
  }
}

