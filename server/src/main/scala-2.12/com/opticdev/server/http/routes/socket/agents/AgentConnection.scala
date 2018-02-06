package com.opticdev.server.http.routes.socket.agents

import akka.actor.{ActorSystem, PoisonPill, Props}
import akka.pattern.ask
import akka.stream.OverflowStrategy
import akka.stream.scaladsl.{Flow, Sink, Source}
import akka.util.Timeout
import better.files.File
import com.opticdev.server.http.routes.socket.{Connection, ConnectionManager, OpticEvent}
import play.api.libs.json.{JsNumber, JsObject, JsString, Json}
import com.opticdev.server.http.routes.socket.agents.Protocol._
import com.opticdev.server.http.routes.socket.editors.EditorConnection._
import com.opticdev.server.state.ProjectsManager

import scala.concurrent.Await
import scala.concurrent.duration._
import scala.util.Try

class AgentConnection(slug: String, actorSystem: ActorSystem)(implicit projectsManager: ProjectsManager) extends Connection {

  private[this] val connectionActor = actorSystem.actorOf(Props(classOf[AgentConnectionActor], slug, projectsManager))

  def chatInSink(sender: String) = Sink.actorRef[AgentEvents](connectionActor, Terminated())

  def sendUpdate(event: UpdateAgentEvent) = {
    connectionActor ! event
  }

  override def websocketFlow = {
    val in =
      Flow[String]
        .map(i=> {
          val parsedTry = Try(Json.parse(i).as[JsObject])
          val eventTry  = Try(parsedTry.get.value("event").as[JsString].value)
          val message = if (eventTry.isSuccess) {
            eventTry.get match {
              case "put-update" => {
                val idTry = Try( (parsedTry.get \ "id").get.as[JsString].value )
                val newValueTry = Try( (parsedTry.get \ "newValue").get.as[JsObject] )
                if (idTry.isSuccess && newValueTry.isSuccess) {
                  PutUpdate(idTry.get, newValueTry.get)
                } else UnknownEvent(i)
              }

              case "search" => {

                val queryTry  = Try(parsedTry.get.value("query").as[JsString].value)

                val fileOption = Try(File(parsedTry.get.value("file").as[JsString].value)).toOption
                val rangeOption = Try {
                  val start = parsedTry.get.value("start").as[JsNumber].value.toInt
                  val end = parsedTry.get.value("end").as[JsNumber].value.toInt
                  Range(start, end)
                }.toOption

                if (queryTry.isSuccess) {
                  AgentSearch(queryTry.get, None, fileOption, rangeOption)
                } else {
                  UnknownEvent(i)
                }

              }

              //does not receive anything from agent...yet
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

object AgentConnection extends ConnectionManager[AgentConnection] {
  override def apply(slug: String)(implicit actorSystem: ActorSystem, projectsManager: ProjectsManager) = {
    println(slug+" agent connected")
    new AgentConnection(slug, actorSystem)
  }

  def broadcastUpdate(update: UpdateAgentEvent) = listConnections.foreach(i=> i._2.sendUpdate(update))

  def killAgent(slug: String) = {
    val connectionOption = connections.get(slug)
    if (connectionOption.isDefined) {
      connectionOption.get.poison
      connections -= slug
    }
  }
}
