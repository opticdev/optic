package com.opticdev.server.http.routes.socket

import akka.actor.{ActorSystem, PoisonPill, Props}
import akka.stream.OverflowStrategy
import akka.stream.scaladsl.{Flow, Sink, Source}
import akka.util.Timeout
import com.opticdev.server.http.routes.socket.Protocol._
import play.api.libs.json.{JsNumber, JsObject, JsString, Json}
import scala.concurrent.Await
import scala.concurrent.duration._
import scala.util.Try
import akka.pattern.ask

class EditorConnection(slug: String, actorSystem: ActorSystem) {

  private[this] val connectionActor = actorSystem.actorOf(Props(classOf[EditorConnectionActor], slug))

  def chatInSink(sender: String) = Sink.actorRef[EditorEvents](connectionActor, Terminated())

  def information : EditorConnection.EditorInformation = {
    implicit val timeout = Timeout(5 seconds)
    val future = connectionActor ? GetMetaInformation()
    Await.result(future, timeout.duration).asInstanceOf[EditorConnection.EditorInformation]
  }

  def sendUpdate(event: UpdateOpticEvent) = {
    connectionActor ! event
  }

  def websocketFlow = {
    val in =
      Flow[String]
        .map(i=> {
          val parsedTry = Try(Json.parse(i).as[JsObject])
          val eventTry  = Try(parsedTry.get.value.get("event").get.as[JsString].value)
          val message = if (eventTry.isSuccess) {
            eventTry.get match {
              case "search" => {
                val queryTry  = Try(parsedTry.get.value.get("query").get.as[JsString].value)
                if (queryTry.isSuccess) Search(queryTry.get) else UnknownEvent(i)
              }
              case "updateMeta" => {
                val nameTry  = Try(parsedTry.get.value.get("name").get.as[JsString].value)
                val versionTry  = Try(parsedTry.get.value.get("version").get.as[JsString].value)
                if (nameTry.isSuccess && versionTry.isSuccess) UpdateMetaInformation(nameTry.get, versionTry.get) else UnknownEvent(i)
              }
              case "context" => {
                val fileTry = Try(parsedTry.get.value.get("file").get.as[JsString].value)
                val startTry = Try(parsedTry.get.value.get("start").get.as[JsNumber].value.toInt)
                val endTry = Try(parsedTry.get.value.get("end").get.as[JsNumber].value.toInt)

                if (fileTry.isSuccess && startTry.isSuccess && endTry.isSuccess)
                  Context(fileTry.get, startTry.get, endTry.get) else UnknownEvent(i)
              }
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

object EditorConnection {
  case class EditorInformation(name: String, version: String)
  def apply(slug: String)(implicit actorSystem: ActorSystem) = new EditorConnection(slug, actorSystem)


  private var connections: Map[String, EditorConnection] = Map()

  def listConnections = connections

  def findOrCreate(slug: String)(implicit actorSystem: ActorSystem): EditorConnection = {
    connections.getOrElse(slug, createEditorConnection(slug))
  }

  private def createEditorConnection(slug: String)(implicit actorSystem: ActorSystem): EditorConnection = {
    val connection = EditorConnection(slug)
    connections += slug -> connection
    connection
  }

  def killEditor(slug: String) = {
    val connectionOption = connections.get(slug)
    if (connectionOption.isDefined) {
      connectionOption.get.poison
      connections -= slug
    }
  }

}

