package com.opticdev.server.http.routes.installer

import akka.actor.{Actor, ActorRef, Status}
import com.opticdev.installer.IDEInstaller
import com.opticdev.server.http.routes.installer.installer.Protocol._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


class InstallerConnectionActor() extends Actor {

  private var connection : ActorRef = null

  override def receive: Receive = {
    case Registered(actorRef) => {
      connection = actorRef
      Future(FoundIDEs(IDEInstaller.findInstalledIDEs.keys.toSeq.sorted))
        .foreach(foundIdes=> connection ! foundIdes)
    }

    case Terminated => {
      Status.Success(Unit)
      InstallerConnection.killInstallers()
    }

    case InstallIDEPlugins(skip) => {
      Future(IDEInstaller.installIDEs(skip:_*))
        .foreach(results=> connection ! InstalledIDEs(results))
    }

  }

}
