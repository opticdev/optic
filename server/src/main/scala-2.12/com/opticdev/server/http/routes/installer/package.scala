package com.opticdev.server.http.routes.installer

import akka.actor.ActorRef
import better.files.File
import com.opticdev.core.sourcegear.project.monitoring.StagedContent
import com.opticdev.server.http.routes.socket.OpticEvent
import com.opticdev.server.http.routes.socket.agents.Protocol.AgentEvents
import play.api.libs.json._

package object installer {

  object Protocol {
    //Receives
    sealed trait InstallerEvents

    case class Registered(actor: ActorRef) extends InstallerEvents
    case class Terminated() extends InstallerEvents
    case class UnknownEvent(raw: String) extends InstallerEvents

    case class InstallIDEPlugins(skip: Seq[String]) extends InstallerEvents

    //Emits
    sealed trait UpdateInstallerEvent extends OpticEvent

    case class FoundIDEs(ides: Seq[String]) extends OpticEvent {
      override def asJson: JsValue = JsObject(Seq(
        "event"-> JsString("found-ides"),
        "ides"-> JsArray(ides.map(JsString)),
      ))
    }

    case class InstalledIDEs(installedIDEs: Map[String, Boolean]) extends OpticEvent {
      override def asJson: JsValue = JsObject(Seq(
        "event"-> JsString("installed-ides"),
        "results"-> JsObject(installedIDEs.map {case (name, status) => name -> JsBoolean(status)}),
      ))
    }

  }

}
